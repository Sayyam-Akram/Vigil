import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger("vendorsentinel.scraper")


def generate_scrape_targets(vendor: str) -> List[Dict[str, str]]:
    """
    Generates a list of target URLs to scrape for intelligence on a given vendor.
    Maps to 6 source types including credential leaks, news, GitHub, job signals, regulatory, and certificate transparency.
    Each target specifies which Bright Data zone to route through.
    """
    vendor_encoded = vendor.lower().replace(" ", "+")
    vendor_domain = vendor.lower().replace(" ", "")
    current_year = datetime.now().year

    return [
        {
            "url": f"https://www.google.com/search?q=%22{vendor_encoded}%22+credential+leak+breach+dump+{current_year}",
            "source": "Paste site monitoring",
            "source_type": "credential_leak",
            "zone": settings.BRIGHT_DATA_SERP_ZONE or "serp",
        },
        {
            "url": f"https://www.google.com/search?q=%22{vendor_encoded}%22+security+incident+vulnerability+CVE+{current_year}",
            "source": "SERP / News",
            "source_type": "news",
            "zone": settings.BRIGHT_DATA_SERP_ZONE or "serp",
        },
        {
            "url": f"https://github.com/search?q=%22{vendor_encoded}%22+password+OR+api_key+OR+secret+OR+token&type=code",
            "source": "GitHub Public Scan",
            "source_type": "github",
            "zone": settings.BRIGHT_DATA_UNLOCKER_ZONE or "unblocker",
        },
        {
            "url": f"https://www.google.com/search?q=%22{vendor_encoded}%22+hiring+%22security+engineer%22+%22incident+response%22",
            "source": "Job boards",
            "source_type": "job_signal",
            "zone": settings.BRIGHT_DATA_SERP_ZONE or "serp",
        },
        {
            "url": f"https://efts.sec.gov/LATEST/search-index?q=%22{vendor_encoded}%22+cybersecurity",
            "source": "SEC EDGAR",
            "source_type": "regulatory",
            "zone": settings.BRIGHT_DATA_UNLOCKER_ZONE or "unblocker",
        },
        {
            "url": f"https://crt.sh/?q=%25.{vendor_domain}.com",
            "source": "Certificate Transparency Monitoring",
            "source_type": "shadow_it",
            "zone": settings.BRIGHT_DATA_UNLOCKER_ZONE or "unblocker",
        },
    ]


async def query_bright_data_api(zone_name: str, target_url: str) -> Dict[str, Any]:
    """
    Scrapes a target URL via Bright Data's API endpoint.
    Returns a dict with metadata: success, data_source, status_code, text, error.
    Falls back gracefully to mock data if API key missing or request fails.
    """
    result = {
        "success": False,
        "data_source": "mock",
        "status_code": None,
        "text": "",
        "error": None,
    }

    if not settings.BRIGHT_DATA_API_KEY:
        logger.info(f"      No API key configured → using mock data")
        result["text"] = get_mock_scrape_payload(zone_name, target_url)
        return result

    endpoint = "https://api.brightdata.com/request"
    headers = {
        "Authorization": f"Bearer {settings.BRIGHT_DATA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Bright Data requires a 'format' parameter. Use 'json' for SERP APIs to get structured data, and 'raw' for Web Unlocker.
    req_format = "json" if "serp" in zone_name.lower() else "raw"
    payload = {
        "zone": zone_name,
        "url": target_url,
        "format": req_format
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
            result["status_code"] = response.status_code

            if response.status_code == 200:
                result["success"] = True
                result["data_source"] = "brightdata_live"
                result["text"] = response.text
                logger.info(f"      ✅ LIVE DATA ← HTTP {response.status_code} | {len(response.text)} chars received")
            else:
                error_preview = response.text[:200] if response.text else "No response body"
                logger.warning(f"      ⚠️  Bright Data HTTP {response.status_code}: {error_preview}")
                result["error"] = f"HTTP {response.status_code}: {error_preview}"
                result["text"] = get_mock_scrape_payload(zone_name, target_url)
                result["data_source"] = "mock (API error fallback)"
    except httpx.TimeoutException:
        logger.warning(f"      ⏳ Request timeout after 30s → falling back to mock data")
        result["error"] = "Request timeout (30s)"
        result["text"] = get_mock_scrape_payload(zone_name, target_url)
        result["data_source"] = "mock (timeout fallback)"
    except Exception as e:
        logger.warning(f"      ❌ Connection error: {e}")
        result["error"] = str(e)
        result["text"] = get_mock_scrape_payload(zone_name, target_url)
        result["data_source"] = "mock (connection fallback)"

    return result


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
    Returns realistic mock scraped text based on URL patterns and vendor name.
    Used when Bright Data API is unavailable or unconfigured.
    """
    url_lower = url.lower()
    vendor = _extract_vendor_from_url(url)
    vendor_domain = vendor.lower().replace(" ", "")

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

    elif "github" in url_lower or "code" in url_lower:
        return f"""
commit f8a29c104928e10023a10294f923b8911b380a9f
Author: dev-ops <devops@{vendor_domain}.com>
Date:   Thu Apr 18 10:45:22 2024 -0700

    infrastructure: temporary deployment verification script.

diff --git a/scripts/deploy.sh b/scripts/deploy.sh
--- a/scripts/deploy.sh
+++ b/scripts/deploy.sh
@@ -12,4 +12,8 @@
 # TODO: Rotate credentials before production push
+AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
+AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
+{vendor.upper()}_INTERNAL_API_KEY="sk-prod-{vendor_domain[:6]}-8f2a9d3e1b"
 staging_bucket="s3://{vendor_domain}-staging-data-lake/backup/"
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

    elif "sec.gov" in url_lower or "cybersecurity" in url_lower:
        return f"""
EXCERPT FORM 10-Q (QUARTERLY REPORT) — {vendor.upper()} INC.
FILED: {datetime.utcnow().strftime('%B %Y')}

RISK FACTORS (Item 1A):
... The Company is currently conducting an internal assessment of its
cybersecurity controls following identification of anomalous access patterns
in certain staging database environments. While no material customer data
compromise has been confirmed, the investigation remains ongoing.

The Company has engaged third-party forensic specialists to evaluate the
scope and impact of these access patterns. Remediation measures including
credential rotation, enhanced monitoring, and access control reviews have
been implemented. The financial impact, if any, cannot be determined at
this time...
"""

    elif "vulnerability" in url_lower or "incident" in url_lower or "cve" in url_lower:
        return f"""
Google Search Results: "{vendor} security incident vulnerability"

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

    elif "crt.sh" in url_lower or "shadow_it" in url_lower:
        return f"""
Registered Certificates for {vendor_domain}.com (Source: crt.sh):
1. vpn.{vendor_domain}.com | Issuer: Let's Encrypt | Registered: {datetime.utcnow().strftime('%Y-%m-%d')}
2. stage-db-replica.{vendor_domain}.com | Issuer: Let's Encrypt | Registered: {datetime.utcnow().strftime('%Y-%m-%d')}
3. remote-access-admin.{vendor_domain}.com | Issuer: Let's Encrypt | Registered: {datetime.utcnow().strftime('%Y-%m-%d')}
Analysis: Newly registered development and access subdomains discovered. Potential exposure of unmonitored infrastructure.
"""

    else:
        return f"Scraped content from {url}. {vendor}-related intelligence signals detected. Further analysis required."
