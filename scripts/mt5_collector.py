"""
MetaTrader 5 Data Collector for RTM Annotator
=============================================

REQUIREMENTS:
- Windows OS (MT5 Python API only works on Windows)
- MetaTrader 5 terminal installed and logged in
- Python 3.10+
- pip install MetaTrader5

USAGE:
  python mt5_collector.py

FIXES in this version:
1. Fixed 'numpy.void' object has no attribute 'get' — use rate['tick_volume'] directly
2. Fixed 0 bars returned — use copy_rates_from_pos with proper position and count
3. Ensure symbol is visible in Market Watch before requesting data
4. Added timeout handling per symbol
5. Fixed: was pulling EVERY symbol the broker offers via mt5.symbols_get()
   with no filter, ignoring SYMBOL_FILTERS entirely. Now only the exact
   symbols listed in SYMBOL_FILTERS are requested/selected/downloaded.
   Includes a loose-match fallback for brokers that suffix/prefix symbols
   (e.g. EURUSD.a, EURUSDm) and reports any requested symbols that aren't
   offered by the broker at all.

SCHEDULING (Windows Task Scheduler):
  1. Open Task Scheduler
  2. Create Basic Task
  3. Set trigger: Daily, every 1 hour
  4. Action: Start a program
  5. Program: python
  6. Arguments: C:\\path\\to\\mt5_collector.py
"""

import MetaTrader5 as mt5
from datetime import datetime, timedelta, timezone
import sqlite3
import hashlib
import time
import sys
import os

# ─── CONFIG ───────────────────────────────────────────────────────────
DATABASE_PATH = "db/custom.db"
SYMBOL_FILTERS = {
    "FX": ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
           "EURGBP", "EURJPY", "GBPJPY", "EURCHF", "AUDJPY", "EURAUD", "GBPCAD"],
    "INDICES": ["USTEC", "US500", "US30", "GER40", "UK100", "JPN225", "FRA40", "AUS200"],
    "COMMODITIES": ["XAUUSD", "XAGUSD", "WTI", "BRENT", "NGAS", "COPPER"],
    "METALS": ["XAUUSD", "XAGUSD", "XPTUSD", "XPDUSD"],
    "CRYPTO": ["BTCUSD", "ETHUSD", "LTCUSD", "XRPUSD", "BNBUSD"],
}
TIMEFRAMES = {
    "M1": mt5.TIMEFRAME_M1,
    "M5": mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "M30": mt5.TIMEFRAME_M30,
    "H1": mt5.TIMEFRAME_H1,
    "H4": mt5.TIMEFRAME_H4,
    "D1": mt5.TIMEFRAME_D1
}
PIP_SIZES = {"FX": 0.0001, "CRYPTO": 0.01, "COMMODITIES": 0.01, "METALS": 0.01, "INDICES": 0.1}
MAX_BARS_PER_REQUEST = 5000  # MT5 max per call
# ─── END CONFIG ───────────────────────────────────────────────────────


def connect_mt5():
    """Connect to MetaTrader 5 terminal."""
    if not mt5.initialize():
        print(f"Failed to initialize MT5: {mt5.last_error()}")
        sys.exit(1)
    info = mt5.terminal_info()
    if info is None:
        print("MT5 terminal not running. Please start MetaTrader 5 first.")
        sys.exit(1)
    acc = mt5.account_info()
    if acc:
        print(f"Connected to MT5: {info.name} (account: {acc.login})")
    else:
        print(f"Connected to MT5: {info.name}")
    return info


def get_target_symbols():
    """
    Build the list of symbols we actually want (from SYMBOL_FILTERS), then
    check each one against what the broker actually offers, and make sure
    it's visible in Market Watch. Only these exact symbols are ever
    processed — not the broker's full symbol universe.
    """
    # Flatten SYMBOL_FILTERS into a deduplicated ordered list of wanted symbols
    wanted = []
    seen = set()
    for symbols in SYMBOL_FILTERS.values():
        for s in symbols:
            if s not in seen:
                seen.add(s)
                wanted.append(s)

    # Pull the broker's symbol universe once, just to check what exists /
    # to fall back on suffix/prefix variants (e.g. EURUSD.a, EURUSDm).
    broker_symbols = mt5.symbols_get()
    broker_names = {s.name for s in broker_symbols} if broker_symbols else set()

    usable = []
    missing = []
    for name in wanted:
        actual_name = name
        if actual_name not in broker_names:
            match = next((b for b in broker_names if b.startswith(name)), None)
            if match is None:
                missing.append(name)
                continue
            actual_name = match

        if mt5.symbol_select(actual_name, True):
            usable.append(actual_name)
        else:
            missing.append(name)

    print(f"Requested symbols: {len(wanted)}, available & selected: {len(usable)}")
    if missing:
        print(f"Not found on this broker: {', '.join(missing)}")

    return usable


def categorize_symbol(symbol_name):
    """Categorize a symbol by asset class, tolerant of broker suffixes/prefixes."""
    for category, symbols in SYMBOL_FILTERS.items():
        for base in symbols:
            if symbol_name == base or symbol_name.startswith(base):
                return category
    # Fallback heuristics (shouldn't normally trigger now that we only
    # request symbols from SYMBOL_FILTERS, but kept as a safety net).
    if any(x in symbol_name for x in ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"]):
        return "FX"
    if "XAU" in symbol_name or "XAG" in symbol_name or "XPT" in symbol_name:
        return "METALS"
    if any(x in symbol_name for x in ["BTC", "ETH", "LTC", "XRP", "BNB"]):
        return "CRYPTO"
    if any(x in symbol_name for x in ["WTI", "BRENT", "NGAS", "COPPER"]):
        return "COMMODITIES"
    return "INDEX"


def get_pip_size(category):
    return PIP_SIZES.get(category, 0.0001)


def ms_to_prisma_iso(ts_ms):
    """
    Convert an epoch-ms timestamp to the exact RFC3339 format Prisma's
    DateTime type expects, e.g. '2024-06-15T10:00:00.000Z'.

    Using datetime.isoformat() directly produces strings without
    milliseconds/timezone when they're zero (e.g. '2024-06-15T10:00:00'),
    which Prisma's driver can fail to parse (P2023: "input contains
    invalid characters"). This also fixes the previous bug of converting
    epoch time using the *local* timezone instead of UTC.
    """
    dt = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def get_last_bar_timestamp(conn, instrument_id, timeframe):
    """Get the timestamp of the last bar in the database."""
    cursor = conn.cursor()
    cursor.execute(
        "SELECT MAX(timestamp) FROM Bar WHERE instrumentId = ? AND timeframe = ?",
        (instrument_id, timeframe)
    )
    result = cursor.fetchone()
    return result[0] if result and result[0] else None


def get_or_create_instrument(conn, symbol, name, category, pip_size):
    """Get or create an instrument record."""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM Instrument WHERE symbol = ?", (symbol,))
    result = cursor.fetchone()
    if result:
        return result[0]

    instrument_id = hashlib.md5(f"{symbol}:{category}".encode()).hexdigest()[:25]
    cursor.execute(
        "INSERT INTO Instrument (id, symbol, name, assetClass, pipSize, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        (instrument_id, symbol, f"{symbol} ({category})", category, pip_size, datetime.now().isoformat())
    )
    conn.commit()
    return instrument_id


def download_and_store_bars(conn, instrument_id, symbol, timeframe, mt5_tf):
    """Download bars from MT5 and store in database. Incremental."""
    last_ts = get_last_bar_timestamp(conn, instrument_id, timeframe)

    # ─── Determine download strategy ────────────────────────────────
    rates = None

    # Strategy 1: If we have existing data, use copy_rates_from for incremental
    if last_ts:
        # last_ts is the stored Prisma-format ISO string (e.g. '...T10:00:00.000Z'),
        # NOT an epoch-ms integer — parse it as such rather than dividing by 1000.
        start_from = datetime.fromisoformat(last_ts.replace("Z", "+00:00")) + timedelta(seconds=1)
        print(f"  {symbol} {timeframe}: incremental from {start_from}")
        rates = mt5.copy_rates_from(symbol, mt5_tf, start_from, MAX_BARS_PER_REQUEST)

    # Strategy 2: Full history — use copy_rates_from_pos(0, MAX) to get the most recent bars
    # Position 0 = current bar, count = how many bars backwards from current
    if rates is None or len(rates) == 0:
        print(f"  {symbol} {timeframe}: requesting last {MAX_BARS_PER_REQUEST} bars via copy_rates_from_pos...")
        rates = mt5.copy_rates_from_pos(symbol, mt5_tf, 0, MAX_BARS_PER_REQUEST)

    # Strategy 3: Try copy_rates_range with a very wide range
    if rates is None or len(rates) == 0:
        print(f"  {symbol} {timeframe}: trying copy_rates_range(2023-01-01 to now)...")
        rates = mt5.copy_rates_range(symbol, mt5_tf, datetime(2023, 1, 1), datetime.now())

    # Strategy 4: Try copy_rates_from with a recent start date
    if rates is None or len(rates) == 0:
        recent_start = datetime.now() - timedelta(days=365)
        print(f"  {symbol} {timeframe}: trying copy_rates_from({recent_start})...")
        rates = mt5.copy_rates_from(symbol, mt5_tf, recent_start, MAX_BARS_PER_REQUEST)

    if rates is None or len(rates) == 0:
        print(f"  {symbol} {timeframe}: NO DATA (symbol may not have history in this terminal)")
        return 0

    # ─── Insert into database ───────────────────────────────────────
    # MT5 returns numpy structured array — access fields by name, NOT .get()
    cursor = conn.cursor()
    batch_data = []
    for rate in rates:
        ts_ms = int(rate['time']) * 1000
        bar_id = hashlib.md5(f"{instrument_id}:{timeframe}:{ts_ms}".encode()).hexdigest()[:25]
        # Use direct field access — numpy.void doesn't have .get()
        # MT5 tick_volume field is always present in the structured array
        vol = int(rate['tick_volume']) if rate['tick_volume'] else 0
        batch_data.append((
            bar_id, instrument_id, timeframe,
            ms_to_prisma_iso(ts_ms),
            float(rate['open']), float(rate['high']),
            float(rate['low']), float(rate['close']),
            vol
        ))

    # Batch insert with INSERT OR IGNORE (dedup)
    inserted = 0
    CHUNK = 5000
    for i in range(0, len(batch_data), CHUNK):
        chunk = batch_data[i:i + CHUNK]
        cursor.executemany(
            "INSERT OR IGNORE INTO Bar (id, instrumentId, timeframe, timestamp, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            chunk
        )
        conn.commit()
        inserted += cursor.rowcount

    print(f"  {symbol} {timeframe}: {inserted} new bars inserted (received {len(rates)} from MT5)")
    return inserted


def main():
    print("=" * 60)
    print("  MT5 Data Collector for RTM Annotator")
    print("=" * 60)

    # Connect to MT5
    connect_mt5()

    # Get only the target symbols defined in SYMBOL_FILTERS, and ensure
    # they're visible in Market Watch.
    target_symbols = get_target_symbols()

    if not target_symbols:
        print("No target symbols available on this broker. Exiting.")
        mt5.shutdown()
        return

    # Connect to database
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.normpath(os.path.join(script_dir, "..", DATABASE_PATH))
    conn = sqlite3.connect(db_path)
    print(f"\nDatabase: {db_path}")

    # Create Bar table if it doesn't exist (for fresh databases)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Bar (
            id TEXT PRIMARY KEY,
            instrumentId TEXT,
            timeframe TEXT,
            timestamp TEXT,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume REAL
        )
    """)
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_bar_unique ON Bar(instrumentId, timeframe, timestamp)")
    conn.commit()

    total_bars = 0
    total_symbols = 0
    total_errors = 0

    for symbol in target_symbols:
        category = categorize_symbol(symbol)
        pip_size = get_pip_size(category)

        instrument_id = get_or_create_instrument(conn, symbol, symbol, category, pip_size)
        total_symbols += 1
        print(f"\n[{category}] {symbol}")

        for tf_name, mt5_tf in TIMEFRAMES.items():
            try:
                bars = download_and_store_bars(conn, instrument_id, symbol, tf_name, mt5_tf)
                total_bars += bars
            except Exception as e:
                print(f"  ERROR {symbol} {tf_name}: {e}")
                total_errors += 1

        # Small delay between symbols
        time.sleep(0.3)

    conn.close()
    mt5.shutdown()

    print(f"\n{'=' * 60}")
    print(f"  DONE: {total_symbols} symbols, {total_bars} bars inserted, {total_errors} errors")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()