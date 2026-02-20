/**
 * HTML parser for Philippine legislation from LawPhil (lawphil.net)
 *
 * LawPhil serves each act as a single HTML page containing the full text.
 * Philippine legislation uses US-influenced legal formatting:
 *
 *   - "Section X." or "Sec. X." for provision numbering
 *   - "CHAPTER I", "CHAPTER II" for chapter groupings
 *   - Definitions typically in "Section 3. Definition of Terms"
 *   - English is the primary language of law and courts
 *
 * The HTML is relatively simple -- mostly <p>, <br>, and <b>/<strong> tags
 * without complex nested structures. Section headers are typically bold text
 * containing "Section N." or "SEC. N." patterns.
 *
 * provision_ref format: "sec1", "sec2", "sec3a" (lowercase, no dots)
 */

export interface ActIndexEntry {
  id: string;
  title: string;
  titleEn: string;
  shortName: string;
  status: 'in_force' | 'amended' | 'repealed' | 'not_yet_in_force';
  issuedDate: string;
  inForceDate: string;
  url: string;
  description?: string;
}

export interface ParsedProvision {
  provision_ref: string;
  chapter?: string;
  section: string;
  title: string;
  content: string;
}

export interface ParsedDefinition {
  term: string;
  definition: string;
  source_provision?: string;
}

export interface ParsedAct {
  id: string;
  type: 'statute';
  title: string;
  title_en: string;
  short_name: string;
  status: 'in_force' | 'amended' | 'repealed' | 'not_yet_in_force';
  issued_date: string;
  in_force_date: string;
  url: string;
  description?: string;
  provisions: ParsedProvision[];
  definitions: ParsedDefinition[];
}

/**
 * Strip HTML tags and decode common entities, normalising whitespace.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#xA0;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/\u200B/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
}

/**
 * Parse Philippine legislation HTML from LawPhil into structured provisions.
 *
 * The parser splits the HTML on "Section X." / "Sec. X." / "SEC. X." boundaries,
 * then extracts the section number, title, and content for each provision.
 * It also tracks CHAPTER/TITLE headings for the chapter field.
 */
export function parsePhilippineHtml(html: string, act: ActIndexEntry): ParsedAct {
  const provisions: ParsedProvision[] = [];
  const definitions: ParsedDefinition[] = [];

  // Strip everything outside the <body> to reduce noise
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;

  // Track current chapter/title as we scan through the text
  let currentChapter = '';

  // Split on section boundaries.
  // Philippine acts use: "Section 1.", "Sec. 1.", "SEC. 1.", "SECTION 1."
  // Some older acts (like Act No. 3815) may use "Art. 1." or "Article 1."
  // The pattern captures the section marker, number, and everything after.
  const sectionPattern = /(?:^|\n)\s*(?:<[^>]*>\s*)*(?:(?:Section|Sec\.|SEC\.|SECTION)\s+(\d+[A-Za-z]*)\.?\s*|(?:Article|Art\.|ART\.|ARTICLE)\s+(\d+[A-Za-z]*)\.?\s*)/gi;

  // Find all section start positions
  const sectionStarts: { index: number; sectionNum: string; matchLength: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = sectionPattern.exec(bodyHtml)) !== null) {
    const sectionNum = (match[1] ?? match[2] ?? '').trim();
    if (sectionNum) {
      sectionStarts.push({
        index: match.index,
        sectionNum,
        matchLength: match[0].length,
      });
    }
  }

  // Extract chapter headings from the full text
  // Philippine acts use "CHAPTER I", "CHAPTER II", "TITLE I", etc.
  const chapterPattern = /(?:<[^>]*>\s*)*(CHAPTER|TITLE)\s+([IVXLCDM]+|[0-9]+)\b[\s\S]*?(?:\n|<br[^>]*>)/gi;
  const chapters: { index: number; name: string }[] = [];
  let chapterMatch: RegExpExecArray | null;

  while ((chapterMatch = chapterPattern.exec(bodyHtml)) !== null) {
    // Try to extract the chapter title from the next line/element
    const afterChapter = bodyHtml.substring(
      chapterMatch.index + chapterMatch[0].length,
      Math.min(chapterMatch.index + chapterMatch[0].length + 300, bodyHtml.length),
    );
    const titleLine = stripHtml(afterChapter.split(/\n|<br/i)[0] ?? '').trim();
    const chapterLabel = `${chapterMatch[1]} ${chapterMatch[2]}`.toUpperCase();
    const chapterName = titleLine ? `${chapterLabel} - ${titleLine}` : chapterLabel;
    chapters.push({ index: chapterMatch.index, name: chapterName });
  }

  // Process each section
  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i];
    const nextStart = i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : bodyHtml.length;

    // Update current chapter based on position
    for (const ch of chapters) {
      if (ch.index <= start.index) {
        currentChapter = ch.name;
      }
    }

    // Extract the raw HTML for this section
    const sectionHtml = bodyHtml.substring(start.index, nextStart);

    // Extract the title: text on the same line as "Section N." up to the first period or newline
    // after the section marker
    const afterMarker = sectionHtml.substring(start.matchLength);
    const titleText = stripHtml(afterMarker.split(/\n/)[0] ?? '');

    // The title is usually formatted as "Section N. Title Here. -" or "Section N. Title. -"
    // Extract text before the first dash or period that ends the title
    let title = '';
    const titleMatch = titleText.match(/^([^.]+)\./);
    if (titleMatch) {
      title = titleMatch[1].replace(/^\s*[-\u2013\u2014]\s*/, '').trim();
    } else {
      // Fallback: use the first line as title
      title = titleText.replace(/^\s*[-\u2013\u2014]\s*/, '').trim().substring(0, 200);
    }

    // Clean title: remove leading dashes/dots
    title = title.replace(/^[-.\s]+/, '').trim();

    // Full content is the stripped text of the entire section
    const content = stripHtml(sectionHtml);

    const sectionNum = start.sectionNum;
    const provisionRef = `sec${sectionNum.toLowerCase()}`;

    if (content.length > 10) {
      provisions.push({
        provision_ref: provisionRef,
        chapter: currentChapter || undefined,
        section: sectionNum,
        title,
        content: content.substring(0, 12000), // Cap at 12K chars
      });
    }

    // Extract definitions from definition sections
    // Philippine acts typically have "Definition of Terms" in sections 3-5
    if (
      title.toLowerCase().includes('definition') ||
      title.toLowerCase().includes('interpretation') ||
      title.toLowerCase().includes('terms')
    ) {
      extractDefinitions(content, provisionRef, definitions);
    }
  }

  // Deduplicate provisions by provision_ref (keep longest content)
  const byRef = new Map<string, ParsedProvision>();
  for (const prov of provisions) {
    const existing = byRef.get(prov.provision_ref);
    if (!existing || prov.content.length > existing.content.length) {
      byRef.set(prov.provision_ref, prov);
    }
  }

  // Deduplicate definitions by term (keep longest)
  const byTerm = new Map<string, ParsedDefinition>();
  for (const def of definitions) {
    const existing = byTerm.get(def.term.toLowerCase());
    if (!existing || def.definition.length > existing.definition.length) {
      byTerm.set(def.term.toLowerCase(), def);
    }
  }

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
    provisions: Array.from(byRef.values()),
    definitions: Array.from(byTerm.values()),
  };
}

/**
 * Extract term definitions from a definition section.
 *
 * Philippine legislation typically uses the pattern:
 *   (a) "Term" refers to / means / shall mean ...
 *   (b) "Another Term" refers to ...
 *
 * Or sometimes without letter prefixes:
 *   "Personal information" refers to any information...
 */
function extractDefinitions(
  text: string,
  sourceProvision: string,
  definitions: ParsedDefinition[],
): void {
  // Match patterns:
  //   "Term" refers to / means / shall mean / includes ...
  //   (a) "Term" - definition text
  //   (a) Term - definition text
  const defPattern = /(?:\([a-z0-9]+\)\s*)?["\u201C]([^"\u201D]+)["\u201D]\s*(?:refers to|means|shall mean|shall refer to|includes|has the meaning|is|are)\s+([^;]+[;.])/gi;
  let match: RegExpExecArray | null;

  while ((match = defPattern.exec(text)) !== null) {
    const term = match[1].trim();
    const definition = match[2].replace(/[;.]$/, '').trim();
    if (term.length > 0 && term.length < 100 && definition.length > 5) {
      definitions.push({
        term,
        definition: definition.substring(0, 4000),
        source_provision: sourceProvision,
      });
    }
  }
}

/**
 * Pre-configured list of key Philippine laws to ingest.
 *
 * Source: LawPhil (lawphil.net) - Arellano Law Foundation
 * URL pattern: https://lawphil.net/statutes/repacts/ra{year}/ra_{number}_{year}.html
 *
 * The Philippines uses Republic Act (RA) numbering for legislation passed by
 * Congress. Older laws use Act No. (e.g., Revised Penal Code is Act No. 3815).
 * The 1987 Constitution has its own dedicated section on LawPhil.
 */
export const KEY_PHILIPPINE_ACTS: ActIndexEntry[] = [
  {
    id: 'ra-10173-data-privacy-act',
    title: 'Data Privacy Act of 2012',
    titleEn: 'Data Privacy Act of 2012',
    shortName: 'RA 10173',
    status: 'in_force',
    issuedDate: '2012-08-15',
    inForceDate: '2012-09-08',
    url: 'https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html',
    description:
      'Comprehensive data protection law establishing the National Privacy Commission (NPC); protects individual personal information in information and communications systems',
  },
  {
    id: 'ra-10175-cybercrime-prevention',
    title: 'Cybercrime Prevention Act of 2012',
    titleEn: 'Cybercrime Prevention Act of 2012',
    shortName: 'RA 10175',
    status: 'in_force',
    issuedDate: '2012-09-12',
    inForceDate: '2012-10-03',
    url: 'https://lawphil.net/statutes/repacts/ra2012/ra_10175_2012.html',
    description:
      'Defines and penalises cybercrimes including illegal access, data interference, cybersex, child pornography, identity theft, and online libel',
  },
  {
    id: 'ra-11934-sim-registration',
    title: 'SIM Registration Act',
    titleEn: 'SIM Registration Act',
    shortName: 'RA 11934',
    status: 'in_force',
    issuedDate: '2022-10-10',
    inForceDate: '2022-12-27',
    url: 'https://lawphil.net/statutes/repacts/ra2022/ra_11934_2022.html',
    description:
      'Requires registration of all SIM cards and social media accounts with telecommunications providers; aimed at deterring crimes committed through mobile phones and the internet',
  },
  {
    id: 'ra-8792-e-commerce',
    title: 'Electronic Commerce Act of 2000',
    titleEn: 'Electronic Commerce Act of 2000',
    shortName: 'RA 8792',
    status: 'in_force',
    issuedDate: '2000-06-14',
    inForceDate: '2000-06-14',
    url: 'https://lawphil.net/statutes/repacts/ra2000/ra_8792_2000.html',
    description:
      'Provides legal recognition and admissibility of electronic documents, electronic signatures, and electronic commerce transactions',
  },
  {
    id: 'ra-11232-revised-corporation-code',
    title: 'Revised Corporation Code of the Philippines',
    titleEn: 'Revised Corporation Code of the Philippines',
    shortName: 'RA 11232',
    status: 'in_force',
    issuedDate: '2019-02-20',
    inForceDate: '2019-02-23',
    url: 'https://lawphil.net/statutes/repacts/ra2019/ra_11232_2019.html',
    description:
      'Modernised corporate governance framework; introduces perpetual corporate existence, one-person corporations, and remote board meetings',
  },
  {
    id: 'ra-7394-consumer-act',
    title: 'Consumer Act of the Philippines',
    titleEn: 'Consumer Act of the Philippines',
    shortName: 'RA 7394',
    status: 'in_force',
    issuedDate: '1992-04-13',
    inForceDate: '1992-04-13',
    url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7394_1992.html',
    description:
      'Comprehensive consumer protection legislation covering product quality, labelling, warranties, price regulation, and consumer redress',
  },
  {
    id: 'constitution-1987',
    title: '1987 Constitution of the Republic of the Philippines',
    titleEn: '1987 Constitution of the Republic of the Philippines',
    shortName: '1987 Constitution',
    status: 'in_force',
    issuedDate: '1987-02-02',
    inForceDate: '1987-02-02',
    url: 'https://lawphil.net/consti/cons1987.html',
    description:
      'Supreme law of the Philippines; Article III (Bill of Rights) protects privacy of communication and correspondence (Sec. 3), due process (Sec. 1), and freedom of expression (Sec. 4)',
  },
  {
    id: 'act-3815-revised-penal-code',
    title: 'Revised Penal Code',
    titleEn: 'Revised Penal Code',
    shortName: 'Act No. 3815',
    status: 'in_force',
    issuedDate: '1930-12-08',
    inForceDate: '1932-01-01',
    url: 'https://lawphil.net/statutes/acts/act1930/act_3815_1930.html',
    description:
      'Primary criminal law of the Philippines; covers offences against persons, property, public interest, and public order; Articles relevant to computer fraud and electronic document forgery',
  },
  {
    id: 'ra-8484-access-devices-regulation',
    title: 'Access Devices Regulation Act of 1998',
    titleEn: 'Access Devices Regulation Act of 1998',
    shortName: 'RA 8484',
    status: 'in_force',
    issuedDate: '1998-02-11',
    inForceDate: '1998-02-11',
    url: 'https://lawphil.net/statutes/repacts/ra1998/ra_8484_1998.html',
    description:
      'Regulates access devices (credit cards, debit cards, account numbers); penalises fraud, counterfeiting, and unauthorised use of access devices',
  },
  {
    id: 'ra-9995-anti-voyeurism',
    title: 'Anti-Photo and Video Voyeurism Act of 2009',
    titleEn: 'Anti-Photo and Video Voyeurism Act of 2009',
    shortName: 'RA 9995',
    status: 'in_force',
    issuedDate: '2010-02-15',
    inForceDate: '2010-02-15',
    url: 'https://lawphil.net/statutes/repacts/ra2010/ra_9995_2010.html',
    description:
      'Prohibits taking, copying, reproducing, selling, or distributing photos, videos, or recordings of sexual acts without consent; addresses revenge porn and non-consensual intimate images',
  },
];
