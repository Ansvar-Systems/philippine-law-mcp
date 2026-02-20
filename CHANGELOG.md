# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-XX-XX
### Added
- Initial release of Philippine Law MCP
- `search_legislation` tool for full-text search across all Philippine statutes
- `get_provision` tool for retrieving specific sections
- `get_provision_eu_basis` tool for international framework cross-references (GDPR adequacy, ASEAN)
- `validate_citation` tool for legal citation validation
- `check_statute_currency` tool for checking statute amendment status
- `list_laws` tool for browsing available legislation
- Coverage of Data Privacy Act (RA 10173), Cybercrime Prevention Act (RA 10175), SIM Registration Act (RA 11934), E-Commerce Act (RA 8792), Revised Corporation Code (RA 11232), Consumer Act (RA 7394)
- Contract tests with 12 golden test cases
- Drift detection with 6 stable provision anchors
- Health and version endpoints
- Vercel deployment (single tier bundled)
- npm package with stdio transport
- MCP Registry publishing

[Unreleased]: https://github.com/Ansvar-Systems/philippine-law-mcp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Ansvar-Systems/philippine-law-mcp/releases/tag/v1.0.0
