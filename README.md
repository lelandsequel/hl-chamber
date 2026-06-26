# Home Lending Chamber

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**Committee / workflow layer** — meetings, triage, assessment, comms, graduation.

**LOOPER** ([looper-northpole](https://github.com/lelandsequel/looper-northpole)) is the
intake → rank → spec engine. Chamber organizes the operating model on top.

Synthetic demo data only. No confidential bank data. Apache-2.0.

## Clone and run

```bash
git clone https://github.com/lelandsequel/hl-chamber.git
cd hl-chamber
npm run setup          # install + seed + build
npm run dev            # http://localhost:3000
```

Unlock: `333333` (or `GATE_CODE` in `.env`).

## Surfaces

| Route | Purpose |
|-------|---------|
| `/` | Intake portals |
| `/meetings` | Wednesday strategy gate · Thursday scored review |
| `/queue` | Workflow by state |
| `/idea/[id]` | Triage, assessment, mission assign, graduate |

## Related

- **LOOPER (July 1 product):** https://github.com/lelandsequel/looper-northpole  
  Multi-entry intake gates → CADMUS → RICE+NPV → 6D COSMIC → epic/story docs.

## Security

See [SECURITY.md](SECURITY.md). Demo unlock only — not production authentication.