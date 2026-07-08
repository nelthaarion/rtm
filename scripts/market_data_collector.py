# """
# Market Data Collector for RTM Annotator (yfinance only — no MT5, no Binance)
# =============================================================================

# Pulls REAL historical OHLCV data from a single free, no-signup source:
# yfinance (https://pypi.org/project/yfinance/) — covers FX, commodities,
# indices, AND crypto, so there's no need for a separate exchange API.

# TIMEFRAMES COLLECTED: M15, M30, H1, H4, D1
# (1-day resolution or finer only — no W1)

# WHY YFINANCE FOR EVERYTHING
# ----------------------------
# Yahoo Finance lists crypto pairs (BTC-USD, ETH-USD, etc.) alongside FX,
# commodities, and indices, and they all go through the exact same
# history() call with the exact same interval/period rules — so one
# source, one code path, no API key.

# YAHOO'S OWN LIMITS (confirmed straight from the yfinance library source,
# not just the docs) — this is Yahoo's platform, not this script:
#   interval 15m / 30m  -> max last 60 days
#   interval 60m (1h)   -> max last 730 days (~2 years)
#   interval 1d         -> effectively unlimited (as far back as the ticker has data)
# There is no native "4h" interval, so H4 bars are built by resampling 1h
# data (also capped at 730 days).

# Realistic bar counts you'll actually get:
#   M15: ~5,700 bars max   (60 days x 24h x 4)
#   M30: ~2,800 bars max   (60 days x 24h x 2)
#   H1:  ~17,500 bars max  (730 days x 24h)
#   H4:  ~4,300 bars max   (730 days / 4h)
#   D1:  as much history as the ticker has (crypto: since listing; FX: often 20+ years)
# No amount of pagination gets more than this — it's a hard Yahoo-side cap.

# SETUP
# -----
#   pip install yfinance

# USAGE
# -----
#   python market_data_collector.py
# """

# import sqlite3
# import hashlib
# import time
# import os
# from datetime import datetime, timezone

# import yfinance as yf
# import pandas as pd

# # ─── CONFIG ───────────────────────────────────────────────────────────
# DATABASE_PATH = "db/custom.db"

# TIMEFRAMES = ["M15", "M30", "H1", "H4", "D1"]   # 1-day resolution or finer, no W1

# # our symbol -> (Yahoo Finance ticker, asset class, pip size)
# SYMBOLS = {
#     # FX
#     "EURUSD": ("EURUSD=X", "FX", 0.0001),
#     "GBPUSD": ("GBPUSD=X", "FX", 0.0001),
#     "USDJPY": ("USDJPY=X", "FX", 0.01),
#     "AUDUSD": ("AUDUSD=X", "FX", 0.0001),
#     "USDCAD": ("USDCAD=X", "FX", 0.0001),
#     "USDCHF": ("USDCHF=X", "FX", 0.0001),
#     # Commodities
#     "XAUUSD": ("GC=F", "COMMODITIES", 0.01),   # gold futures
#     "XAGUSD": ("SI=F", "COMMODITIES", 0.001),  # silver futures
#     # Indices
#     "US500":  ("^GSPC", "INDICES", 0.1),       # S&P 500
#     "US30":   ("^DJI", "INDICES", 0.1),        # Dow Jones
#     # Crypto
#     "BTCUSD": ("BTC-USD", "CRYPTO", 0.01),
#     "ETHUSD": ("ETH-USD", "CRYPTO", 0.01),
#     "LTCUSD": ("LTC-USD", "CRYPTO", 0.01),
#     "XRPUSD": ("XRP-USD", "CRYPTO", 0.0001),
#     "BNBUSD": ("BNB-USD", "CRYPTO", 0.01),
# }

# # interval + period per timeframe, kept at or under Yahoo's actual caps.
# # H4 has no native Yahoo interval, so it's built by resampling 1h bars
# # (see fetch_yahoo_h4).
# YAHOO_PARAMS = {
#     "M15": {"interval": "15m", "period": "60d"},
#     "M30": {"interval": "30m", "period": "60d"},
#     "H1":  {"interval": "60m", "period": "730d"},
#     "D1":  {"interval": "1d",  "period": "max"},
# }

# # ─── DB HELPERS ────────────────────────────────────────────────────────

# def get_or_create_instrument(conn, symbol, name, asset_class, pip_size):
#     cur = conn.cursor()
#     cur.execute("SELECT id FROM Instrument WHERE symbol = ?", (symbol,))
#     row = cur.fetchone()
#     if row:
#         return row[0]
#     instrument_id = hashlib.md5(f"{symbol}:{asset_class}".encode()).hexdigest()[:25]
#     now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
#     cur.execute(
#         "INSERT INTO Instrument (id, symbol, name, assetClass, pipSize, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
#         (instrument_id, symbol, name, asset_class, pip_size, now_ms),
#     )
#     conn.commit()
#     return instrument_id


# def insert_bars(conn, instrument_id, timeframe, bars):
#     """bars: list of (ts_ms, open, high, low, close, volume) — ts_ms MUST be
#     an integer (milliseconds since epoch) to match how Prisma stores
#     SQLite DateTime columns. Never store ISO strings here."""
#     cur = conn.cursor()
#     rows = []
#     for ts_ms, o, h, l, c, v in bars:
#         bar_id = hashlib.md5(f"{instrument_id}:{timeframe}:{ts_ms}".encode()).hexdigest()[:25]
#         rows.append((bar_id, instrument_id, timeframe, int(ts_ms), o, h, l, c, v))
#     cur.executemany(
#         "INSERT OR IGNORE INTO Bar (id, instrumentId, timeframe, timestamp, open, high, low, close, volume) "
#         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
#         rows,
#     )
#     conn.commit()
#     return cur.rowcount


# def get_bar_count(conn, instrument_id, timeframe):
#     cur = conn.cursor()
#     cur.execute("SELECT COUNT(*) FROM Bar WHERE instrumentId = ? AND timeframe = ?", (instrument_id, timeframe))
#     return cur.fetchone()[0]


# # ─── YFINANCE ───────────────────────────────────────────────────────────

# def _df_to_rows(df):
#     df = df[["Open", "High", "Low", "Close", "Volume"]].dropna(subset=["Open", "High", "Low", "Close"])
#     rows = []
#     for idx, row in df.iterrows():
#         ts = idx.tz_convert("UTC") if idx.tzinfo is not None else idx.tz_localize("UTC")
#         ts_ms = int(ts.timestamp() * 1000)
#         rows.append((ts_ms, float(row["Open"]), float(row["High"]), float(row["Low"]), float(row["Close"]),
#                      float(row["Volume"]) if pd.notna(row["Volume"]) else 0.0))
#     return rows


# def fetch_yahoo(yahoo_symbol, timeframe):
#     if timeframe == "H4":
#         return fetch_yahoo_h4(yahoo_symbol)

#     params = YAHOO_PARAMS[timeframe]
#     ticker = yf.Ticker(yahoo_symbol)
#     df = ticker.history(interval=params["interval"], period=params["period"], auto_adjust=False)
#     if df.empty:
#         return []
#     return _df_to_rows(df)


# def fetch_yahoo_h4(yahoo_symbol):
#     """Yahoo has no native 4h interval — build it by resampling 1h bars
#     (also capped at Yahoo's 730-day intraday limit)."""
#     ticker = yf.Ticker(yahoo_symbol)
#     df = ticker.history(interval="60m", period="730d", auto_adjust=False)
#     if df.empty:
#         return []
#     df = df[["Open", "High", "Low", "Close", "Volume"]]
#     df4 = df.resample("4h").agg(
#         {"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}
#     ).dropna(subset=["Open", "High", "Low", "Close"])
#     return _df_to_rows(df4)


# def collect_all(conn):
#     print("\n" + "=" * 60)
#     print("  Collecting via yfinance")
#     print("=" * 60)
#     for our_symbol, (yahoo_symbol, asset_class, pip_size) in SYMBOLS.items():
#         instrument_id = get_or_create_instrument(conn, our_symbol, f"{our_symbol} ({asset_class})", asset_class, pip_size)
#         print(f"\n[{asset_class}] {our_symbol} ({yahoo_symbol})")
#         for tf in TIMEFRAMES:
#             try:
#                 bars = fetch_yahoo(yahoo_symbol, tf)
#             except Exception as e:
#                 print(f"  {tf}: ERROR {e}")
#                 continue
#             if not bars:
#                 print(f"  {tf}: no data returned")
#                 continue
#             inserted = insert_bars(conn, instrument_id, tf, bars)
#             total = get_bar_count(conn, instrument_id, tf)
#             print(f"  {tf}: fetched {len(bars)}, inserted {inserted} new, {total} total in db")
#             time.sleep(1)  # be polite to Yahoo's unofficial endpoint


# # ─── MAIN ───────────────────────────────────────────────────────────────

# def main():
#     print("=" * 60)
#     print("  Market Data Collector for RTM Annotator")
#     print("  (yfinance only — no MT5, no API key, no exchange APIs)")
#     print("=" * 60)

#     script_dir = os.path.dirname(os.path.abspath(__file__))
#     db_path = os.path.normpath(os.path.join(script_dir, "..", DATABASE_PATH))
#     conn = sqlite3.connect(db_path)
#     print(f"Database: {db_path}")

#     # Bootstrap tables if this is a fresh db (matches Prisma's schema).
#     # timestamp is stored as INTEGER (ms since epoch) to match exactly how
#     # Prisma encodes SQLite DateTime columns — do not switch to ISO strings.
#     cur = conn.cursor()
#     cur.execute("""
#         CREATE TABLE IF NOT EXISTS Instrument (
#             id TEXT PRIMARY KEY,
#             symbol TEXT UNIQUE,
#             name TEXT,
#             assetClass TEXT,
#             pipSize REAL DEFAULT 0.0001,
#             createdAt INTEGER
#         )
#     """)
#     cur.execute("""
#         CREATE TABLE IF NOT EXISTS Bar (
#             id TEXT PRIMARY KEY,
#             instrumentId TEXT,
#             timeframe TEXT,
#             timestamp INTEGER,
#             open REAL,
#             high REAL,
#             low REAL,
#             close REAL,
#             volume REAL
#         )
#     """)
#     cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_bar_unique ON Bar(instrumentId, timeframe, timestamp)")
#     conn.commit()

#     collect_all(conn)

#     conn.close()
#     print("\nDone.")


# if __name__ == "__main__":
#     main()
import yfinance as yf
yf.download(
    tickers=["EURUSD=X", "GBPUSD=X", "BTC-USD"],
    interval="1d",
    period="max",
    group_by="ticker",
    progress=False,
)