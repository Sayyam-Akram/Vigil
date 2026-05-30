"""
Integration test for the 2-Step Bright Data Pipeline upgrades.
Tests SERP Discovery → Web Unlocker Deep Extraction → LLM Analysis flow.

Run: python -m pytest backend/integration/test_pipeline_upgrades.py -v
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.utils.scraper import (
    generate_scrape_targets,
    extract_candidate_urls_from_serp,
    _is_deep_scrape_worthy,
    get_demo_context,
    get_mock_scrape_payload,
    _get_deep_scrape_mock,
)
from app.pipeline.analyzer import (
    run_local_programmatic_mock,
    _extract_raw_artifacts,
    build_analyst_prompt,
)
from app.pipeline.filter import evaluate_layer2_rule_scorer


# ── Test 1: Scrape targets generate correctly ──
def test_scrape_targets_snowflake():
    """SERP targets for known breach vendor use time-targeted queries."""
    targets = generate_scrape_targets("Snowflake")
    assert len(targets) == 6, f"Expected 6 targets, got {len(targets)}"
    
    # First 4 should be SERP zone targets
    serp_targets = [t for t in targets if t["zone"] != "__direct_api__"]
    direct_targets = [t for t in targets if t["zone"] == "__direct_api__"]
    
    assert len(serp_targets) == 4, f"Expected 4 SERP targets, got {len(serp_targets)}"
    assert len(direct_targets) == 2, f"Expected 2 direct API targets, got {len(direct_targets)}"
    
    # First 2 SERP targets should reference 2024 (Target 3 intentionally omits year for broader search)
    for t in serp_targets[:2]:
        assert "2024" in t["url"], f"Snowflake SERP query should reference 2024: {t['url']}"
    
    print("[PASS] test_scrape_targets_snowflake PASSED")


def test_scrape_targets_unknown_vendor():
    """Unknown vendors use current year for time-targeting."""
    from datetime import datetime
    current_year = str(datetime.now().year)
    
    targets = generate_scrape_targets("CustomVendor")
    serp_targets = [t for t in targets if t["zone"] != "__direct_api__"]
    
    # First 2 SERP targets should include current year
    for t in serp_targets[:2]:
        assert current_year in t["url"], f"Unknown vendor should use current year: {t['url']}"
    
    print("[PASS] test_scrape_targets_unknown_vendor PASSED")


# ── Test 2: SERP URL extraction ──
def test_extract_urls_from_serp_json():
    """Extract candidate URLs from structured SERP JSON response."""
    serp_json = '''{
        "organic": [
            {"link": "https://www.bleepingcomputer.com/news/security/snowflake-breach/", "title": "test"},
            {"link": "https://www.google.com/some-page", "title": "not interesting"},
            {"link": "https://pastebin.com/raw/ABC123", "title": "paste dump"}
        ]
    }'''
    
    urls = extract_candidate_urls_from_serp(serp_json)
    assert len(urls) >= 2, f"Expected at least 2 candidate URLs, got {len(urls)}"
    assert any("bleepingcomputer" in u for u in urls), "Should find bleepingcomputer URL"
    assert any("pastebin" in u for u in urls), "Should find pastebin URL"
    
    print("[PASS] test_extract_urls_from_serp_json PASSED")


def test_extract_urls_from_serp_html():
    """Extract candidate URLs from raw HTML SERP text."""
    serp_html = '''
    <div class="result">
        <a href="https://www.krebsonsecurity.com/2024/06/snowflake-breach-analysis/">Article</a>
        <a href="https://pastebin.com/raw/xyz789">Paste</a>
        <a href="https://example.com/unrelated">Not interesting</a>
    </div>
    '''
    
    urls = extract_candidate_urls_from_serp(serp_html)
    assert any("krebsonsecurity" in u for u in urls), "Should find krebsonsecurity URL"
    assert any("pastebin" in u for u in urls), "Should find pastebin URL"
    assert not any("example.com" in u for u in urls), "Should NOT include unrelated domains"
    
    print("[PASS] test_extract_urls_from_serp_html PASSED")


def test_deep_scrape_worthy():
    """Domain filter correctly identifies scrape-worthy URLs."""
    assert _is_deep_scrape_worthy("https://pastebin.com/raw/abc") == True
    assert _is_deep_scrape_worthy("https://www.bleepingcomputer.com/news/") == True
    assert _is_deep_scrape_worthy("https://raw.githubusercontent.com/user/repo/main/file.txt") == True
    assert _is_deep_scrape_worthy("https://www.google.com/search?q=test") == False
    assert _is_deep_scrape_worthy("https://example.com/page") == False
    assert _is_deep_scrape_worthy("https://cisa.gov/kev") == True
    
    print("[PASS] test_deep_scrape_worthy PASSED")


# ── Test 3: Demo context ──
def test_demo_context():
    """Known breach vendors return correct retrospective context."""
    sf = get_demo_context("Snowflake")
    assert sf is not None
    assert sf["breach_year"] == 2024
    assert sf["force_score_range"] == (7.5, 8.5)
    
    okta = get_demo_context("Okta")
    assert okta is not None
    assert okta["breach_year"] == 2023
    
    unknown = get_demo_context("RandomVendor123")
    assert unknown is None
    
    print("[PASS] test_demo_context PASSED")


# ── Test 4: Raw artifact extraction ──
def test_extract_raw_artifacts_aws_key():
    """Pre-LLM extraction detects AWS access keys."""
    text = "export AWS_ACCESS_KEY_ID='AKIAIOSFODNN7EXAMPLE'"
    artifacts = _extract_raw_artifacts(text)
    assert "AWS_ACCESS_KEY_ID" in artifacts, f"Should detect AWS key, got: {artifacts}"
    
    print("[PASS] test_extract_raw_artifacts_aws_key PASSED")


def test_extract_raw_artifacts_bcrypt():
    """Pre-LLM extraction detects bcrypt hashes."""
    text = "password: $2b$12$LJ3m4x9kP7eR2wN1qY5Zu.hJkLmN0pQ3rS4tU5vW6xY7zA8bC9dE0"
    artifacts = _extract_raw_artifacts(text)
    assert "BCRYPT_PASSWORD_HASH" in artifacts, f"Should detect bcrypt hash, got: {artifacts}"
    
    print("[PASS] test_extract_raw_artifacts_bcrypt PASSED")


def test_extract_raw_artifacts_email_password():
    """Pre-LLM extraction detects email:password patterns."""
    text = "admin@company.com:password123\nuser@test.com:secret456"
    artifacts = _extract_raw_artifacts(text)
    assert "EMAIL_PASSWORD_PAIR" in artifacts, f"Should detect email:pass pair, got: {artifacts}"
    
    print("[PASS] test_extract_raw_artifacts_email_password PASSED")


# ── Test 5: Mock payloads ──
def test_mock_payloads_not_empty():
    """Mock payloads should return non-empty text for all target types."""
    targets = generate_scrape_targets("Snowflake")
    for target in targets:
        mock = get_mock_scrape_payload(target.get("zone", "serp"), target["url"])
        assert len(mock) > 50, f"Mock payload too short for {target['source']}: {len(mock)} chars"
    
    print("[PASS] test_mock_payloads_not_empty PASSED")


def test_deep_scrape_mock_payloads():
    """Deep scrape mock payloads return realistic content for different URL types."""
    paste_mock = _get_deep_scrape_mock("https://pastebin.com/raw/abc123")
    assert "credential" in paste_mock.lower() or "dump" in paste_mock.lower()
    
    news_mock = _get_deep_scrape_mock("https://www.bleepingcomputer.com/article")
    assert "breach" in news_mock.lower() or "unauthorized" in news_mock.lower()
    
    github_mock = _get_deep_scrape_mock("https://raw.githubusercontent.com/user/repo/file.sh")
    assert "aws" in github_mock.lower() or "key" in github_mock.lower()
    
    cisa_mock = _get_deep_scrape_mock("https://cisa.gov/kev")
    assert "cve" in cisa_mock.lower() or "vulnerability" in cisa_mock.lower()
    
    print("[PASS] test_deep_scrape_mock_payloads PASSED")


# ── Test 6: Programmatic mock analyzer ──
def test_mock_analyzer_credential_leak():
    """Mock LLM analyzer correctly classifies credential dumps."""
    text = "DUMP: admin@snowflake.com bcrypt $2b$12$ password hash active staging"
    heuristics = evaluate_layer2_rule_scorer(text, "Paste site monitoring")
    result = run_local_programmatic_mock("Snowflake", text, heuristics)
    
    assert result["severity"] == "critical", f"Expected critical, got {result['severity']}"
    assert result["confidence"] > 80, f"Expected high confidence, got {result['confidence']}"
    assert result["signal_type"] == "credential_leak"
    
    print("[PASS] test_mock_analyzer_credential_leak PASSED")


def test_mock_analyzer_deep_extraction_boost():
    """Web Unlocker deep extraction boosts confidence score."""
    text = "Article about security breach and unauthorized access"
    heuristics = evaluate_layer2_rule_scorer(text, "BleepingComputer")
    
    result_serp = run_local_programmatic_mock("TestVendor", text, heuristics, "SERP API")
    result_deep = run_local_programmatic_mock("TestVendor", text, heuristics, "Web Unlocker Deep Extraction")
    
    assert result_deep["confidence"] > result_serp["confidence"], \
        f"Deep extraction confidence ({result_deep['confidence']}) should be higher than SERP ({result_serp['confidence']})"
    
    print("[PASS] test_mock_analyzer_deep_extraction_boost PASSED")


# ── Test 7: Analyst prompt construction ──
def test_analyst_prompt_includes_breach_context():
    """Analyst prompt includes breach context for known vendors."""
    prompt = build_analyst_prompt("Snowflake", "news", "test content", "SERP API")
    assert "credential-stuffing" in prompt, "Snowflake prompt should include breach context"
    assert "165+" in prompt, "Should mention 165+ affected companies"
    
    prompt_unknown = build_analyst_prompt("RandomVendor", "news", "test content", "SERP API")
    assert "credential-stuffing" not in prompt_unknown, "Unknown vendor should NOT have breach context"
    
    print("[PASS] test_analyst_prompt_includes_breach_context PASSED")


def test_analyst_prompt_includes_extraction_method():
    """Analyst prompt includes the data extraction method."""
    prompt = build_analyst_prompt("Snowflake", "deep_extraction", "test content", "Web Unlocker Deep Extraction")
    assert "Web Unlocker Deep Extraction" in prompt
    
    print("[PASS] test_analyst_prompt_includes_extraction_method PASSED")


# ── Run all tests ──
if __name__ == "__main__":
    tests = [
        test_scrape_targets_snowflake,
        test_scrape_targets_unknown_vendor,
        test_extract_urls_from_serp_json,
        test_extract_urls_from_serp_html,
        test_deep_scrape_worthy,
        test_demo_context,
        test_extract_raw_artifacts_aws_key,
        test_extract_raw_artifacts_bcrypt,
        test_extract_raw_artifacts_email_password,
        test_mock_payloads_not_empty,
        test_deep_scrape_mock_payloads,
        test_mock_analyzer_credential_leak,
        test_mock_analyzer_deep_extraction_boost,
        test_analyst_prompt_includes_breach_context,
        test_analyst_prompt_includes_extraction_method,
    ]
    
    passed = 0
    failed = 0
    
    print("\n" + "=" * 60)
    print("  Integration Tests: 2-Step Pipeline Upgrades")
    print("=" * 60 + "\n")
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"[FAIL] {test.__name__} FAILED: {e}")
            failed += 1
    
    print(f"\n{'=' * 60}")
    print(f"  Results: {passed} passed, {failed} failed, {len(tests)} total")
    print(f"{'=' * 60}\n")
    
    sys.exit(1 if failed > 0 else 0)
