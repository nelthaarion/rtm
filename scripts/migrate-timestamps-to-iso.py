"""
Migration: Convert all DateTime columns from integer milliseconds to ISO 8601 strings.

Problem:
  Prisma's SQLite connector on some platforms (notably Windows with Prisma 6.x)
  throws error P2023 "Conversion failed: input contains invalid characters"
  when a DateTime column contains integer values instead of ISO 8601 strings.

  The seed script stored timestamps as Unix epoch milliseconds (integers like
  1779689813828). On Linux, Prisma silently converts these to Date objects.
  On Windows, Prisma rejects them.

Fix:
  Convert every DateTime column in every table from integer milliseconds to
  ISO 8601 strings (e.g., "2026-07-05T22:16:54.907Z").

  This is the format Prisma's SQLite connector expects by default, and it
  works consistently across Linux, Windows, and macOS.

Usage:
  python3 scripts/migrate-timestamps-to-iso.py
"""

import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'custom.db')

# Map: table name → list of DateTime columns to convert
# (derived from prisma/schema.prisma)
DATETIME_COLUMNS = {
    'Instrument':         ['createdAt'],
    'Bar':                ['timestamp'],
    'AnnotationSession':  ['startedAt', 'endedAt'],
    'Annotation':         ['timeStart', 'timeEnd', 'createdAt', 'updatedAt', 'reviewedAt'],
    'Task':               ['startTimestamp', 'endTimestamp', 'assignedAt', 'expiresAt', 'submittedAt'],
    'TaskHistory':        ['startTimestamp', 'endTimestamp', 'submittedAt', 'createdAt'],
    'Notification':       ['createdAt'],
    'Post':               ['createdAt', 'updatedAt', 'sentAt'],
    'CorrectedAnnotation':['timeStart', 'timeEnd', 'correctedAt'],
    'User':               ['createdAt'],
}


def is_integer(value):
    """Check if a value is an integer (or integer-like)."""
    if isinstance(value, int):
        return True
    if isinstance(value, str):
        try:
            int(value)
            return True
        except ValueError:
            return False
    return False


def ms_to_iso(ms):
    """Convert Unix epoch milliseconds to ISO 8601 string."""
    dt = datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc)
    return dt.isoformat().replace('+00:00', 'Z')


def migrate_table(conn, table, columns):
    """Convert all integer DateTime values in a table to ISO strings."""
    c = conn.cursor()

    # Check if the table exists
    r = c.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table,)
    ).fetchone()
    if not r:
        print(f"  {table}: table does not exist, skipping")
        return 0

    total_converted = 0
    for col in columns:
        # Check if column exists
        cols = [row[1] for row in c.execute(f"PRAGMA table_info({table})").fetchall()]
        if col not in cols:
            continue

        # Count how many rows have integer values in this column
        # SQLite's typeof() returns 'integer' for integer values
        r = c.execute(
            f"SELECT COUNT(*) FROM {table} WHERE {col} IS NOT NULL AND typeof({col}) = 'integer'"
        ).fetchone()
        integer_count = r[0]

        if integer_count == 0:
            continue

        # Convert: read each integer value, convert to ISO string, update
        # Do it in batches for large tables
        rows = c.execute(
            f"SELECT rowid, {col} FROM {table} WHERE {col} IS NOT NULL AND typeof({col}) = 'integer'"
        ).fetchall()

        updated = 0
        for rowid, val in rows:
            try:
                if isinstance(val, int):
                    iso = ms_to_iso(val)
                elif isinstance(val, str):
                    iso = ms_to_iso(int(val))
                else:
                    continue
                c.execute(
                    f"UPDATE {table} SET {col} = ? WHERE rowid = ?",
                    (iso, rowid)
                )
                updated += 1
            except Exception as e:
                print(f"    ERROR converting {table}.{col} rowid={rowid} val={val!r}: {e}")
                continue

        conn.commit()
        total_converted += updated
        print(f"  {table}.{col}: converted {updated}/{integer_count} rows to ISO strings")

    return total_converted


def main():
    print(f"Database: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print(f"ERROR: DB file not found at {DB_PATH}")
        return

    # Backup
    backup_path = DB_PATH + '.bak-before-iso-migration'
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy2(DB_PATH, backup_path)
        print(f"Backup created: {backup_path}")
    else:
        print(f"Backup already exists: {backup_path}")

    conn = sqlite3.connect(DB_PATH)
    conn.isolation_level = None  # autocommit for PRAGMA

    # Disable foreign keys during migration
    conn.execute("PRAGMA foreign_keys = OFF")

    print()
    print("=== Migrating integer timestamps → ISO 8601 strings ===")
    grand_total = 0
    for table, columns in DATETIME_COLUMNS.items():
        converted = migrate_table(conn, table, columns)
        grand_total += converted

    print()
    print(f"=== Migration complete: {grand_total} total cells converted ===")

    # Verify: re-check typeof() for a sample
    print()
    print("=== Verification: typeof() after migration ===")
    c = conn.cursor()
    for table, columns in DATETIME_COLUMNS.items():
        for col in columns:
            r = c.execute(f"SELECT typeof({col}) FROM {table} WHERE {col} IS NOT NULL LIMIT 1").fetchone()
            if r:
                sample = c.execute(f"SELECT {col} FROM {table} WHERE {col} IS NOT NULL LIMIT 1").fetchone()
                print(f"  {table}.{col}: typeof={r[0]}, sample={sample[0]!r}")

    conn.execute("PRAGMA foreign_keys = ON")
    conn.close()
    print()
    print("Done. Prisma should now read timestamps correctly on all platforms.")


if __name__ == '__main__':
    main()
