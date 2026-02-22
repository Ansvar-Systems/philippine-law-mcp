# Privacy & Client Confidentiality

**IMPORTANT READING FOR LEGAL PROFESSIONALS**

This document addresses privacy and confidentiality considerations when using this Tool, with particular attention to professional obligations under Philippine bar rules and the Data Privacy Act of 2012 (Republic Act No. 10173).

---

## Executive Summary

**Key Risks:**
- Queries through Claude API flow via Anthropic cloud infrastructure
- Query content may reveal client matters and privileged information
- IBP (Integrated Bar of the Philippines) and Supreme Court rules require strict attorney-client confidentiality under the Code of Professional Responsibility and Accountability (CPRA)

**Safe Use Options:**
1. **General Legal Research**: Use Tool for non-client-specific queries
2. **Local npm Package**: Install `@ansvar/philippine-law-mcp` locally — database queries stay on your machine
3. **Remote Endpoint**: Vercel Streamable HTTP endpoint — queries transit Vercel infrastructure
4. **On-Premise Deployment**: Self-host with local LLM for privileged matters

---

## Data Flows and Infrastructure

### MCP (Model Context Protocol) Architecture

This Tool uses the **Model Context Protocol (MCP)** to communicate with AI clients:

```
User Query -> MCP Client (Claude Desktop/Cursor/API) -> Anthropic Cloud -> MCP Server -> Database
```

### Deployment Options

#### 1. Local npm Package (Most Private)

```bash
npx @ansvar/philippine-law-mcp
```

- Database is local SQLite file on your machine
- No data transmitted to external servers (except to AI client for LLM processing)
- Full control over data at rest

#### 2. Remote Endpoint (Vercel)

```
Endpoint: https://philippine-law-mcp.vercel.app/mcp
```

- Queries transit Vercel infrastructure
- Tool responses return through the same path
- Subject to Vercel's privacy policy

### What Gets Transmitted

When you use this Tool through an AI client:

- **Query Text**: Your search queries and tool parameters
- **Tool Responses**: Statute text, provision content, search results
- **Metadata**: Timestamps, request identifiers

**What Does NOT Get Transmitted:**
- Files on your computer
- Your full conversation history (depends on AI client configuration)

---

## Professional Obligations (Philippines)

### IBP and Supreme Court Rules

Philippine lawyers are officers of the court and members of the Integrated Bar of the Philippines (IBP). They are bound by strict confidentiality rules under the Code of Professional Responsibility and Accountability (CPRA, A.M. No. 22-09-01-SC) and the Rules of Court.

#### Attorney-Client Privilege

- All client communications are privileged under Rule 130, Section 24 of the Rules of Court
- Client identity may be confidential in sensitive matters
- Case strategy and legal analysis are protected work product
- Information that could identify clients or matters must be safeguarded
- Breach of privilege may lead to disbarment or suspension proceedings before the Supreme Court

### Data Privacy Act and Client Data Processing

Under the **Data Privacy Act of 2012 (RA 10173)** as administered by the National Privacy Commission (NPC):

- You are the **Personal Information Controller** (PIC)
- AI service providers (Anthropic, Vercel) may be **Personal Information Processors** (PIP)
- Data sharing agreements or outsourcing agreements may be required
- Cross-border data transfers must comply with NPC Circular 2016-02
- Ensure adequate organizational, physical, and technical security measures

---

## Risk Assessment by Use Case

### LOW RISK: General Legal Research

**Safe to use through any deployment:**

```
Example: "What does the Labor Code of the Philippines say about illegal dismissal?"
```

- No client identity involved
- No case-specific facts
- Publicly available legal information

### MEDIUM RISK: Anonymized Queries

**Use with caution:**

```
Example: "What are the penalties for plunder under RA 7080?"
```

- Query pattern may reveal you are working on a plunder case
- Anthropic/Vercel logs may link queries to your API key

### HIGH RISK: Client-Specific Queries

**DO NOT USE through cloud AI services:**

- Remove ALL identifying details
- Use the local npm package with a self-hosted LLM
- Or use commercial legal databases with proper data sharing agreements

---

## Data Collection by This Tool

### What This Tool Collects

**Nothing.** This Tool:

- Does NOT log queries
- Does NOT store user data
- Does NOT track usage
- Does NOT use analytics
- Does NOT set cookies

The database is read-only. No user data is written to disk.

### What Third Parties May Collect

- **Anthropic** (if using Claude): Subject to [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy)
- **Vercel** (if using remote endpoint): Subject to [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

---

## Recommendations

### For Solo Practitioners / Small Firms

1. Use local npm package for maximum privacy
2. General research: Cloud AI is acceptable for non-client queries
3. Client matters: Use commercial legal databases (SCRA, CD Asia, LexisNexis Philippines)

### For Large Firms / Corporate Legal

1. Negotiate data sharing agreements with AI service providers per DPA requirements
2. Consider on-premise deployment with self-hosted LLM
3. Train staff on safe vs. unsafe query patterns
4. Register data processing systems with the NPC as required

### For Government / Public Sector

1. Use self-hosted deployment, no external APIs
2. Follow DICT (Department of Information and Communications Technology) cybersecurity requirements
3. Air-gapped option available for classified matters

---

## Questions and Support

- **Privacy Questions**: Open issue on [GitHub](https://github.com/Ansvar-Systems/philippine-law-mcp/issues)
- **Anthropic Privacy**: Contact privacy@anthropic.com
- **IBP Guidance**: Consult the IBP Commission on Bar Discipline or the Supreme Court Office of the Bar Confidant

---

**Last Updated**: 2026-02-22
**Tool Version**: 1.0.0
