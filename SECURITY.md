# Security

## What this software does

Home Lending Chamber is a **local-first** workflow layer (meetings, triage, comms)
on top of the LOOPER prioritization engine. Ranking and spec paths are
**deterministic** (no LLM in score/spec). SQLite ledger is hash-chained.

## What it does NOT do

- **No telemetry** — no analytics or phone-home endpoints.
- **No secrets in repo** — `.env` is gitignored; use `.env.example`.
- **No production data** — seed initiatives are synthetic.
- **Not production auth** — `/unlock` courtesy code only (`GATE_CODE`, default `333333`).

## Enterprise deployment

Clone, audit, run offline. Jira HTTP adapter requires env vars you provide locally
(`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`) — never commit these.

## Reporting vulnerabilities

Contact the maintainer via the GitHub repository. Do not open public issues for
undisclosed security concerns.