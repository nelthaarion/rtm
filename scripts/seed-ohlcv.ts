/**
 * Seed script: generates synthetic but realistic EURUSD OHLCV data
 * across 5 timeframes (M15, H1, H4, D1, W1) for the past 2 years.
 *
 * The generator produces trends, pullbacks, bases, and impulse moves
 * so that all RTM concepts (zones, FTRs, QMs, sweeps) are visible
 * in the data and labelable.
 *
 * Run with: bun run scripts/seed-ohlcv.ts
 */
import { db } from '../src/lib/db'

const INSTRUMENTS = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', assetClass: 'FX', pipSize: 0.0001 },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', assetClass: 'FX', pipSize: 0.0001 },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', assetClass: 'CRYPTO', pipSize: 0.01 },
]

const TIMEFRAMES = ['M15', 'H1', 'H4', 'D1'] as const

// Generates a single timeframe's bars from a base price using a
// multi-regime random walk: trending + mean-reverting + ranging.
function generateBars(
  basePrice: number,
  barCount: number,
  intervalMs: number,
  startTime: Date,
  volatility: number,
  pipSize: number,
): Array<{ timestamp: Date; open: number; high: number; low: number; close: number; volume: number }> {
  const bars: Array<{ timestamp: Date; open: number; high: number; low: number; close: number; volume: number }> = []
  let price = basePrice
  let regime: 'trend_up' | 'trend_down' | 'range' = 'trend_up'
  let regimeBars = 0
  let regimeLength = 60 + Math.floor(Math.random() * 80)
  let trendStrength = 0.0001 + Math.random() * 0.0002

  for (let i = 0; i < barCount; i++) {
    const timestamp = new Date(startTime.getTime() + i * intervalMs)

    // Regime switching
    regimeBars++
    if (regimeBars >= regimeLength) {
      const r = Math.random()
      regime = r < 0.4 ? 'trend_up' : r < 0.8 ? 'trend_down' : 'range'
      regimeBars = 0
      regimeLength = 60 + Math.floor(Math.random() * 80)
      trendStrength = 0.00005 + Math.random() * 0.0003
    }

    // Mean drift by regime
    let drift = 0
    if (regime === 'trend_up') drift = trendStrength
    else if (regime === 'trend_down') drift = -trendStrength
    else drift = (basePrice - price) * 0.001 // mean-reverting pull

    // Random shock with occasional impulse (5% chance of 3x volatility)
    const isImpulse = Math.random() < 0.05
    const shock = (Math.random() - 0.5) * volatility * (isImpulse ? 3 : 1)

    const open = price
    const close = Math.max(pipSize, price + drift + shock)
    const range = volatility * (0.5 + Math.random()) * (isImpulse ? 0.5 : 1)
    const high = Math.max(open, close) + Math.random() * range
    const low = Math.min(open, close) - Math.random() * range
    const volume = 1000 + Math.random() * 5000 + (isImpulse ? 5000 : 0)

    bars.push({ timestamp, open, high, low, close, volume })
    price = close
  }
  return bars
}

function timeframeToMs(tf: string): number {
  switch (tf) {
    case 'M15': return 15 * 60 * 1000
    case 'H1':  return 60 * 60 * 1000
    case 'H4':  return 4 * 60 * 60 * 1000
    case 'D1':  return 24 * 60 * 60 * 1000
    case 'W1':  return 7 * 24 * 60 * 60 * 1000
    default:    return 60 * 60 * 1000
  }
}

function barCountForTimeframe(tf: string): number {
  switch (tf) {
    case 'M15': return 4000  // ~42 days
    case 'H1':  return 3000  // ~125 days
    case 'H4':  return 2000  // ~333 days
    case 'D1':  return 730   // 2 years
    case 'W1':  return 156   // 3 years
    default:    return 1000
  }
}

function volatilityForTimeframe(tf: string, base: number): number {
  switch (tf) {
    case 'M15': return base * 0.0008
    case 'H1':  return base * 0.0016
    case 'H4':  return base * 0.0032
    case 'D1':  return base * 0.0070
    case 'W1':  return base * 0.0150
    default:    return base * 0.002
  }
}

async function main() {
  console.log('Clearing existing data...')
  await db.bar.deleteMany({})
  await db.annotation.deleteMany({})
  await db.annotationSession.deleteMany({})
  await db.instrument.deleteMany({})

  for (const inst of INSTRUMENTS) {
    const basePrice =
      inst.assetClass === 'CRYPTO' ? 60000 :
      inst.symbol === 'GBPUSD' ? 1.2700 :
      1.0900

    console.log(`Seeding ${inst.symbol} (base ${basePrice})...`)
    const instrument = await db.instrument.create({
      data: {
        symbol: inst.symbol,
        name: inst.name,
        assetClass: inst.assetClass,
        pipSize: inst.pipSize,
      },
    })

    const now = Date.now()
    for (const tf of TIMEFRAMES) {
      const intervalMs = timeframeToMs(tf)
      const count = barCountForTimeframe(tf)
      const vol = volatilityForTimeframe(tf, basePrice)
      const startTime = new Date(now - intervalMs * count)
      const bars = generateBars(basePrice, count, intervalMs, startTime, vol, inst.pipSize)

      // Insert in batches of 200
      const BATCH = 200
      for (let i = 0; i < bars.length; i += BATCH) {
        const slice = bars.slice(i, i + BATCH)
        await db.bar.createMany({
          data: slice.map(b => ({
            instrumentId: instrument.id,
            timeframe: tf,
            timestamp: b.timestamp,
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
            volume: b.volume,
          })),
        })
      }
      console.log(`  ${tf}: ${bars.length} bars`)
    }
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
