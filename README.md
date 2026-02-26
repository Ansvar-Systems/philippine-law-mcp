# Philippine Law MCP Server

**The LawPhil alternative for the AI age.**

[![npm version](https://badge.fury.io/js/@ansvar%2Fphilippine-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/philippine-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Ansvar-Systems/philippine-law-mcp?style=social)](https://github.com/Ansvar-Systems/philippine-law-mcp)
[![CI](https://github.com/Ansvar-Systems/philippine-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/philippine-law-mcp/actions/workflows/ci.yml)
[![Daily Data Check](https://github.com/Ansvar-Systems/philippine-law-mcp/actions/workflows/check-updates.yml/badge.svg)](https://github.com/Ansvar-Systems/philippine-law-mcp/actions/workflows/check-updates.yml)

Query **11,600+ Philippine laws** -- from the Data Privacy Act and Cybercrime Prevention Act to the Revised Corporation Code, Consumer Act, and the 1987 Constitution -- directly from Claude, Cursor, or any MCP-compatible client.

If you're building legal tech, compliance tools, or doing Philippine legal research, this is your verified reference database.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Why This Exists

Philippine legal research is scattered across LawPhil, the Official Gazette, and various government agency sites. Whether you're:
- A **lawyer** validating citations in a brief or contract
- A **compliance officer** checking data privacy requirements under RA 10173
- A **legal tech developer** building tools on Philippine law
- A **researcher** analyzing regulatory trends across 78 years of Republic Acts

...you shouldn't need dozens of browser tabs and manual cross-referencing. Ask Claude. Get the exact provision. With context.

This MCP server makes Philippine law **searchable, cross-referenceable, and AI-readable**.

---

## Quick Start

### Use Remotely (No Install Needed)

> Connect directly to the hosted version -- zero dependencies, nothing to install.

**Endpoint:** `https://philippine-law-mcp.vercel.app/mcp`

| Client | How to Connect |
|--------|---------------|
| **Claude.ai** | Settings > Connectors > Add Integration > paste URL |
| **Claude Code** | `claude mcp add philippine-law --transport http https://philippine-law-mcp.vercel.app/mcp` |
| **Claude Desktop** | Add to config (see below) |
| **GitHub Copilot** | Add to VS Code settings (see below) |

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "philippine-law": {
      "type": "url",
      "url": "https://philippine-law-mcp.vercel.app/mcp"
    }
  }
}
```

**GitHub Copilot** -- add to VS Code `settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "philippine-law": {
      "type": "http",
      "url": "https://philippine-law-mcp.vercel.app/mcp"
    }
  }
}
```

### Use Locally (npm)

```bash
npx @ansvar/philippine-law-mcp
```

**Claude Desktop** -- add to `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

**Cursor / VS Code:**

```json
{
  "mcp.servers": {
    "philippine-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/philippine-law-mcp"]
    }
  }
}
```

## Example Queries

Once connected, just ask naturally:

- *"What does Section 3 of the Data Privacy Act say about personal information?"*
- *"Find all Republic Acts about cybercrime and penalties"*
- *"Is the Consumer Act (RA 7394) still in force?"*
- *"What are the privacy provisions in the 1987 Constitution?"*
- *"Search for provisions about electronic commerce and digital signatures"*
- *"What penalties does RA 10175 prescribe for identity theft?"*
- *"Find laws about SIM registration requirements"*
- *"Compare data protection provisions across Philippine privacy laws"*

---

## What's Included

| Category | Count | Details |
|----------|-------|---------|
| **Laws** | 11,600+ statutes | Republic Acts (1946-2024), Constitution, Revised Penal Code |
| **Provisions** | 80,000+ sections | Full-text searchable with FTS5 |
| **EU Cross-References** | Auto-extracted | References to EU directives/regulations found in statute text |
| **Database Size** | ~80 MB | Optimized SQLite, portable |
| **Daily Updates** | Automated | Freshness checks against LawPhil |

**Verified data only** -- every provision is sourced from LawPhil (Arellano Law Foundation). Zero LLM-generated content.

---

## Available Tools (15)

### Core Legal Research Tools (8)

| Tool | Description |
|------|-------------|
| `search_legislation` | FTS5 search across all provisions with BM25 ranking |
| `get_provision` | Retrieve specific provision by document ID + section |
| `validate_citation` | Validate citation against database (zero-hallucination check) |
| `build_legal_stance` | Aggregate citations from multiple statutes for a legal question |
| `format_citation` | Format citations per Philippine conventions (full/short/pinpoint) |
| `check_currency` | Check if statute is in force, amended, or repealed |
| `list_sources` | Data provenance, coverage scope, and limitations |
| `about` | Server metadata, dataset statistics, and freshness |

### EU Law Cross-Reference Tools (5)

| Tool | Description |
|------|-------------|
| `get_eu_basis` | Get EU directives/regulations referenced by a Philippine statute |
| `get_philippine_implementations` | Find Philippine laws referencing a specific EU act |
| `search_eu_implementations` | Search EU documents with Philippine reference counts |
| `get_provision_eu_basis` | Get EU law references for a specific provision |
| `validate_eu_compliance` | Check alignment status with EU frameworks |

---

## Data Sources & Freshness

All content is sourced from authoritative Philippine legal databases:

- **[LawPhil (lawphil.net)](https://lawphil.net)** -- The most comprehensive free Philippine law database, maintained by the Arellano Law Foundation
- **[Official Gazette](https://www.officialgazette.gov.ph)** -- Official publication of the Republic of the Philippines

### Automated Freshness Checks (Weekly)

A [weekly GitHub Actions workflow](.github/workflows/check-updates.yml) monitors all data sources for new legislation and amendments.

> Full provenance metadata: [`sources.yml`](./sources.yml)

---

## Philippine Legal System Context

- **Mixed legal system:** Civil law (Spanish heritage) + common law (American heritage) + customary/Islamic law (Bangsamoro)
- **Supreme law:** 1987 Constitution -- Article III Section 3 protects privacy of communication
- **Data Protection Authority:** National Privacy Commission (NPC) -- one of the most active DPAs in Asia
- **Primary language:** English (one of two official languages, alongside Filipino); all legislation in English
- **Numbering:** Republic Acts (RA) for legislation passed by Congress (RA 1 in 1946 through RA 12000+ in 2024)
- **Other statute types:** Presidential Decrees (PD), Executive Orders (EO), Batas Pambansa (BP), Commonwealth Acts (CA)
- **ASEAN member** with 110M+ people and rapidly growing digital economy
- **Seeking EU GDPR adequacy** for the Data Privacy Act (RA 10173)

---

## Security

This project uses multiple layers of automated security scanning:

| Scanner | What It Does | Schedule |
|---------|-------------|----------|
| **CodeQL** | Static analysis for security vulnerabilities | Weekly + PRs |
| **Semgrep** | SAST scanning (OWASP top 10, secrets, TypeScript) | Every push |
| **Gitleaks** | Secret detection across git history | Every push |
| **Trivy** | CVE scanning on filesystem and npm dependencies | Daily |
| **Socket.dev** | Supply chain attack detection | PRs |
| **OSSF Scorecard** | OpenSSF best practices scoring | Weekly |
| **Dependabot** | Automated dependency updates | Weekly |

See [SECURITY.md](SECURITY.md) for the full policy and vulnerability reporting.

---

## Important Disclaimers

### Legal Advice

> **THIS TOOL IS NOT LEGAL ADVICE**
>
> Statute text is sourced from LawPhil (Arellano Law Foundation). However:
> - This is a **research tool**, not a substitute for professional legal counsel
> - **Verify critical citations** against primary sources for court filings
> - **Implementing Rules and Regulations (IRR)** may not be included for all laws
> - **EU cross-references** are extracted from statute text, not EUR-Lex full text

**Before using professionally, read:** [DISCLAIMER.md](DISCLAIMER.md) | [PRIVACY.md](PRIVACY.md)

---

## Development

### Setup

```bash
git clone https://github.com/Ansvar-Systems/philippine-law-mcp
cd philippine-law-mcp
npm install
npm run build
npm test
```

### Running Locally

```bash
npm run dev                                       # Start MCP server
npx @anthropic/mcp-inspector node dist/index.js   # Test with MCP Inspector
```

### Data Management

```bash
npm run census                    # Enumerate all Philippine laws from LawPhil
npm run ingest                    # Ingest full corpus (census-driven)
npm run ingest -- --limit 5       # Test with 5 acts
npm run ingest -- --resume        # Resume from where you left off
npm run ingest -- --skip-fetch    # Reuse cached HTML
npm run build:db                  # Rebuild SQLite database from seed files
npm run check-updates             # Check for new legislation
```

### Contract Tests

12 golden contract tests covering:
- 4 article retrieval tests (DPA s3, Cybercrime Act s3, Corporation Code s1, E-Commerce Act s1)
- 3 search tests (personal information, cybercrime, electronic commerce)
- 2 citation roundtrip tests (official lawphil.net URL patterns)
- 1 cross-reference test (DPA to GDPR -- Philippines seeking EU adequacy)
- 2 negative tests (non-existent RA, malformed section)

Run with: `npm run test:contract`

---

## Related Projects: Complete Compliance Suite

This server is part of **Ansvar's Compliance Suite** -- MCP servers that work together for end-to-end compliance coverage:

### [@ansvar/eu-regulations-mcp](https://github.com/Ansvar-Systems/EU_compliance_MCP)
**Query 49 EU regulations directly from Claude** -- GDPR, AI Act, DORA, NIS2, MiFID II, eIDAS, and more. `npx @ansvar/eu-regulations-mcp`

### [@ansvar/us-regulations-mcp](https://github.com/Ansvar-Systems/US_Compliance_MCP)
**Query US federal and state compliance laws** -- HIPAA, CCPA, SOX, GLBA, FERPA, and more. `npx @ansvar/us-regulations-mcp`

### [@ansvar/swedish-law-mcp](https://github.com/Ansvar-Systems/swedish-law-mcp)
**Query 2,415 Swedish statutes** -- DSL, BrB, ABL, MB, and more. `npx @ansvar/swedish-law-mcp`

### [@ansvar/sanctions-mcp](https://github.com/Ansvar-Systems/Sanctions-MCP)
**Offline-capable sanctions screening** -- OFAC, EU, UN sanctions lists. `pip install ansvar-sanctions-mcp`

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas:
- Presidential Decrees (PD) and Executive Orders (EO) coverage
- Implementing Rules and Regulations (IRR) for major laws
- Case law integration (Supreme Court decisions)
- Historical statute amendments tracking

---

## Citation

If you use this MCP server in academic research:

```bibtex
@software{philippine_law_mcp_2026,
  author = {Ansvar Systems AB},
  title = {Philippine Law MCP Server: Production-Grade Legal Research Tool},
  year = {2026},
  url = {https://github.com/Ansvar-Systems/philippine-law-mcp},
  note = {Comprehensive Philippine legal database with 11,600+ Republic Acts and full-text search}
}
```

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

### Data Licenses

- **Legislation:** Open Access (LawPhil / Arellano Law Foundation)
- **Government publications:** Government Open Data (Official Gazette)
- **EU Metadata:** EUR-Lex (EU public domain)

---

## About Ansvar Systems

We build AI-accelerated compliance and legal research tools. This MCP server makes Philippine law searchable and AI-readable -- because navigating 11,600+ Republic Acts shouldn't require opening LawPhil in 47 tabs.

**[ansvar.eu](https://ansvar.eu)** -- Stockholm, Sweden

---

<p align="center">
  <sub>Built with care in Stockholm, Sweden</sub>
</p>
