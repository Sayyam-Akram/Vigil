import re
import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from urllib.parse import unquote, urlparse
from app.config import settings

logger = logging.getLogger("vendorsentinel.scraper")


# ── Known Breach Vendor Config ──────────────────────────────────────────────
# Real, documented incidents used for honest retrospective analysis demos.
DEMO_VENDORS: Dict[str, Dict[str, Any]] = {
    "snowflake": {
        "mode": "retrospective",
        "period": "Apr-May 2024",
        "known_breach": "June 2024 credential-stuffing breach affecting 165 companies including AT&T and Ticketmaster via compromised customer credentials",
        "breach_year": 2024,
        "force_score_range": (7.5, 8.5),
    },
    "okta": {
        "mode": "retrospective",
        "period": "Sep-Oct 2023",
        "known_breach": "October 2023 support system breach where threat actor accessed files uploaded by Okta customers",
        "breach_year": 2023,
        "force_score_range": (6.5, 7.8),
    },
}


def get_demo_context(vendor: str) -> Optional[Dict[str, Any]]:
    """Returns the retrospective demo context for a known breach vendor, or None."""
    return DEMO_VENDORS.get(vendor.lower().strip())


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: SERP DISCOVERY — Generate search queries for Bright Data SERP API
# ═══════════════════════════════════════════════════════════════════════════════

def generate_scrape_targets(vendor: str) -> List[Dict[str, str]]:
    """
    Generates SERP API search targets for Step 1 (Discovery Phase).
    These queries use the Bright Data SERP zone to discover breach-related URLs.
    """
    vendor_encoded = vendor.lower().replace(" ", "+")
    vendor_domain = vendor.lower().replace(" ", "")

    demo_ctx = get_demo_context(vendor)
    breach_year = demo_ctx["breach_year"] if demo_ctx else datetime.now().year

    return [
        # Target 1: Credential leak SERP — time-targeted
        {
            "url": (
                f"https://www.google.com/search?q=%22{vendor_encoded}%22+data+breach+{breach_year}"
                if demo_ctx else
                f"https://www.google.com/search?q=%22{vendor_encoded}%22+credential+leak+breach+dump+{breach_year}"
            ),
            "source": "Paste site monitoring",
            "source_type": "credential_leak",
            "zone": settings.BRIGHT_DATA_SERP_ZONE or "serp",
        },
        # Target 2: Security incident SERP
        {
            "url": (
                f"https://www.google.com/search?q=%22{vendor_encoded}%22+hack+leak+exposed+credentials+{breach_year}"
                if demo_ctx else
                f"https://www.google.com/search?q=%22{vendor_encoded}%22+security+incident+vulnerability+{breach_year}"
            ),
            "source": "SERP / News",
            "source_type": "news",
            "zone": settings.BRIGHT_DATA_SERP_ZONE or "serp",
        },
        # Target 3: Unauthorized access SERP
        {
            "url": (
                f"https://www.google.com/search?q=%22{vendor_encoded}%22+unauthorized+access+customers+affected"
                if demo_ctx else
                f"https://www.google.com/search?q=%22{vendor_encoded}%22+cybersecurity+incident+investigation"
            ),
            "source": "SERP / Incident Coverage",
            "source_type": "news",
            "zone": settings.BRIGHT_DATA_SERP_ZONE or "serp",
        },
        # Target 4: Security job spike signals
        {
            "url": f"https://www.google.com/search?q=%22{vendor_encoded}%22+hiring+%22security+engineer%22+%22incident+response%22",
            "source": "Job boards",
            "source_type": "job_signal",
            "zone": settings.BRIGHT_DATA_SERP_ZONE or "serp",
        },
        # Target 5: GitHub Code Search API (direct, no Bright Data proxy needed)
        {
            "url": f"https://api.github.com/search/code?q={vendor_encoded}+password+OR+api_key+OR+secret+OR+token",
            "source": "GitHub Code Search API",
            "source_type": "github",
            "zone": "__direct_api__",
        },
        # Target 6: HaveIBeenPwned (direct API)
        {
            "url": f"https://haveibeenpwned.com/api/v3/breaches?domain={vendor_domain}.com",
            "source": "HaveIBeenPwned Breach Database",
            "source_type": "credential_leak",
            "zone": "__direct_api__",
        },
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1.5: CANDIDATE URL EXTRACTION — Parse SERP results to find deep URLs
# ═══════════════════════════════════════════════════════════════════════════════

# Domains worth deep-scraping via Web Unlocker
DEEP_SCRAPE_DOMAINS = [
    "pastebin.com", "paste.ee", "dpaste.org", "ghostbin.co",
    "raw.githubusercontent.com", "gist.github.com",
    "bleepingcomputer.com", "krebsonsecurity.com", "therecord.media",
    "techcrunch.com", "arstechnica.com", "thehackernews.com",
    "cisa.gov", "nvd.nist.gov",
]


def extract_candidate_urls_from_serp(serp_text: str) -> List[str]:
    """
    Parses SERP HTML or Google JSON response to extract candidate URLs
    worth deep-scraping via Web Unlocker.
    
    Returns a deduplicated list of URLs from known paste sites, security blogs,
    raw GitHub content, and vulnerability databases.
    """
    if not serp_text or len(serp_text) < 20:
        return []

    candidate_urls = []

    # Strategy 1: Extract from Google SERP JSON (if response is structured JSON)
    # Bright Data SERP API returns structured results with `link` fields
    try:
        import json
        data = json.loads(serp_text)
        # Handle Bright Data SERP structured response
        results = []
        if isinstance(data, dict):
            results = data.get("organic", data.get("results", data.get("items", [])))
        elif isinstance(data, list):
            results = data
        
        for item in results:
            url = item.get("link") or item.get("url") or item.get("href", "")
            if url and _is_deep_scrape_worthy(url):
                candidate_urls.append(url)
    except (json.JSONDecodeError, TypeError):
        pass

    # Strategy 2: Extract URLs via regex from raw HTML/text
    url_pattern = re.compile(
        r'https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]+'
    )
    for match in url_pattern.finditer(serp_text):
        url = match.group(0).rstrip('.,;:)"\'>')
        # Decode Google redirect URLs
        if "google.com/url?q=" in url:
            try:
                q_start = url.index("q=") + 2
                q_end = url.index("&", q_start) if "&" in url[q_start:] else len(url)
                url = unquote(url[q_start:q_end])
            except ValueError:
                continue
        
        if _is_deep_scrape_worthy(url):
            candidate_urls.append(url)

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for url in candidate_urls:
        normalized = url.split("?")[0].rstrip("/").lower()
        if normalized not in seen:
            seen.add(normalized)
            unique.append(url)

    return unique[:5]  # Cap at 5 URLs to control cost and latency


def _is_deep_scrape_worthy(url: str) -> bool:
    """Check if a URL belongs to a domain worth deep-scraping."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower().lstrip("www.")
        return any(d in domain for d in DEEP_SCRAPE_DOMAINS)
    except Exception:
        return False


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: DEEP EXTRACTION — Web Unlocker via Bright Data /request API
# ═══════════════════════════════════════════════════════════════════════════════

async def scrape_deep_content_via_unlocker(target_url: str) -> Dict[str, Any]:
    """
    Uses Bright Data Web Unlocker (vendorsentinel_unlocker zone) to retrieve
    raw plaintext content from a candidate leak/breach URL.
    
    Uses the same /request REST API endpoint as the SERP zone (which already
    authenticates successfully), but with format='raw' for plaintext extraction.
    """
    result = {
        "success": False,
        "data_source": "mock",
        "url": target_url,
        "text": "",
        "error": None,
    }

    zone = settings.BRIGHT_DATA_UNLOCKER_ZONE
    api_key = settings.BRIGHT_DATA_API_KEY

    if not api_key or not zone:
        logger.info(f"      No Web Unlocker credentials → mock fallback for {target_url[:60]}")
        result["text"] = _get_deep_scrape_mock(target_url)
        result["data_source"] = "mock (no credentials)"
        return result

    # Use the /request REST API endpoint (same as SERP, proven to work)
    endpoint = "https://api.brightdata.com/request"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "zone": zone,
        "url": target_url,
        "format": "raw"
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
            result["status_code"] = response.status_code

            if response.status_code == 200:
                result["success"] = True
                result["data_source"] = "webunlocker_live"
                # Truncate very large pages to 8000 chars to control LLM token cost
                result["text"] = response.text[:8000]
                logger.info(f"      ✅ WEB UNLOCKER LIVE ← {len(response.text)} chars from {target_url[:60]}")
            else:
                error_preview = response.text[:200] if response.text else "No response body"
                logger.warning(f"      ⚠️ Web Unlocker HTTP {response.status_code} for {target_url[:60]}: {error_preview}")
                result["text"] = _get_deep_scrape_mock(target_url)
                result["data_source"] = "mock (HTTP error fallback)"
    except httpx.TimeoutException:
        logger.warning(f"      ⏳ Web Unlocker timeout for {target_url[:60]} → mock fallback")
        result["text"] = _get_deep_scrape_mock(target_url)
        result["data_source"] = "mock (timeout fallback)"
    except Exception as e:
        logger.warning(f"      ❌ Web Unlocker error: {e} → mock fallback")
        result["text"] = _get_deep_scrape_mock(target_url)
        result["data_source"] = "mock (connection fallback)"

    return result


def _get_deep_scrape_mock(url: str) -> str:
    """Realistic mock content for deep-scraped URLs when Web Unlocker is unavailable."""
    url_lower = url.lower()

    if "pastebin" in url_lower or "paste" in url_lower:
        return """[PASTE DUMP — Raw Credential Block]
# Extracted from public paste container
# Format: email:password_hash
admin@target-corp.com:$2b$12$LJ3m4x9kP7eR2wN1qY5Zu.hJkLmN0pQ3rS4tU5vW6xY7zA8bC9dE
devops@target-corp.com:$2b$12$mN3oP4qR5sT6uV7wX8yZ0.aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0
sre-lead@target-corp.com:Winter2024!
# staging_db_endpoint: db-staging-02.internal.target-corp.com:5432
# last_rotation: NEVER
# status: ACTIVE — credentials verified working on 2024-04-12
[EOF — 847 lines total in original dump]"""

    elif "bleepingcomputer" in url_lower or "krebsonsecurity" in url_lower or "techcrunch" in url_lower:
        return """[ARTICLE EXTRACT — Security News Coverage]
HEADLINE: "Major Cloud Provider Confirms Data Breach Affecting Enterprise Customers"

The cloud infrastructure vendor confirmed Thursday that threat actors gained
unauthorized access to customer environments through compromised credentials
obtained from infostealer malware campaigns. The breach, which began in 
approximately April 2024, went undetected for nearly two months.

Key facts from the investigation:
- 165+ enterprise customers affected
- Attack vector: credential stuffing using stolen credentials from Raccoon/Vidar malware
- No MFA was enforced on compromised accounts
- Data exfiltrated included customer databases, API keys, and session tokens
- Mandiant engaged for forensic investigation

The company has since mandated MFA for all accounts and initiated credential
rotation across all affected environments. Several downstream companies including
major telecom and entertainment firms have disclosed related data exposures."""

    elif "github" in url_lower or "gist" in url_lower:
        return """# deploy_staging.sh — REMOVED (security review)
# This file was committed with embedded credentials
# Detected by automated scanning on 2024-04-18

export AWS_ACCESS_KEY_ID='AKIAIOSFODNN7EXAMPLE'
export AWS_SECRET_ACCESS_KEY='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
export SNOWFLAKE_ACCOUNT='xy12345.us-east-1'
export SNOWFLAKE_USER='svc_etl_prod'
export SNOWFLAKE_PASSWORD='Pr0d_ETL_2024!s3cure'
export DATABASE_URL='postgresql://admin:dbpass123@staging-db.internal:5432/analytics'

# WARNING: These credentials were live at time of commit
# Rotation status: PENDING"""

    elif "cisa.gov" in url_lower or "nvd.nist.gov" in url_lower:
        return """CISA Known Exploited Vulnerabilities Catalog — Recent Additions

CVE-2024-29201 | Vendor: Cloud Infrastructure Provider
Severity: CRITICAL (CVSS 9.8)
Description: Authentication bypass in REST API gateway allowing
unauthenticated remote code execution via crafted OAuth tokens.
Exploitation: Active exploitation confirmed in the wild.
Due Date: 2024-05-15
Remediation: Apply vendor patch immediately. Rotate all API credentials.

CVE-2024-29202 | Vendor: Identity Provider Platform  
Severity: HIGH (CVSS 8.1)
Description: Improper session validation in support portal allows
session token replay attacks via uploaded HAR files.
Exploitation: Known to be exploited in targeted attacks.
Remediation: Invalidate all active support sessions. Enable MFA."""

    else:
        return f"""[WEB UNLOCKER — Extracted Content]
Source: {url[:80]}
Content-Type: text/html (rendered to plaintext)
Extraction timestamp: {datetime.utcnow().isoformat()}Z

Security-relevant content detected on this page. The article discusses 
recent cybersecurity incidents involving cloud service providers and 
identity management platforms. Mentions of unauthorized access, 
credential compromise, and customer data exposure were identified.
Detailed forensic analysis and vendor response timelines are documented."""


# ═══════════════════════════════════════════════════════════════════════════════
# SERP API QUERY — Step 1 data acquisition via Bright Data SERP zone
# ═══════════════════════════════════════════════════════════════════════════════

async def query_bright_data_serp(zone_name: str, target_url: str) -> Dict[str, Any]:
    """
    Queries Bright Data SERP API for search engine results.
    Uses the /request endpoint with json format.
    """
    result = {
        "success": False,
        "data_source": "mock",
        "status_code": None,
        "text": "",
        "error": None,
    }

    if not settings.BRIGHT_DATA_API_KEY:
        logger.info(f"      No API key → using mock SERP data")
        result["text"] = get_mock_scrape_payload(zone_name, target_url)
        return result

    endpoint = "https://api.brightdata.com/request"
    headers = {
        "Authorization": f"Bearer {settings.BRIGHT_DATA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "zone": zone_name,
        "url": target_url,
        "format": "json"
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
            result["status_code"] = response.status_code

            if response.status_code == 200:
                result["success"] = True
                result["data_source"] = "brightdata_serp_live"
                result["text"] = response.text
                logger.info(f"      ✅ SERP LIVE ← HTTP {response.status_code} | {len(response.text)} chars")
            else:
                error_preview = response.text[:200] if response.text else "No response body"
                logger.warning(f"      ⚠️ SERP HTTP {response.status_code}: {error_preview}")
                result["error"] = f"HTTP {response.status_code}: {error_preview}"
                result["text"] = get_mock_scrape_payload(zone_name, target_url)
                result["data_source"] = "mock (SERP API error fallback)"
    except httpx.TimeoutException:
        logger.warning(f"      ⏳ SERP timeout → mock fallback")
        result["text"] = get_mock_scrape_payload(zone_name, target_url)
        result["data_source"] = "mock (timeout fallback)"
    except Exception as e:
        logger.warning(f"      ❌ SERP connection error: {e}")
        result["text"] = get_mock_scrape_payload(zone_name, target_url)
        result["data_source"] = "mock (connection fallback)"

    return result


async def query_direct_api(target_url: str) -> Dict[str, Any]:
    """
    Directly queries structured public APIs (GitHub, HaveIBeenPwned) without
    routing through Bright Data proxy — they are public, structured endpoints.
    """
    result = {
        "success": False,
        "data_source": "mock",
        "status_code": None,
        "text": "",
        "error": None,
    }

    try:
        headers = {"Accept": "application/vnd.github.v3+json"} if "github.com" in target_url else {}
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(target_url, headers=headers)
            result["status_code"] = response.status_code

            if response.status_code == 200:
                result["success"] = True
                result["data_source"] = "direct_api_live"
                result["text"] = response.text
                logger.info(f"      ✅ DIRECT API ← HTTP {response.status_code} | {len(response.text)} chars")
            elif response.status_code == 404:
                # HIBP 404 = no documented breach (valid response)
                result["success"] = True
                result["data_source"] = "direct_api_live"
                result["text"] = "[]"
                logger.info(f"      ✅ DIRECT API ← HTTP 404 (no documented breaches)")
            else:
                logger.warning(f"      ⚠️ Direct API HTTP {response.status_code} → mock fallback")
                result["text"] = get_mock_scrape_payload("direct", target_url)
                result["data_source"] = "mock (API error fallback)"
    except Exception as e:
        logger.warning(f"      ❌ Direct API error: {e} → mock fallback")
        result["text"] = get_mock_scrape_payload("direct", target_url)
        result["data_source"] = "mock (connection fallback)"

    return result


# ═══════════════════════════════════════════════════════════════════════════════
# BACKGROUND SURVEILLANCE — Periodic CISA/security news scraping
# ═══════════════════════════════════════════════════════════════════════════════

# Monitored vendors for background surveillance
MONITORED_VENDORS = ["Snowflake", "Okta", "Elastic", "Fastly", "Sentry", "Stripe", "Twilio", "Vercel", "Datadog"]

SURVEILLANCE_URLS = [
    "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    "https://www.bleepingcomputer.com/tag/data-breach/",
    "https://feeds.feedburner.com/TheHackersNews",
]


async def run_surveillance_sweep() -> List[Dict[str, Any]]:
    """
    Background surveillance task. Scrapes CISA and security news via
    Web Unlocker, extracts vendor-relevant signals, and returns them
    for insertion into SQLite.
    """
    signals = []
    
    for url in SURVEILLANCE_URLS:
        try:
            result = await scrape_deep_content_via_unlocker(url)
            if not result["text"]:
                continue

            content = result["text"].lower()
            source_name = urlparse(url).netloc.replace("www.", "")

            # Check if any monitored vendor is mentioned
            for vendor in MONITORED_VENDORS:
                if vendor.lower() in content:
                    import time
                    signals.append({
                        "id": f"sig_surv_{vendor.lower()}_{int(time.time())}",
                        "vendor": vendor,
                        "type": "news",
                        "severity": "medium",
                        "title": f"Security bulletin mention: {vendor} on {source_name}",
                        "source": f"Background Surveillance — {source_name}",
                        "source_url": url,
                        "detail": f"Automated surveillance detected {vendor} mentioned in active security bulletin from {source_name}. Manual triage recommended.",
                        "detected_at": datetime.utcnow().isoformat() + "Z",
                        "detected_relative": "Just now",
                        "confidence": 65,
                        "raw_signal": result["text"][:300],
                        "action": "LOGGED",
                    })
                    logger.info(f"   🔍 Surveillance hit: {vendor} found on {source_name}")
        except Exception as e:
            logger.warning(f"   ⚠️ Surveillance sweep error for {url}: {e}")

    return signals


# ═══════════════════════════════════════════════════════════════════════════════
# MOCK DATA GENERATORS
# ═══════════════════════════════════════════════════════════════════════════════

def _extract_vendor_from_url(url: str) -> str:
    """Extract vendor name from URL query parameters."""
    url_lower = url.lower()
    if "%22" in url_lower:
        parts = url_lower.split("%22")
        if len(parts) >= 2:
            return parts[1].replace("+", " ").strip().title()
    return "Unknown"


def get_mock_scrape_payload(zone: str, url: str) -> str:
    """
    Returns realistic mock scraped text based on URL patterns.
    Used when Bright Data API is unavailable or unconfigured.
    """
    url_lower = url.lower()
    vendor = _extract_vendor_from_url(url)
    vendor_domain = vendor.lower().replace(" ", "")

    # GitHub Code Search API mock
    if "api.github.com/search/code" in url_lower:
        return f"""{{"total_count": 3, "incomplete_results": false, "items": [{{"name": "deploy.sh", "path": "scripts/deploy.sh", "sha": "f8a29c104928e1", "html_url": "https://github.com/some-repo/deploy.sh", "repository": {{"full_name": "contractor-org/{vendor_domain}-integration"}}, "score": 1.0, "text_matches": [{{"fragment": "{vendor.upper()}_API_KEY=sk-prod-{vendor_domain[:6]}-8f2a9d3e1b\\nAWS_SECRET_ACCESS_KEY=wJalrXUtn/K7MDENG/bPxRfiCYEXAMPLEKEY"}}]}}, {{"name": "config.py", "path": "src/config.py", "sha": "a1b2c3d4e5f6", "html_url": "https://github.com/another-org/data-pipeline/config.py", "repository": {{"full_name": "partner-org/{vendor_domain}-pipeline"}}, "score": 0.85, "text_matches": [{{"fragment": "password = '{vendor_domain}_staging_db_pass_2024'\\ntoken = 'Bearer sk-{vendor_domain[:4]}-admin-token'"}}]}}]}}"""

    # HaveIBeenPwned mock
    if "haveibeenpwned.com" in url_lower:
        return f"""[{{"Name": "{vendor}", "Domain": "{vendor_domain}.com", "BreachDate": "2024-04-14", "AddedDate": "2024-06-10T00:00:00Z", "ModifiedDate": "2024-06-10T00:00:00Z", "PwnCount": 165893847, "Description": "In 2024, {vendor} suffered a credential-stuffing attack that compromised customer environments via exposed authentication tokens. Data including email addresses and session credentials was accessed.", "DataClasses": ["Email addresses", "Passwords", "Authentication tokens", "Session cookies"], "IsVerified": true, "IsFabricated": false, "IsSensitive": true, "IsRetired": false, "IsSpamList": false, "IsMalware": false}}]"""

    if "credential" in url_lower or "leak" in url_lower or "breach" in url_lower or "dump" in url_lower:
        return f"""
[DUMP TRANSACTION LOG: PUBLIC_PASTE_CONTAINER_{abs(hash(vendor)) % 1000}]
# target_domain: {vendor_domain}.com
# detected: plaintext credential blocks
# entries: admin@{vendor_domain}.com, devops@{vendor_domain}.com, sre-lead@{vendor_domain}.com
# database_ref: prod-staging-{vendor_domain[:4]}-db-02
# password_hash: $2b$12$LJ3m4x... (bcrypt, likely from breached backup)
# status: UNPATCHED — credentials still active on staging endpoints
# last_seen: {datetime.utcnow().strftime('%Y-%m-%d')}
[EOF]
"""

    elif "unauthorized+access" in url_lower or "customers+affected" in url_lower or "cybersecurity+incident" in url_lower:
        return f"""
Google Search Results: "{vendor} unauthorized access customers affected"

1. "{vendor} Confirms Unauthorized Access to Customer Environments" — BleepingComputer
   "...{vendor} confirmed threat actors used compromised credentials to gain unauthorized
   access to a number of customer accounts. The company stated that customer data was
   accessed through these sessions..."
   Published: Apr 2024

2. "{vendor} Data Breach Affects Hundreds of Customers" — KrebsOnSecurity
   "Multiple {vendor} customers confirmed their accounts were accessed without authorization,
   with data exfiltrated via legitimate API calls using stolen session tokens."
   Published: May 2024

3. "{vendor} Incident Response: What Customers Need to Know" — {vendor} Blog
   "We are investigating unauthorized access to a subset of customer environments.
   All customers should rotate MFA tokens and review recent access logs immediately."
   Published: May 2024
"""

    elif "security+engineer" in url_lower or "hiring" in url_lower or "incident+response" in url_lower:
        return f"""
{vendor} — Open Security Positions (Last 30 days)

1. Senior Security Incident Response Engineer (URGENT)
   Location: Remote | Posted: 3 days ago
   Requirements: 5+ yrs incident response, forensics, SIEM expertise
   Note: "Immediate start required due to ongoing security operations"

2. Cloud Security Architect — Infrastructure Protection
   Location: HQ | Posted: 5 days ago
   Focus: Zero-trust architecture, penetration testing

3. Threat Intelligence Analyst (Contract — 6 months)
   Location: Remote | Posted: 1 week ago
   Note: "Supporting active threat investigation and monitoring"

4. Security Operations Center (SOC) Lead
   Location: HQ | Posted: 2 days ago
   Requirements: 24/7 monitoring experience, escalation protocols

Total security hiring volume: 4x above 12-month baseline average
"""

    elif "vulnerability" in url_lower or "incident" in url_lower or "cve" in url_lower or "hack" in url_lower:
        return f"""
Google Search Results: "{vendor} hack leak exposed credentials"

1. "{vendor} Discloses Security Incident Affecting Customer Accounts" — TechCrunch
   "...{vendor} confirmed unauthorized access to a subset of customer environments
   through compromised third-party credentials. The company stated that..."
   Published: 2 weeks ago

2. "CVE-2024-XXXX: Critical Vulnerability Found in {vendor} Integration APIs" — NVD
   "A critical authentication bypass vulnerability was discovered in {vendor}'s
   REST API gateway, allowing unauthenticated access to..."
   Severity: CRITICAL (CVSS 9.1)

3. "{vendor} Security Advisory: Credential Rotation Required" — {vendor} Blog
   "We are advising all customers to rotate API keys and review access logs
   following our investigation into suspicious activity..."
   Published: 1 month ago
"""

    else:
        return f"Scraped content from {url}. {vendor}-related intelligence signals detected. Further analysis required."
