from typing import Dict, Any

RISK_KEYWORDS = [
    "breach", "leak", "hack", "vulnerability", "exposed", "investigation", 
    "unauthorized", "ransomware", "incident", "resign", "layoff", "violation", 
    "penalty", "fine", "departure", "attack", "exploit", "compromise", "credentials"
]

SIGNAL_WEIGHTS = {
    "credential_leak": 9,
    "regulatory_violation": 8,
    "executive_departure": 6,
    "security_job_spike": 5,
    "news_mention": 4,
    "github_exposure": 8,
    "shadow_it": 7
}

def verify_layer1_keyword_filter(vendor: str, text: str) -> bool:
    """
    Layer 1 Keyword Filter: Checks if the vendor name exists in the text
    and contains at least one high-risk threat signature indicator.
    """
    text_lower = text.lower()
    vendor_lower = vendor.lower()
    
    # 1. Vendor name must appear
    if vendor_lower not in text_lower:
        return False
        
    # 2. Risk keyword must appear
    has_keyword = any(kw in text_lower for kw in RISK_KEYWORDS)
    return has_keyword

def evaluate_layer2_rule_scorer(text: str, source_type: str) -> Dict[str, Any]:
    """
    Layer 2 Heuristic Rule Scorer: Assesses text matches, assigns category,
    base weight, and maps appropriate severity states without contacting the LLM.
    """
    text_lower = text.lower()
    source_lower = source_type.lower()
    
    signal_type = "news_mention"
    
    # Heuristic classifications based on source type & text matches
    if "paste" in source_lower or "credential" in text_lower or "email_list" in text_lower:
        signal_type = "credential_leak"
    elif "github" in source_lower or "commit" in text_lower or "exposed api" in text_lower:
        signal_type = "github_exposure"
    elif "sec" in source_lower or "10-q" in text_lower or "10-k" in text_lower or "violation" in text_lower:
        signal_type = "regulatory_violation"
    elif "linkedin" in source_lower or "resign" in text_lower or "depart" in text_lower:
        signal_type = "executive_departure"
    elif "job" in source_lower or "hiring" in text_lower or "recruit" in text_lower:
        signal_type = "security_job_spike"
    elif "crt.sh" in source_lower or "cert" in source_lower or "shadow" in text_lower or "subdomain" in text_lower:
        signal_type = "shadow_it"
        
    weight = SIGNAL_WEIGHTS.get(signal_type, 4)
    
    # Heuristic severity calculation based on weight index
    if weight >= 9:
        severity = "critical"
    elif weight >= 7:
        severity = "high"
    elif weight >= 5:
        severity = "medium"
    else:
        severity = "low"
        
    return {
        "signal_type": signal_type,
        "base_weight": weight,
        "severity": severity,
        "confidence": int(70 + (weight * 2.5))  # Heuristic base confidence
    }
