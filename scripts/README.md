# RTM Chart Annotator

A web-based chart annotation tool for labeling RTM (Read The Market) structures on historical OHLCV charts. Built to produce labeled datasets in the 10-field schema from the RTM Knowledge Base, for use in training future ML pattern detectors.

## What it does

- Displays candlestick charts with pan/zoom
- Provides 17 RTM drawing tools (Base, Supply, Demand, FTR, Flag, FL, QM, Diamond, MPL, BSZ, Sweep, Engulf, Compression, Decision Point, Liquidity Pool, Swing)
- Auto-prefills the 10-field KB schema when you draw a structure
- Saves annotations to a SQLite database
- Exports annotations as JSON or CSV (one row per annotation, all 22 columns)
- Supports 3 instruments (EURUSD, GBPUSD, BTCUSD) across 5 timeframes (M15, H1, H4, D1, W1)
- Ships with ~38,000 synthetic OHLCV bars pre-seeded so you can start labeling immediately

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **Chart**: Custom HTML5 Canvas (60fps, no external charting library)

## Prerequisites

- Node.js 18+ (or Bun)
- A package manager: `npm`, `pnpm`, or `bun` (recommended)

## Installation

```bash
# 1. Unzip
unzip rtm-chart-annotator.zip
cd rtm-chart-annotator

# 2. Install dependencies
bun install   # or: npm install

# 3. Copy env file
cp .env.example .env

# 4. Push database schema
bun run db:push   # or: npx prisma db push

# 5. Seed synthetic OHLCV data
bun run scripts/seed-ohlcv.ts   # or: npx tsx scripts/seed-ohlcv.ts

# 6. Start dev server
bun run dev   # or: npm run dev
```

Open http://localhost:3000 in your browser.

## Usage

1. **Pick instrument + timeframe** from the top bar (EURUSD / GBPUSD / BTCUSD × M15 / H1 / H4 / D1 / W1)
2. **Pick a drawing tool** from the left palette (e.g., "Base")
3. **Pick direction** (Long / Short / Neutral)
4. **Drag on the chart** where you see the structure — the form opens pre-filled with the KB definition
5. **Edit any field** in the 10-field schema (Definition, Purpose, Context, Why it forms, How professionals identify it, Common mistakes, Failure conditions, Relationships, Probability contribution, Real chart example)
6. **Save** — annotation persists to DB and appears in the right panel
7. **Click an annotation** (on the chart or in the list) to edit it
8. **Export** — click "Export" in the top bar, choose JSON or CSV

## Project structure

```
rtm-chart-annotator/
├── prisma/
│   └── schema.prisma              # Instrument, Bar, AnnotationSession, Annotation models
├── scripts/
│   └── seed-ohlcv.ts              # Synthetic OHLCV generator (3 instruments × 5 timeframes)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── instruments/route.ts   # GET /api/instruments
│   │   │   ├── ohlcv/route.ts         # GET /api/ohlcv
│   │   │   ├── annotations/route.ts   # GET/POST/PATCH/DELETE /api/annotations
│   │   │   ├── sessions/route.ts      # GET /api/sessions
│   │   │   └── export/route.ts        # GET /api/export?format=json|csv
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Main page (3-pane layout)
│   │   └── globals.css
│   ├── components/
│   │   ├── annotator/
│   │   │   ├── chart-canvas.tsx       # Canvas chart with drawing tools
│   │   │   ├── concept-palette.tsx    # Left sidebar (17 RTM tools)
│   │   │   └── annotation-form.tsx    # Right sidebar (10-field schema form)
│   │   └── ui/                        # shadcn/ui components
│   └── lib/
│       ├── annotator/
│       │   └── concepts.ts            # 17 RTM concept definitions + KB schema templates
│       ├── db.ts                      # Prisma client
│       └── utils.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.example
└── README.md
```

## Connecting real market data

The default seed uses synthetic OHLCV (a multi-regime random walk that produces realistic trends, pullbacks, and bases). To label real charts, replace `scripts/seed-ohlcv.ts` with a script that fetches from your broker's API:

- **FX**: OANDA REST API, Polygon.io, Tiingo
- **Crypto**: Binance, Coinbase, Kraken APIs (free)
- **US equities**: Alpaca, Polygon.io, Tiingo
- **Indices/futures**: FirstRate Data, IQFeed (paid)

The Bar model expects: `instrumentId, timeframe, timestamp, open, high, low, close, volume`. Any data source that can produce those fields will work.

## The 10-field schema (from RTM Knowledge Base Chapter 3)

Every annotation stores these 10 fields:

1. **Definition** — grounded in auction logic, not geometry
2. **Purpose** — the decision this concept enables
3. **Context** — where on the chart and in what sequence
4. **Why it forms** — the institutional mechanism
5. **How professionals identify it** — operational rules
6. **Common mistakes** — failure modes for new traders
7. **Failure conditions** — when the concept ceases to be valid
8. **Relationship to other concepts** — knowledge graph edges
9. **Probability contribution** — how much it lifts the base rate
10. **Real chart example** — schematic example in words

## Export format

### JSON
```json
{
  "instrument": "EURUSD",
  "count": 42,
  "annotations": [
    {
      "id": "...",
      "type": "base",
      "timeframe": "H1",
      "direction": "bullish",
      "priceStart": 1.0820,
      "priceEnd": 1.0835,
      "timeStart": "2026-06-14T12:00:00Z",
      "timeEnd": "2026-06-14T16:00:00Z",
      "outcome": "success",
      "labeler": "anonymous",
      "definition": "...",
      "purpose": "...",
      "...": "... (all 10 fields)"
    }
  ]
}
```

### CSV
One row per annotation, 22 columns: `id, instrument, type, timeframe, direction, priceStart, priceEnd, timeStart, timeEnd, outcome, labeler, definition, purpose, context, whyItForms, identification, commonMistakes, failureConditions, relationships, probabilityContribution, realChartExample`

## License

For personal research use. The RTM methodology is community-developed; this tool implements the schema from the RTM Knowledge Base.

## Troubleshooting

**"Cannot find module '@prisma/client'"** — run `bun run db:generate` or `npx prisma generate`.

**Blank chart after seeding** — verify the seed ran: `sqlite3 db/custom.db "SELECT COUNT(*) FROM Bar;"` should return ~38000.

**Drawing doesn't open the form** — make sure you drag (not just click). The form opens on mouseUp after a drag of >4px.

**Click on annotation doesn't select** — click directly inside the colored rectangle. The cursor changes to a pointer when hovering over a selectable annotation.
