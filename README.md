# Philippine Law MCP

[![npm](https://img.shields.io/npm/v/@ansvar/philippine-law-mcp)](https://www.npmjs.com/package/@ansvar/philippine-law-mcp)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/Ansvar-Systems/philippine-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/philippine-law-mcp/actions/workflows/ci.yml)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-green)](https://registry.modelcontextprotocol.io/)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/Ansvar-Systems/philippine-law-mcp)](https://securityscorecards.dev/viewer/?uri=github.com/Ansvar-Systems/philippine-law-mcp)

A Model Context Protocol (MCP) server providing comprehensive access to Philippine legislation, including the Data Privacy Act 2012, Cybercrime Prevention Act 2012, SIM Registration Act 2022, E-Commerce Act 2000, Revised Corporation Code 2019, and Consumer Act with full-text search.

## Deployment Tier

**SMALL** -- Single tier, bundled SQLite database shipped with the npm package.

**Estimated database size:** ~60-120 MB (full corpus of Philippine federal legislation)

## Key Legislation Covered

| Law | RA Number | Year | Significance |
|-----|-----------|------|-------------|
| **Data Privacy Act** | RA 10173 | 2012 | Comprehensive data protection law; NPC is one of the most active Asian DPAs |
| **Cybercrime Prevention Act** | RA 10175 | 2012 | Cyber offences, online libel, law enforcement powers for cybercrime |
| **SIM Registration Act** | RA 11934 | 2022 | Mandatory SIM card registration with data privacy implications |
| **E-Commerce Act** | RA 8792 | 2000 | Legal recognition of electronic transactions, signatures, and documents |
| **Revised Corporation Code** | RA 11232 | 2019 | Modern corporate governance, One Person Corporations, directors' duties |
| **Consumer Act** | RA 7394 | 1992 | Consumer rights, product standards, unfair trade practices |
| **1987 Constitution** | - | 1987 | Supreme law; Article III Section 3 protects privacy of communication |

## Regulatory Context

- **Data Protection Supervisory Authority:** National Privacy Commission (NPC) -- one of the most active DPAs in Asia with significant enforcement actions
- **Cybercrime Enforcement:** Department of Justice - Office of Cybercrime, PNP Anti-Cybercrime Group
- **Philippines is actively seeking EU GDPR adequacy status** for the Data Privacy Act
- The Philippines uses Republic Act (RA) numbering for legislation passed by Congress
- English is the primary language of legislation and courts (alongside Filipino)
- The NPC issues Circulars and Advisory Opinions providing detailed compliance guidance
- Implementing Rules and Regulations (IRR) are issued for most major laws
- The Philippines is an ASEAN member with 110M+ people and a rapidly growing digital economy
- The 1987 Constitution provides strong privacy protections in Article III Section 3

## Data Sources

| Source | Authority | Method | Update Frequency | License | Coverage |
|--------|-----------|--------|-----------------|---------|----------|
| [LawPhil (lawphil.net)](https://lawphil.net) | Arellano Law Foundation | HTML Scrape | Weekly | Open Access | All Republic Acts, Commonwealth Acts, Presidential Decrees, Constitution |
| [Official Gazette](https://www.officialgazette.gov.ph) | Office of the President | HTML Scrape | Weekly | Government Open Data | Newly enacted laws, Executive Orders, Proclamations |

> Full provenance metadata: [`sources.yml`](./sources.yml)

## Installation

```bash
npm install -g @ansvar/philippine-law-mcp
```

## Usage

### As stdio MCP server

```bash
philippine-law-mcp
```

### In Claude Desktop / MCP client configuration

```json
{
  "mcpServers": {
    "philippine-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/philippine-law-mcp"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_provision` | Retrieve a specific section from a Philippine Republic Act or other legislation |
| `search_legislation` | Full-text search across all Philippine legislation |
| `get_provision_eu_basis` | Cross-reference lookup for international framework relationships (GDPR adequacy, ASEAN, etc.) |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run contract tests
npm run test:contract

# Run all validation
npm run validate

# Build database from sources
npm run build:db

# Start server
npm start
```

## Contract Tests

This MCP includes 12 golden contract tests covering:
- 4 article retrieval tests (DPA s3, Cybercrime Act s3, Corporation Code s1, E-Commerce Act s1)
- 3 search tests (personal information, cybercrime, electronic commerce)
- 2 citation roundtrip tests (official lawphil.net URL patterns)
- 1 cross-reference test (DPA to GDPR -- Philippines seeking EU adequacy)
- 2 negative tests (non-existent RA, malformed section)

Run with: `npm run test:contract`

## Philippine Legislation Numbering

The Philippines uses Republic Act (RA) numbering for legislation passed by Congress:

| RA Number | Name | Year |
|-----------|------|------|
| RA 10173 | Data Privacy Act | 2012 |
| RA 10175 | Cybercrime Prevention Act | 2012 |
| RA 11934 | SIM Registration Act | 2022 |
| RA 8792 | E-Commerce Act | 2000 |
| RA 11232 | Revised Corporation Code | 2019 |
| RA 7394 | Consumer Act | 1992 |

## Security

See [SECURITY.md](./SECURITY.md) for vulnerability disclosure policy.

Report data errors: [Open an issue](https://github.com/Ansvar-Systems/philippine-law-mcp/issues/new?template=data-error.md)

## License

Apache-2.0 -- see [LICENSE](./LICENSE)

---

Built by [Ansvar Systems](https://ansvar.eu) -- Cybersecurity compliance through AI-powered analysis.
