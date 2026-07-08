"""
Migration: Create the TradeSetup table in the database.

This script is needed if you downloaded the project before the TradeSetup model
was added to the schema. Run this after extracting the zip to ensure the
TradeSetup table exists in your database.

Usage:
  python3 scripts/migrate-add-trade-setup.py

Or simply run:
  bunx prisma db push
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'custom.db')

def main():
    print(f"Database: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print(f"ERROR: DB file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Check if TradeSetup table exists
    tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    if 'TradeSetup' in tables:
        print("✓ TradeSetup table already exists — no migration needed")
        conn.close()
        return

    print("TradeSetup table does not exist. Creating it...")

    # Create the TradeSetup table
    c.execute("""
        CREATE TABLE "TradeSetup" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "postId" TEXT NOT NULL,
            "label" TEXT NOT NULL DEFAULT 'Trade Setup',
            "entryStart" DATETIME NOT NULL,
            "entryEnd" DATETIME NOT NULL,
            "entryPriceStart" REAL NOT NULL,
            "entryPriceEnd" REAL NOT NULL,
            "slStart" DATETIME NOT NULL,
            "slEnd" DATETIME NOT NULL,
            "slPriceStart" REAL NOT NULL,
            "slPriceEnd" REAL NOT NULL,
            "tpStart" DATETIME NOT NULL,
            "tpEnd" DATETIME NOT NULL,
            "tpPriceStart" REAL NOT NULL,
            "tpPriceEnd" REAL NOT NULL,
            "notes" TEXT,
            "createdById" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE
        )
    """)

    # Create index
    c.execute('CREATE INDEX "TradeSetup_postId_idx" ON "TradeSetup"("postId")')

    conn.commit()

    # Verify
    tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    if 'TradeSetup' in tables:
        print("✓ TradeSetup table created successfully!")
    else:
        print("✗ Failed to create TradeSetup table")

    conn.close()
    print("\nDone. Trade setups will now work in the Review tab.")

if __name__ == '__main__':
    main()
