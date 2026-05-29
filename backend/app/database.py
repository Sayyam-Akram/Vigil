import sqlite3
import os
import logging
from datetime import datetime

logger = logging.getLogger("vendorsentinel.database")
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "vendorsentinel.db")

def get_db_connection():
    try:
        conn = sqlite3.connect(DB_FILE, timeout=10.0)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}")
        raise

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create the signals database table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS signals (
            id TEXT PRIMARY KEY,
            vendor TEXT,
            type TEXT,
            severity TEXT,
            title TEXT,
            source TEXT,
            source_url TEXT,
            detail TEXT,
            detected_at TEXT,
            detected_relative TEXT,
            confidence INTEGER,
            raw_signal TEXT,
            action TEXT
        )
    """)
    conn.commit()
    
    # Seed historical signals if table is empty
    cursor.execute("SELECT COUNT(*) FROM signals")
    if cursor.fetchone()[0] == 0:
        seed_historical_data(cursor)
        conn.commit()
        
    conn.close()

def seed_historical_data(cursor):
    # Snowflake static indicators seed
    snowflake_signals = [
        {
            "id": "sig_sf_db_001",
            "vendor": "Snowflake",
            "type": "credential_leak",
            "severity": "critical",
            "title": "Plaintext corporate credentials on public paste site",
            "source": "Paste site monitoring via Bright Data Web Unlocker",
            "source_url": "https://pastebin.com/archive/leak-sf-77a83d",
            "detail": "14 matching @snowflake.com employee email addresses found in public credential dump alongside plaintext passwords. Hashes confirm direct dump leaks.",
            "detected_at": "2024-04-14T03:17:00Z",
            "detected_relative": "49 days before disclosure",
            "confidence": 96,
            "raw_signal": "[DUMP SECTIONS: email_list, plain_pw] ... jsmith@snowflake.com:Winter2023! ...",
            "action": "ALERT_SENT"
        },
        {
            "id": "sig_sf_db_002",
            "vendor": "Snowflake",
            "type": "github",
            "severity": "high",
            "title": "Hardcoded AWS Access Key in public GitHub repository",
            "source": "GitHub Public Scanning",
            "source_url": "https://github.com/snowflake-labs/temp-dev-tools/commit/a8d29b",
            "detail": "Developer committed a testing script to a public repository containing internal AWS access key with broad privileges.",
            "detected_at": "2024-04-18T10:45:00Z",
            "detected_relative": "45 days before disclosure",
            "confidence": 94,
            "raw_signal": "commit: a8d29b104928e10023a1029 diff: + AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'",
            "action": "ALERT_SENT"
        },
        {
            "id": "sig_sf_db_003",
            "vendor": "Snowflake",
            "type": "personnel",
            "severity": "high",
            "title": "Director of Infrastructure and Security resigns abruptly",
            "source": "LinkedIn public signals",
            "source_url": "https://linkedin.com/in/director-infra-sf-profile",
            "detail": "Key security decision-maker announced transition to a new firm with no pre-disclosed successor.",
            "detected_at": "2024-04-28T11:42:00Z",
            "detected_relative": "35 days before disclosure",
            "confidence": 84,
            "raw_signal": "PROFILE_DRIFT: VP of Security confirmed transition.",
            "action": "MONITORING"
        },
        {
            "id": "sig_sf_db_004",
            "vendor": "Snowflake",
            "type": "news",
            "severity": "high",
            "title": "Subtle SEC Form 10-Q references 'unauthorized access' triage",
            "source": "SEC EDGAR Crawler",
            "source_url": "https://sec.gov/edgar/filings/sf-10q-2024q1",
            "detail": "Routine quarterly filing notes addition of defensive risk disclosure language regarding unauthorized environment access assessment.",
            "detected_at": "2024-05-12T16:08:00Z",
            "detected_relative": "21 days before disclosure",
            "confidence": 91,
            "raw_signal": "EXCERPT SEC 10-Q: '...we are currently assessing certain staging anomalies...'",
            "action": "FLAGGED"
        }
    ]
    
    # Okta static indicators seed
    okta_signals = [
        {
            "id": "sig_ok_db_001",
            "vendor": "Okta",
            "type": "credential_leak",
            "severity": "high",
            "title": "Support portal session cookies exposed on Telegram",
            "source": "Web Unlocker paste sites & messaging",
            "source_url": None,
            "detail": "Active support agent authentication cookies captured in hacker-frequented channels.",
            "detected_at": "2023-10-12T15:20:00Z",
            "detected_relative": "8 days before disclosure",
            "confidence": 89,
            "raw_signal": "TELEGRAM: okta.my.salesforce.com cookie ...",
            "action": "ALERT_SENT"
        },
        {
            "id": "sig_ok_db_002",
            "vendor": "Okta",
            "type": "github",
            "severity": "medium",
            "title": "Support automation script exposed with environment variables",
            "source": "GitHub Public Scanning",
            "source_url": "https://github.com/okta-support-automation/scripts/commit/bc392a",
            "detail": "Public code commit outlines URL paths and attachment structures of ticketing engines.",
            "detected_at": "2023-10-14T09:12:00Z",
            "detected_relative": "6 days before disclosure",
            "confidence": 85,
            "raw_signal": "fetch_har_files.js: endpoint = '...' ",
            "action": "LOGGED"
        }
    ]

    # Seed signals in database
    for s in snowflake_signals + okta_signals:
        cursor.execute("""
            INSERT INTO signals (
                id, vendor, type, severity, title, source, source_url, 
                detail, detected_at, detected_relative, confidence, raw_signal, action
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"], s["vendor"], s["type"], s["severity"], s["title"], 
            s["source"], s["source_url"], s["detail"], s["detected_at"], 
            s["detected_relative"], s["confidence"], s["raw_signal"], s["action"]
        ))

# DB operations APIs
def fetch_signals_by_vendor(vendor: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM signals WHERE vendor = ?", (vendor,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def fetch_latest_signals(limit: int = 10):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM signals ORDER BY detected_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_db_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM signals")
        total = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM signals WHERE severity IN ('critical', 'high')")
        critical = cursor.fetchone()[0]
    except Exception as e:
        total = 0
        critical = 0
    finally:
        conn.close()
    return total, critical

def insert_new_signal(signal: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO signals (
                id, vendor, type, severity, title, source, source_url, 
                detail, detected_at, detected_relative, confidence, raw_signal, action
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            signal["id"], signal["vendor"], signal["type"], signal["severity"],
            signal["title"], signal["source"], signal["source_url"], signal["detail"],
            signal["detected_at"], signal["detected_relative"], signal["confidence"],
            signal["raw_signal"], signal["action"]
        ))
        conn.commit()
    except Exception as e:
        logger.error(f"Error seeding signal: {e}")
    finally:
        conn.close()
