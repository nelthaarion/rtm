"""
fix_timestamps.py
==================
One-off repair script for rtm-collector's SQLite database.

Problem:
  mt5_collector.py used to write DateTime columns (Instrument.createdAt,
  Bar.timestamp) using Python's bare datetime.isoformat(), which can
  produce strings like '2024-06-15T10:00:00' (no milliseconds, no
  timezone). Prisma's DateTime columns expect strict RFC3339:
  '2024-06-15T10:00:00.000Z'. The mismatch causes:

    PrismaClientKnownRequestError: Inconsistent column data:
    Conversion failed: input contains invalid characters (P2023)

This script rewrites every existing timestamp string in the Instrument
and Bar tables into the correct format, WITHOUT changing the actual
date/time value (it doesn't shift timezones — it just fixes formatting,
since we can't know what timezone the original naive strings were
actually written in).

USAGE:
  python fix_timestamps.py path/to/custom.db
  (defaults to db/custom.db relative to this script's parent, same
  layout as mt5_collector.py, if no path is given)
"""

import sqlite3
import sys
import os
import re
from datetime import datetime

STRICT_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$")


def normalize(value):
    """
    Return a strict RFC3339 'YYYY-MM-DDTHH:MM:SS.sssZ' string for any
    ISO-ish datetime string. Returns None if the value can't be parsed
    at all (so the caller can flag it instead of silently corrupting it).
    """
    if value is None:
        return None
    if STRICT_RE.match(value):
        return value  # already correct, leave untouched

    candidate = value.strip()
    # Normalize a trailing 'Z' to an explicit UTC offset for fromisoformat,
    # and handle values that already have +HH:MM offsets.
    parseable = candidate.replace("Z", "+00:00") if candidate.endswith("Z") else candidate

    try:
        dt = datetime.fromisoformat(parseable)
    except ValueError:
        return None

    # Format-only fix: keep the same wall-clock value, just express it
    # with milliseconds + 'Z' the way Prisma expects.
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def fix_table_column(conn, table, id_col, ts_col):
    cursor = conn.cursor()
    rows = cursor.execute(f"SELECT {id_col}, {ts_col} FROM {table}").fetchall()

    fixed = 0
    unparseable = []
    for row_id, raw_value in rows:
        new_value = normalize(raw_value)
        if new_value is None:
            unparseable.append((row_id, raw_value))
            continue
        if new_value != raw_value:
            cursor.execute(
                f"UPDATE {table} SET {ts_col} = ? WHERE {id_col} = ?",
                (new_value, row_id)
            )
            fixed += 1

    conn.commit()
    print(f"{table}.{ts_col}: checked {len(rows)}, fixed {fixed}, unparseable {len(unparseable)}")
    if unparseable:
        print(f"  WARNING — could not parse these {table} rows, left untouched:")
        for row_id, raw_value in unparseable[:20]:
            print(f"    {row_id}: {raw_value!r}")
        if len(unparseable) > 20:
            print(f"    ...and {len(unparseable) - 20} more")


def main():
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.normpath(os.path.join(script_dir, "..", "db", "custom.db"))

    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        print("Pass the path explicitly: python fix_timestamps.py path\\to\\custom.db")
        sys.exit(1)

    print(f"Database: {db_path}")
    conn = sqlite3.connect(db_path)

    # Back up first — always.
    backup_path = db_path + ".bak"
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"Backup written to: {backup_path}")
    else:
        print(f"Backup already exists at {backup_path}, not overwriting.")

    fix_table_column(conn, "Instrument", "id", "createdAt")
    fix_table_column(conn, "Bar", "id", "timestamp")

    conn.close()
    print("\nDone. Restart your Next.js dev server / app so Prisma picks up the fixed rows.")


if __name__ == "__main__":
    main()