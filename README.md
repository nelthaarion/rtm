# RTM Chart Annotator

A web-based chart annotation tool for labeling RTM (Read The Market) structures on historical OHLCV charts.

## What's in this package

- **21 RTM annotation concepts** across 5 categories:
  - **Zones**: BASE, SUPP, DEM
  - **Patterns**: FTR, FLAG, FL, ENG, CMP
  - **Advanced Patterns**: QM, DIA, DBD, RBD, RBR, DBR
  - **Liquidity**: MPL, BSZ, SWP, LIQ
  - **Structure**: DP, SWG, ECP
- **TradingView lightweight-charts** integration (`review-chart.tsx`) with polyline annotation support
- **Custom HTML5 Canvas chart** (`chart-canvas.tsx`) with pan/zoom for the annotator
- **Multi-user system** with roles: Labeler, Reviewer, Admin, Viewer
- **Annotation workflow**: labelers draw → reviewers approve/deny/correct → approved dataset
- **SQLite database** with ~30,000 pre-seeded OHLCV bars (EURUSD, GBPUSD, BTCUSD across M15/H1/H4/D1/W1)
- **Export** approved annotations as JSON or CSV

## Setup (3 commands)

```bash
# 1. Unzip
unzip rtm-chart-annotator.zip
cd rtm-chart-annotator

# 2. Install dependencies
bun install
# (or: npm install / pnpm install)

# 3. Run the dev server
bun run dev
# (or: npm run dev)
```

Open http://localhost:3000 in your browser.

## Default accounts

The database ships with 3 pre-created users. Passwords are hashed — to log in, you may need to run the account creation script:

```bash
bun run scripts/create-accounts.js
```

| Email | Role |
|-------|------|
| admin@rtm.local | ADMIN |
| viewer@rtm.local | VIEWER |
| (create your own via signup) | LABELER |

## Bug fixes included in this version

1. **Timestamp migration** — all DateTime columns converted from integer milliseconds to ISO 8601 strings. Fixes Prisma P2023 "Conversion failed: input contains invalid characters" on Windows. Run `python3 scripts/migrate-timestamps-to-iso.py` if you re-seed.

2. **Task assign route** — uses `db.bar.count()` instead of time-span estimation. Guarantees exactly 1000 bars per task.

3. **Task discard endpoint** (`POST /api/tasks/discard`) — lets users discard a broken task and get a new one.

4. **Frontend error handling** — shows clear error messages and Retry/Get New Task buttons instead of silent failures.

5. **DATABASE_URL** — changed to relative path (`file:./db/custom.db`) so it works on Linux, Windows, and macOS.

## Tech stack

- Next.js 16 (App Router) + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM + SQLite
- TradingView lightweight-charts (for review chart)
- Custom HTML5 Canvas (for annotator chart)

## Re-seeding data

If you want fresh synthetic data:

```bash
bun run scripts/seed-ohlcv.ts
```

Then run the migration to ensure timestamps are in ISO format:

```bash
python3 scripts/migrate-timestamps-to-iso.py
```

## File structure

```
src/
  app/
    api/              # API routes (auth, tasks, annotations, instruments, etc.)
    page.tsx          # Main app shell with view switcher
  components/
    annotator/        # All annotation UI components
      chart-canvas.tsx       # Canvas-based chart for annotating
      review-chart.tsx       # TradingView chart for review/approved views
      annotator-view.tsx     # Main annotator layout
      concept-palette.tsx    # Sidebar with 21 tools
      annotation-form.tsx    # 10-field schema form
      ...
    ui/               # shadcn/ui components
  lib/
    annotator/
      concepts.ts     # 21 RTM concept definitions
    auth.ts           # Cookie-based auth
    db.ts             # Prisma client
prisma/
  schema.prisma       # Database schema
scripts/
  seed-ohlcv.ts       # Synthetic data generator
  migrate-timestamps-to-iso.py  # Timestamp format fixer
  mt5_collector.py    # MT5 data collector (Windows only)
```
