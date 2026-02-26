#!/usr/bin/env tsx
/**
 * Philippine Law MCP — Census Script
 *
 * Enumerates ALL Republic Acts from the LawPhil Project (lawphil.net)
 * by scraping the main Republic Acts index page, which lists all 11,700+
 * Republic Acts from RA 1 (1946) to the most recent enactments.
 *
 * Also includes the 1987 Constitution and the Revised Penal Code (Act No. 3815)
 * as special entries.
 *
 * Writes data/census.json in golden standard format.
 *
 * Usage:
 *   npx tsx scripts/census.ts
 *
 * The index page is a single HTML table:
 *   <tr class="xy">
 *     <td><a href="ra2024/ra_12036_2024.html">Republic Act No. 12036</a><br>October 17, 2024</td>
 *     <td>An Act Creating Four (4) Additional Branches...</td>
 *     <td>...</td>
 *   </tr>
 *
 * Data sourced from LawPhil (Arellano Law Foundation) — Open Access.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRateLimit } from './lib/fetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const CENSUS_PATH = path.join(DATA_DIR, 'census.json');

const BASE_URL = 'https://lawphil.net/statutes/repacts/';

interface CensusLaw {
  id: string;
  raNumber: number;
  year: number;
  title: string;
  date: string;
  url: string;
  category: 'republic_act' | 'constitution' | 'act';
  classification: 'ingestable' | 'inaccessible' | 'metadata_only';
}

interface CensusOutput {
  generated_at: string;
  source: string;
  description: string;
  stats: {
    total: number;
    class_ingestable: number;
    class_inaccessible: number;
    class_metadata_only: number;
    republic_acts: number;
    special_entries: number;
    year_range: string;
  };
  ingestion?: {
    completed_at: string;
    total_laws: number;
    total_provisions: number;
    coverage_pct: string;
  };
  laws: CensusLaw[];
}

/**
 * Generate a kebab-case ID from the RA number and year.
 * e.g. (12036, 2024) -> "ra-12036"
 */
function raToId(raNumber: number): string {
  return `ra-${raNumber}`;
}

/**
 * Parse the month name to a zero-padded number.
 */
function parseMonth(month: string): string {
  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
  };
  return months[month.toLowerCase()] ?? '01';
}

/**
 * Parse a date string like "October 17, 2024" into "2024-10-17".
 */
function parseDate(dateStr: string): string {
  const match = dateStr.trim().match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (!match) return '';
  const [, month, day, year] = match;
  return `${year}-${parseMonth(month)}-${day.padStart(2, '0')}`;
}

/**
 * Strip HTML tags from text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse the Republic Acts index page and extract all RA entries.
 *
 * Each row has the pattern:
 *   <tr class="xy">
 *     <td><a href="ra{year}/ra_{number}_{year}.html">Republic Act No. {number}</a><br>{date}</td>
 *     <td>{title}</td>
 *     <td>...</td>
 *   </tr>
 */
function parseIndexPage(html: string): CensusLaw[] {
  const laws: CensusLaw[] = [];
  const seen = new Set<string>();

  // Match each table row containing a Republic Act link
  // Pattern: <td><a href="ra{year}/ra_{number}_{year}.html">Republic Act No. {number}</a><br>{date}</td><td>{title}</td>
  const rowRe = /<tr[^>]*>\s*<td>\s*<a\s+href="(ra\d{4}\/ra_(\d+)_(\d{4})\.html)"[^>]*>Republic Act No\.\s*(\d+)<\/a>\s*<br\s*\/?>\s*([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>/gi;

  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(html)) !== null) {
    const href = match[1];
    const raNumber = parseInt(match[4], 10);
    const year = parseInt(match[3], 10);
    const dateStr = match[5].trim();
    const rawTitle = stripHtml(match[6]);

    if (isNaN(raNumber) || isNaN(year)) continue;

    const id = raToId(raNumber);
    if (seen.has(id)) continue;
    seen.add(id);

    const url = `https://lawphil.net/statutes/repacts/${href}`;
    const date = parseDate(dateStr);

    laws.push({
      id,
      raNumber,
      year,
      title: rawTitle,
      date,
      url,
      category: 'republic_act',
      classification: 'ingestable',
    });
  }

  return laws;
}

async function main(): Promise<void> {
  console.log('Philippine Law MCP — Census');
  console.log('===========================\n');
  console.log('  Source:  LawPhil Project (lawphil.net)');
  console.log('  Method:  Republic Acts index page scrape');
  console.log('  License: Open Access (Arellano Law Foundation)\n');

  // Fetch the main Republic Acts index page
  process.stdout.write('  Fetching Republic Acts index...');
  const result = await fetchWithRateLimit(`${BASE_URL}`);

  if (result.status !== 200) {
    console.log(` HTTP ${result.status} — FATAL`);
    process.exit(1);
  }
  console.log(` OK (${(result.body.length / 1024).toFixed(0)} KB)`);

  // Parse the index page
  const laws = parseIndexPage(result.body);
  console.log(`  Parsed ${laws.length} Republic Acts from index`);

  // Add special entries: 1987 Constitution
  laws.push({
    id: 'constitution-1987',
    raNumber: 0,
    year: 1987,
    title: '1987 Constitution of the Republic of the Philippines',
    date: '1987-02-02',
    url: 'https://lawphil.net/consti/cons1987.html',
    category: 'constitution',
    classification: 'ingestable',
  });

  // Add special entry: Revised Penal Code (Act No. 3815)
  laws.push({
    id: 'act-3815-revised-penal-code',
    raNumber: 0,
    year: 1930,
    title: 'Revised Penal Code (Act No. 3815)',
    date: '1930-12-08',
    url: 'https://lawphil.net/statutes/acts/act1930/act_3815_1930.html',
    category: 'act',
    classification: 'ingestable',
  });

  // Sort by raNumber descending (newest first), with special entries at end
  laws.sort((a, b) => {
    if (a.category !== 'republic_act' && b.category === 'republic_act') return 1;
    if (a.category === 'republic_act' && b.category !== 'republic_act') return -1;
    return b.raNumber - a.raNumber;
  });

  // Build census output
  const raCount = laws.filter(l => l.category === 'republic_act').length;
  const specialCount = laws.filter(l => l.category !== 'republic_act').length;
  const years = laws.filter(l => l.category === 'republic_act').map(l => l.year);
  const minYear = years.length > 0 ? Math.min(...years) : 0;
  const maxYear = years.length > 0 ? Math.max(...years) : 0;

  const census: CensusOutput = {
    generated_at: new Date().toISOString(),
    source: 'lawphil.net (LawPhil Project — Arellano Law Foundation)',
    description: 'Full census of Philippine Republic Acts, the 1987 Constitution, and the Revised Penal Code',
    stats: {
      total: laws.length,
      class_ingestable: laws.filter(l => l.classification === 'ingestable').length,
      class_inaccessible: laws.filter(l => l.classification === 'inaccessible').length,
      class_metadata_only: laws.filter(l => l.classification === 'metadata_only').length,
      republic_acts: raCount,
      special_entries: specialCount,
      year_range: `${minYear}-${maxYear}`,
    },
    laws,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2) + '\n');

  console.log(`\n${'='.repeat(50)}`);
  console.log('CENSUS COMPLETE');
  console.log('='.repeat(50));
  console.log(`  Total laws discovered:  ${laws.length}`);
  console.log(`  Republic Acts:          ${raCount}`);
  console.log(`  Special entries:        ${specialCount}`);
  console.log(`  Year range:             ${minYear}-${maxYear}`);
  console.log(`  Ingestable:             ${census.stats.class_ingestable}`);
  console.log(`  Inaccessible:           ${census.stats.class_inaccessible}`);
  console.log(`  Metadata only:          ${census.stats.class_metadata_only}`);
  console.log(`\n  Output: ${CENSUS_PATH}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
