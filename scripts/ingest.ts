#!/usr/bin/env tsx
/**
 * Philippine Law MCP -- Ingestion Pipeline
 *
 * Fetches Philippine legislation from LawPhil (lawphil.net).
 * LawPhil is the most comprehensive free Philippine law database,
 * maintained by the Arellano Law Foundation.
 *
 * Usage:
 *   npm run ingest                    # Full ingestion
 *   npm run ingest -- --limit 5       # Test with 5 acts
 *   npm run ingest -- --skip-fetch    # Reuse cached HTML
 *
 * If fetching fails (network issues, server down), the pipeline generates
 * seed files with law metadata and any available provisions from cached HTML.
 *
 * Data source: lawphil.net (Arellano Law Foundation)
 * Format: HTML (well-structured, English text)
 * License: Open Access (government work product)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRateLimit } from './lib/fetcher.js';
import {
  parsePhilippineHtml,
  KEY_PHILIPPINE_ACTS,
  type ActIndexEntry,
  type ParsedAct,
} from './lib/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../data/source');
const SEED_DIR = path.resolve(__dirname, '../data/seed');

function parseArgs(): { limit: number | null; skipFetch: boolean } {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let skipFetch = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--skip-fetch') {
      skipFetch = true;
    }
  }

  return { limit, skipFetch };
}

/**
 * Create a metadata-only seed file when fetching/parsing fails.
 * This ensures the database still has the law entry even without provisions.
 */
function createFallbackSeed(act: ActIndexEntry): ParsedAct {
  return {
    id: act.id,
    type: 'statute',
    title: act.title,
    title_en: act.titleEn,
    short_name: act.shortName,
    status: act.status,
    issued_date: act.issuedDate,
    in_force_date: act.inForceDate,
    url: act.url,
    description: act.description,
    provisions: [],
    definitions: [],
  };
}

async function fetchAndParseActs(
  acts: ActIndexEntry[],
  skipFetch: boolean,
): Promise<void> {
  console.log(`\nProcessing ${acts.length} Philippine laws from lawphil.net...\n`);

  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  fs.mkdirSync(SEED_DIR, { recursive: true });

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let totalProvisions = 0;
  let totalDefinitions = 0;
  const results: {
    act: string;
    provisions: number;
    definitions: number;
    status: string;
  }[] = [];

  for (const act of acts) {
    const sourceFile = path.join(SOURCE_DIR, `${act.id}.html`);
    const seedFile = path.join(SEED_DIR, `${act.id}.json`);

    // Skip if seed already exists and we're in skip-fetch mode
    if (skipFetch && fs.existsSync(seedFile)) {
      const existing = JSON.parse(
        fs.readFileSync(seedFile, 'utf-8'),
      ) as ParsedAct;
      const provCount = existing.provisions?.length ?? 0;
      const defCount = existing.definitions?.length ?? 0;
      totalProvisions += provCount;
      totalDefinitions += defCount;
      results.push({
        act: act.shortName,
        provisions: provCount,
        definitions: defCount,
        status: 'cached',
      });
      skipped++;
      processed++;
      continue;
    }

    try {
      let html: string;

      if (fs.existsSync(sourceFile) && skipFetch) {
        html = fs.readFileSync(sourceFile, 'utf-8');
        console.log(
          `  Using cached ${act.shortName} (${act.id}) (${(html.length / 1024).toFixed(0)} KB)`,
        );
      } else {
        process.stdout.write(`  Fetching ${act.shortName} (${act.id})...`);

        try {
          const result = await fetchWithRateLimit(act.url);

          if (result.status !== 200) {
            console.log(` HTTP ${result.status}`);
            // Create fallback seed with metadata only
            const fallback = createFallbackSeed(act);
            fs.writeFileSync(seedFile, JSON.stringify(fallback, null, 2));
            console.log(`    -> Created fallback seed (metadata only)`);
            results.push({
              act: act.shortName,
              provisions: 0,
              definitions: 0,
              status: `HTTP ${result.status} (fallback)`,
            });
            failed++;
            processed++;
            continue;
          }

          html = result.body;
          fs.writeFileSync(sourceFile, html);
          console.log(` OK (${(html.length / 1024).toFixed(0)} KB)`);
        } catch (fetchError) {
          const msg =
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError);
          console.log(` FETCH FAILED: ${msg}`);
          // Create fallback seed with metadata only
          const fallback = createFallbackSeed(act);
          fs.writeFileSync(seedFile, JSON.stringify(fallback, null, 2));
          console.log(`    -> Created fallback seed (metadata only)`);
          results.push({
            act: act.shortName,
            provisions: 0,
            definitions: 0,
            status: `FETCH FAILED (fallback)`,
          });
          failed++;
          processed++;
          continue;
        }
      }

      const parsed = parsePhilippineHtml(html, act);
      fs.writeFileSync(seedFile, JSON.stringify(parsed, null, 2));
      totalProvisions += parsed.provisions.length;
      totalDefinitions += parsed.definitions.length;
      console.log(
        `    -> ${parsed.provisions.length} provisions, ${parsed.definitions.length} definitions extracted`,
      );
      results.push({
        act: act.shortName,
        provisions: parsed.provisions.length,
        definitions: parsed.definitions.length,
        status: 'OK',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ERROR parsing ${act.shortName}: ${msg}`);
      // Create fallback seed with metadata only
      const fallback = createFallbackSeed(act);
      const seedFile = path.join(SEED_DIR, `${act.id}.json`);
      fs.writeFileSync(seedFile, JSON.stringify(fallback, null, 2));
      console.log(`    -> Created fallback seed (metadata only)`);
      results.push({
        act: act.shortName,
        provisions: 0,
        definitions: 0,
        status: `ERROR (fallback): ${msg.substring(0, 60)}`,
      });
      failed++;
    }

    processed++;
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('Ingestion Report');
  console.log('='.repeat(70));
  console.log(`\n  Source:      lawphil.net (Arellano Law Foundation)`);
  console.log(`  License:     Open Access (government work product)`);
  console.log(`  Processed:   ${processed}`);
  console.log(`  Cached:      ${skipped}`);
  console.log(`  Failed:      ${failed}`);
  console.log(`  Total provisions:  ${totalProvisions}`);
  console.log(`  Total definitions: ${totalDefinitions}`);
  console.log(`\n  Per-Act breakdown:`);
  console.log(
    `  ${'Act'.padEnd(22)} ${'Provisions'.padStart(12)} ${'Definitions'.padStart(13)} ${'Status'.padStart(10)}`,
  );
  console.log(
    `  ${'-'.repeat(22)} ${'-'.repeat(12)} ${'-'.repeat(13)} ${'-'.repeat(10)}`,
  );
  for (const r of results) {
    console.log(
      `  ${r.act.padEnd(22)} ${String(r.provisions).padStart(12)} ${String(r.definitions).padStart(13)} ${r.status.padStart(10)}`,
    );
  }
  console.log('');
}

async function main(): Promise<void> {
  const { limit, skipFetch } = parseArgs();

  console.log('Philippine Law MCP -- Ingestion Pipeline');
  console.log('========================================\n');
  console.log(`  Source: LawPhil (lawphil.net)`);
  console.log(`  Maintainer: Arellano Law Foundation`);
  console.log(`  Format: HTML (English text)`);
  console.log(`  Rate limit: 500ms between requests`);

  if (limit) console.log(`  --limit ${limit}`);
  if (skipFetch) console.log(`  --skip-fetch`);

  const acts = limit
    ? KEY_PHILIPPINE_ACTS.slice(0, limit)
    : KEY_PHILIPPINE_ACTS;
  await fetchAndParseActs(acts, skipFetch);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
