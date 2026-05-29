// Centralized mock data for VendorSentinel matching backend API contracts exactly

export const SNOWFLAKE_ANALYSIS = {
  vendor: "Snowflake",
  risk_score: 8.1,
  risk_tier: "CRITICAL",
  timestamp: "2026-05-25T14:23:07Z",
  summary: "Continuous public web monitoring detected early warning signals starting 49 days prior to the public breach announcement on June 2, 2024. Leakage includes public paste sites credential dumps, significant team attrition within key security infrastructure, and subtle SEC EDGAR filing disclosure updates.",
  signal_count: 11,
  recommended_action: "Immediately restrict active write permissions for federated Snowflake databases. Require urgent multi-factor authentication rotation for all accounts. Request emergency security attestation from Snowflake within 24 hours.",
  compliance_refs: ["DORA Art.28", "SOC 2 CC9.2", "ISO 27001 A.15", "NIST ID.SC-2"],
  pipeline_stats: {
    raw_signals_processed: 847,
    survived_filter: 23,
    filter_rate_pct: 2.7,
    processing_time_ms: 4200
  },
  report_hash: "sha256:c4d18a7e2f63b891d4a7a8f102be8d1ef9a82bb8cc7d6bfd8a23078a9c392817",
  signals: [
    {
      id: "sig_sf_001",
      type: "credential_leak",
      severity: "critical",
      title: "Plaintext corporate credentials on public paste site",
      source: "Paste site monitoring via Bright Data Web Unlocker",
      source_url: "https://pastebin.com/archive/leak-sf-77a83d",
      detail: "14 matching @snowflake.com employee email addresses found in public credential dump alongside plaintext passwords. Hashes confirm direct dump leaks.",
      detected_at: "2024-04-14T03:17:00Z",
      detected_relative: "49 days before disclosure",
      confidence: 96,
      raw_signal: "[DUMP SECTIONS: email_list, plain_pw] ... jsmith@snowflake.com:Winter2023! ... target_db_cluster: sf-prod-east-02 ... raw_entropy: high"
    },
    {
      id: "sig_sf_002",
      type: "github",
      severity: "high",
      title: "Hardcoded AWS Access Key in public GitHub repository",
      source: "GitHub Public Scanning",
      source_url: "https://github.com/snowflake-labs/temp-dev-tools/commit/a8d29b",
      detail: "Developer committed a testing script to a public repository containing internal AWS access key with broad permissions. Key remains active.",
      detected_at: "2024-04-18T10:45:00Z",
      detected_relative: "45 days before disclosure",
      confidence: 94,
      raw_signal: "commit: a8d29b104928e10023a1029  diff: +  AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE' +  AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'"
    },
    {
      id: "sig_sf_003",
      type: "personnel",
      severity: "medium",
      title: "Security Operations Analyst departures spike",
      source: "LinkedIn Web Scraper",
      source_url: null,
      detail: "2 mid-level Security Operations Center analysts updated profiles to indicate roles ended. Team departure trend starting to drift.",
      detected_at: "2024-04-22T08:12:00Z",
      detected_relative: "41 days before disclosure",
      confidence: 80,
      raw_signal: "PROFILE_DRIFT: SOC Analyst (Security Ops), duration: 11 mos -> ended April 2024. PROFILE_DRIFT: Senior SecOps Engineer -> ended April 2024."
    },
    {
      id: "sig_sf_004",
      type: "personnel",
      severity: "high",
      title: "Director of Infrastructure and Security resigns abruptly",
      source: "LinkedIn public signals",
      source_url: "https://linkedin.com/in/director-infra-sf-profile",
      detail: "Key security decision-maker announced transition to a new firm with no pre-disclosed successor. Roles empty.",
      detected_at: "2024-04-28T11:42:00Z",
      detected_relative: "35 days before disclosure",
      confidence: 84,
      raw_signal: "Announcing new adventure at TechScaleCorp. Leaving Snowflake after 3 memorable years of building. No replacement tags on file."
    },
    {
      id: "sig_sf_005",
      type: "job_signal",
      severity: "medium",
      title: "Urgent recruitment posting for Incident Response Lead",
      source: "Indeed Web Scraper API",
      source_url: null,
      detail: "Snowflake recruiting for a 24/7 emergency incident responder. Listing notes dynamic crisis management and forensics skills required immediately.",
      detected_at: "2024-05-03T14:30:00Z",
      detected_relative: "30 days before disclosure",
      confidence: 90,
      raw_signal: "RECRUITING: Senior Manager, Incident Response & Digital Forensics. Focus: Lead active network investigations, triage high-severity security breaches under pressure. Immediate start."
    },
    {
      id: "sig_sf_006",
      type: "job_signal",
      severity: "medium",
      title: "Security recruitment volume spikes to 4x baseline",
      source: "Lever Board Scan API",
      source_url: null,
      detail: "8 new cybersecurity postings in 14 days (previous historical baseline was 2 monthly). Focus centers on threat hunting and boundary protection.",
      detected_at: "2024-05-08T09:00:00Z",
      detected_relative: "25 days before disclosure",
      confidence: 88,
      raw_signal: "ANALYSIS: Job volume delta. Baseline: 2/mo. Current active postings: 8/week. Category: Security Engineering, Network Hardening, Pen Testing."
    },
    {
      id: "sig_sf_007",
      type: "news",
      severity: "medium",
      title: "Subtle SEC Form 10-Q references 'unauthorized access' triage",
      source: "SEC EDGAR Crawler",
      source_url: "https://sec.gov/edgar/filings/sf-10q-2024q1",
      detail: "Routine quarterly filing notes addition of defensive risk disclosure language regarding unauthorized environment access assessment.",
      detected_at: "2024-05-12T16:08:00Z",
      detected_relative: "21 days before disclosure",
      confidence: 91,
      raw_signal: "EXCERPT SEC 10-Q: '...we are currently assessing certain anomalies within our secondary staging instances. While we do not anticipate material disruption, unauthorized access could impact operational workflows...'"
    },
    {
      id: "sig_sf_008",
      type: "github",
      severity: "high",
      title: "Internal data synchronization utility script exposed",
      source: "GitHub Public Scanning",
      source_url: "https://github.com/developer-sf/sync-tools-public",
      detail: "Public repository contains script detailing internal db staging endpoints, naming conventions, and local mount directory structures.",
      detected_at: "2024-05-19T22:15:00Z",
      detected_relative: "14 days before disclosure",
      confidence: 87,
      raw_signal: "sync_staging.sh: cp -r /mnt/customer_data_dump/ s3://sf-staging-data-lake-prod/backup/ --exclude=*.log"
    },
    {
      id: "sig_sf_009",
      type: "news",
      severity: "high",
      title: "Cryptic forum references to massive database export files",
      source: "Dark web crawling / SERP API",
      source_url: null,
      detail: "Breach forum posts mention sale of major database tables. Metadata fields match Snowflake customer schemas.",
      detected_at: "2024-05-24T18:40:00Z",
      detected_relative: "9 days before disclosure",
      confidence: 92,
      raw_signal: "THREAT: 'Selling high-quality db from major analytics corp. Contains: billing profiles, storage stats, raw credentials, data lake configs. Total: 200M entries. Samples available.'"
    },
    {
      id: "sig_sf_010",
      type: "news",
      severity: "critical",
      title: "Tech blogger publishes rumors of widespread staging breach",
      source: "SERP API · Google News",
      source_url: "https://techrumor.net/snowflake-leak-incident",
      detail: "Subtle industry rumor site lists anonymous sources claiming multiple Snowflake staging containers are compromised by ransomware vectors.",
      detected_at: "2024-05-29T11:05:00Z",
      detected_relative: "4 days before disclosure",
      confidence: 95,
      raw_signal: "INSIDER NOTE: Rumors circulating in cybersecurity circles that Snowflake has pulled multiple engineers from regular cycles to address staging lake data leakage."
    },
    {
      id: "sig_sf_011",
      type: "regulatory",
      severity: "critical",
      title: "PUBLIC DISCLOSURE: Official security incident confirmed",
      source: "SEC EDGAR / Snowflake Press Room",
      source_url: "https://snowflake.com/news/security-update-june-2024",
      detail: "Snowflake officially announces a major security event involving unauthorized staging access. Risk realized publicly.",
      detected_at: "2024-06-02T14:00:00Z",
      detected_relative: "Day of disclosure",
      confidence: 100,
      raw_signal: "PRESS: 'Snowflake has identified a targeted threat campaign directing unauthorized logins towards staging and demo customer accounts...'"
    }
  ]
};

export const OKTA_ANALYSIS = {
  vendor: "Okta",
  risk_score: 6.8,
  risk_tier: "HIGH",
  timestamp: "2026-05-25T14:10:00Z",
  summary: "Third-party monitoring identifies active signal triggers regarding support credentials compromise. Web telemetry recorded specialized GitHub commits and news mentions on secure message boards days before corporate confirmation.",
  signal_count: 8,
  recommended_action: "Require session termination for all support and helpdesk agents. Implement hardware token overrides for administrator portals. Restrict customer support attachment upload types.",
  compliance_refs: ["DORA Art.28", "SOC 2 CC9.2", "ISO 27001 A.15"],
  pipeline_stats: {
    raw_signals_processed: 612,
    survived_filter: 14,
    filter_rate_pct: 2.2,
    processing_time_ms: 3100
  },
  report_hash: "sha256:d8c29bf2a10b4847e30ba781f211da83e2bb97f7ee6f4bd7ea1239c89abdf012",
  signals: [
    {
      id: "sig_ok_001",
      type: "credential_leak",
      severity: "high",
      title: "Support portal session cookies exposed on Telegram",
      source: "Web Unlocker paste sites & messaging",
      source_url: null,
      detail: "Active support agent authentication cookies captured in hacker-frequented channels. Session targets internal dashboards.",
      detected_at: "2023-10-12T15:20:00Z",
      detected_relative: "8 days before disclosure",
      confidence: 89,
      raw_signal: "TELEGRAM CHNL: cookie_log.txt -> site: okta.my.salesforce.com cookie: sid=00D50000000I... user: agent_support_09@okta.com"
    },
    {
      id: "sig_ok_002",
      type: "github",
      severity: "medium",
      title: "Support automation script exposed with embedded environment identifiers",
      source: "GitHub Public Scanning",
      source_url: "https://github.com/okta-support-automation/scripts/commit/bc392a",
      detail: "Public code commit outlines URL paths, API token formats, and structure of support ticket attachments processing pipeline.",
      detected_at: "2023-10-14T09:12:00Z",
      detected_relative: "6 days before disclosure",
      confidence: 85,
      raw_signal: "fetch_har_files.js: endpoint = 'https://support.okta.com/api/v2/tickets/' + ticket_id + '/attachments'"
    },
    {
      id: "sig_ok_003",
      type: "news",
      severity: "high",
      title: "Security portal logs show anomalous HAR file uploads",
      source: "Google News / SERP API",
      source_url: null,
      detail: "Cybersecurity research group highlights risk of malicious HAR files used in support systems to hijack active sessions.",
      detected_at: "2023-10-16T11:40:00Z",
      detected_relative: "4 days before disclosure",
      confidence: 91,
      raw_signal: "FORUM THREAD: Warning on HAR file logs. Session hijacking targets helpdesks via HTTP Archive attachments. Active vector exploited."
    },
    {
      id: "sig_ok_004",
      type: "regulatory",
      severity: "critical",
      title: "PUBLIC DISCLOSURE: Customer support system breach confirmed",
      source: "Okta Official Advisory",
      source_url: "https://okta.com/blog/security-incident-october-2023",
      detail: "Okta officially confirms threat actors accessed support cases, downloading sensitive HAR files containing active session cookies.",
      detected_at: "2023-10-20T13:00:00Z",
      detected_relative: "Day of disclosure",
      confidence: 100,
      raw_signal: "PRESS: 'Okta has identified adversarial activity that leveraged access to a support system credentials to hijack active sessions...'"
    }
  ]
};

export const LIVE_SIGNALS_FEED = [
  {
    id: "sig_live_001",
    vendor: "Snowflake",
    type: "credential_leak",
    severity: "critical",
    source: "Paste site monitoring",
    detected_relative: "2 minutes ago",
    action: "ALERT_SENT"
  },
  {
    id: "sig_live_002",
    vendor: "Okta",
    type: "personnel",
    severity: "high",
    source: "LinkedIn signals",
    detected_relative: "4 minutes ago",
    action: "MONITORING"
  },
  {
    id: "sig_live_003",
    vendor: "Stripe",
    type: "job_signal",
    severity: "medium",
    source: "Job boards",
    detected_relative: "6 minutes ago",
    action: "FLAGGED"
  },
  {
    id: "sig_live_004",
    vendor: "GitHub",
    type: "news",
    severity: "medium",
    source: "SERP / News",
    detected_relative: "8 minutes ago",
    action: "LOGGED"
  },
  {
    id: "sig_live_005",
    vendor: "Twilio",
    type: "regulatory",
    severity: "high",
    source: "SEC EDGAR",
    detected_relative: "10 minutes ago",
    action: "ALERT_SENT"
  },
  {
    id: "sig_live_006",
    vendor: "Salesforce",
    type: "credential_leak",
    severity: "high",
    source: "Paste site monitoring",
    detected_relative: "12 minutes ago",
    action: "ALERT_SENT"
  },
  {
    id: "sig_live_007",
    vendor: "AWS",
    type: "github",
    severity: "medium",
    source: "GitHub Public Scan",
    detected_relative: "15 minutes ago",
    action: "LOGGED"
  },
  {
    id: "sig_live_008",
    vendor: "Cloudflare",
    type: "news",
    severity: "low",
    source: "SERP / News",
    detected_relative: "18 minutes ago",
    action: "LOGGED"
  },
  {
    id: "sig_live_009",
    vendor: "MongoDB",
    type: "job_signal",
    severity: "medium",
    source: "Job boards",
    detected_relative: "20 minutes ago",
    action: "FLAGGED"
  },
  {
    id: "sig_live_010",
    vendor: "Datadog",
    type: "personnel",
    severity: "medium",
    source: "LinkedIn signals",
    detected_relative: "22 minutes ago",
    action: "MONITORING"
  },
  {
    id: "sig_live_011",
    vendor: "Microsoft",
    type: "regulatory",
    severity: "high",
    source: "SEC EDGAR",
    detected_relative: "25 minutes ago",
    action: "ALERT_SENT"
  },
  {
    id: "sig_live_012",
    vendor: "Slack",
    type: "credential_leak",
    severity: "critical",
    source: "Paste site monitoring",
    detected_relative: "28 minutes ago",
    action: "ALERT_SENT"
  },
  {
    id: "sig_live_013",
    vendor: "HubSpot",
    type: "github",
    severity: "high",
    source: "GitHub Public Scan",
    detected_relative: "32 minutes ago",
    action: "ALERT_SENT"
  },
  {
    id: "sig_live_014",
    vendor: "Atlassian",
    type: "news",
    severity: "medium",
    source: "SERP / News",
    detected_relative: "35 minutes ago",
    action: "LOGGED"
  },
  {
    id: "sig_live_015",
    vendor: "Auth0",
    type: "credential_leak",
    severity: "critical",
    source: "Paste site monitoring",
    detected_relative: "38 minutes ago",
    action: "ALERT_SENT"
  },
  {
    id: "sig_live_016",
    vendor: "Sentry",
    type: "github",
    severity: "medium",
    source: "GitHub Public Scan",
    detected_relative: "41 minutes ago",
    action: "LOGGED"
  },
  {
    id: "sig_live_017",
    vendor: "Vercel",
    type: "job_signal",
    severity: "low",
    source: "Job boards",
    detected_relative: "45 minutes ago",
    action: "LOGGED"
  },
  {
    id: "sig_live_018",
    vendor: "Render",
    type: "news",
    severity: "medium",
    source: "SERP / News",
    detected_relative: "48 minutes ago",
    action: "FLAGGED"
  },
  {
    id: "sig_live_019",
    vendor: "Fastly",
    type: "personnel",
    severity: "medium",
    source: "LinkedIn signals",
    detected_relative: "52 minutes ago",
    action: "MONITORING"
  },
  {
    id: "sig_live_020",
    vendor: "Elastic",
    type: "regulatory",
    severity: "medium",
    source: "SEC EDGAR",
    detected_relative: "56 minutes ago",
    action: "LOGGED"
  }
];

export const SOURCE_CATALOG = [
  {
    id: "source_serp",
    title: "SERP / News Monitoring",
    status: "LIVE",
    source_type: "SERP API · Google · Bing · Yandex",
    bright_data_tool: "SERP API",
    description: "Monitors global search engine results for news articles, press releases, cybersecurity investigations, and regulatory announcements relating to your vendor portfolio.",
    signal_types: "News mention · Regulatory filing · Enforcement action",
    last_signal: "6 minutes ago",
    rate: "~312 queries/hr",
    example: "Reuters: Snowflake investigating unauthorized access",
    why_bright_data: "Real-time structured SERP results directly bypass aggressive anti-scraping and rate limits on commercial search endpoints."
  },
  {
    id: "source_paste",
    title: "Paste Site Scanning",
    status: "LIVE",
    source_type: "Public paste sites · Credential dumps · Data leak forums",
    bright_data_tool: "Web Unlocker",
    description: "Continuously scrapes public paste sites and dump networks for raw internal domain names, employee databases, database configurations, and plain text credentials.",
    signal_types: "Credential leak · Data exposure · API key exposure",
    last_signal: "23 minutes ago",
    rate: "~48 scans/hr per vendor",
    example: "@snowflake.com emails in public credential dump",
    why_bright_data: "Paste sites aggressively block non-browser scrapers. Web Unlocker with automatic JS rendering and residential proxies is strictly required."
  },
  {
    id: "source_jobs",
    title: "Job Board Signals",
    status: "LIVE",
    source_type: "LinkedIn · Indeed · Glassdoor · Lever · Greenhouse",
    bright_data_tool: "Web Scraper API (Pre-built scrapers)",
    description: "Extracts personnel movement trends: spikes in urgent cybersecurity postings, forensic responder requests, and rapid executive or administrator attrition indicators.",
    signal_types: "Security hiring spike · Executive departure · Team attrition",
    last_signal: "2 hours ago",
    rate: "~24 scans/hr per vendor",
    example: "4 urgent security engineer postings in 14 days (4× baseline)",
    why_bright_data: "LinkedIn aggressively locks down listings under auth walls. Pre-built scrapers handle the complex session-management silently."
  },
  {
    id: "source_github",
    title: "GitHub Public Scanning",
    status: "LIVE",
    source_type: "GitHub public repositories · Commit history · Issues",
    bright_data_tool: "GitHub API + Web Unlocker (extends limits)",
    description: "Tracks public commits, repositories, and open issue tracking comments by vendor-affiliated users to detect committed secrets and vulnerability disclosures.",
    signal_types: "API key exposure · Security advisory · Vulnerability mention",
    last_signal: "41 minutes ago",
    rate: "~96 scans/hr per vendor",
    example: "AWS key committed to snowflake-internal-tools repo",
    why_bright_data: "Extended GitHub API scanning triggers heavy rate throttling. The proxy layer distributes scanning loads globally."
  }
];

export const PIPELINE_NODES = [
  {
    id: "node_scout",
    name: "SCOUT",
    icon: "Globe",
    tech: "Bright Data infrastructure",
    description: "4 sources · bypassing blocks",
    detail: "Bypasses CAPTCHAs, bot networks, and geo-walls on public web.",
    badge: "BRIGHT DATA",
    throughput: 847
  },
  {
    id: "node_filter",
    name: "FILTER",
    icon: "Filter",
    tech: "Keyword & Rule Engine",
    description: "Drops 97.3% of noise",
    detail: "Pre-filters vendor names and security risk keywords instantly.",
    badge: "ZERO COST",
    throughput: 23
  },
  {
    id: "node_analyst",
    name: "ANALYST",
    icon: "Brain",
    tech: "Groq · Llama 3.1 70B",
    description: "Signal classification",
    detail: "High-speed LLM summarizes and validates relevance of raw text.",
    badge: "LLAMA 70B",
    throughput: 23
  },
  {
    id: "node_scorer",
    name: "SCORER",
    icon: "Activity",
    tech: "Dynamic risk weighting",
    description: "0-10 vendor score",
    detail: "Calculates impact and shifts risk indexes in live windows.",
    badge: "ALGORITHMIC",
    throughput: 23
  },
  {
    id: "node_packager",
    name: "PACKAGER",
    icon: "FileText",
    tech: "Evidence artifact",
    description: "Signed PDF + compliance map",
    detail: "Signs cryptographically verified proof package (sha256).",
    badge: "ED25519 SIGNED",
    throughput: 8
  },
  {
    id: "node_alert",
    name: "ALERT",
    icon: "Bell",
    tech: "Slack · Email · Webhook",
    description: "< 2hr signal to alert",
    detail: "Dispatches warnings to administrative portals and secure systems.",
    badge: "LIVE DELIVERY",
    throughput: 8
  }
];

export const COMPLIANCE_ITEMS = [
  { framework: "DORA", control: "Article 28", status: "FULL", description: "ICT third-party risk monitoring and comprehensive vendor tracking." },
  { framework: "DORA", control: "Article 30", status: "FULL", description: "Contractual arrangements and verification with ICT providers." },
  { framework: "SOC 2 Type II", control: "CC9.2", status: "FULL", description: "Vendor risk management controls, continuous assessments." },
  { framework: "ISO 27001", control: "Annex A.15", status: "FULL", description: "Information security in supplier relationships and monitoring." },
  { framework: "SEC Cyber Rule", control: "Item 1.05", status: "PARTIAL", description: "Material cybersecurity incident disclosure timelines mapped." },
  { framework: "NIS2 Directive", control: "Article 21", status: "PARTIAL", description: "Supply chain security measures for essential and important entities." },
  { framework: "NIST CSF", control: "ID.SC-2", status: "FULL", description: "Supplier risk identification, assessment, and threat detection." },
  { framework: "OWASP", control: "Third-party risks", status: "FULL", description: "Software dependency and vendor API risk scanning." },
  { framework: "EU AI Act", control: "Article 28", status: "PHASE 2", description: "Third-party high-risk AI system oversight and integrity." },
  { framework: "CCPA / CPRA", control: "Section 1798.150", status: "PHASE 2", description: "Vendor data breach notification, consumer data protection." }
];
