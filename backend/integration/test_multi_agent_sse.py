import asyncio
import sys
import os
import json
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.sse import event_bus
from app.agents.base import BaseAgent
from app.agents.scout import ScoutAgent
from app.agents.extractor import ExtractorAgent
from app.agents.browser import BrowserAgent
from app.agents.analyst import AnalystAgent
from app.agents.compliance import ComplianceAgent
from app.agents.sentinel import SentinelAgent
from app.database import init_db, fetch_signals_by_vendor

# ── Test 1: EventBus pub/sub SSE ──
async def test_event_bus():
    queue = await event_bus.subscribe()
    
    # Publish dummy status
    await event_bus.publish(
        event_type="agent_status",
        agent="test_agent",
        data={"name": "Test Agent", "status": "running", "message": "Fired test status"}
    )
    
    event = await queue.get()
    assert event["type"] == "agent_status"
    assert event["agent"] == "test_agent"
    assert event["data"]["status"] == "running"
    assert "timestamp" in event
    
    await event_bus.unsubscribe(queue)
    print("[PASS] test_event_bus PASSED")

# ── Test 2: Scout Agent ──
async def test_scout_agent():
    scout = ScoutAgent()
    context = {"vendor": "Okta"}
    res = await scout.execute(context)
    
    assert "candidate_urls" in res
    assert "static_urls" in res
    assert "js_urls" in res
    assert "direct_api_results" in res
    assert len(res["candidate_urls"]) > 0
    
    # Check that status updates were published
    print("[PASS] test_scout_agent PASSED")

# ── Test 3: Extractor Agent ──
async def test_extractor_agent():
    extractor = ExtractorAgent()
    context = {"urls": ["https://pastebin.com/raw/abc"]}
    res = await extractor.execute(context)
    
    assert "deep_results" in res
    assert len(res["deep_results"]) == 1
    assert "success" in res["deep_results"][0]
    assert "credential" in res["deep_results"][0]["text"].lower()
    
    print("[PASS] test_extractor_agent PASSED")

# ── Test 4: Browser Agent ──
async def test_browser_agent():
    browser = BrowserAgent()
    context = {"urls": ["https://nvd.nist.gov/vuln/detail/CVE-2024-3094"]}
    res = await browser.execute(context)
    
    assert "browser_results" in res
    assert len(res["browser_results"]) == 1
    assert res["browser_results"][0]["success"] == True
    assert "CVE-2024-3094" in res["browser_results"][0]["text"]
    
    print("[PASS] test_browser_agent PASSED")

# ── Test 5: Analyst Agent ──
async def test_analyst_agent():
    analyst = AnalystAgent()
    context = {
        "vendor": "Snowflake",
        "direct_api_results": [{
            "source": "GitHub",
            "url": "https://github.com",
            "content": "export AWS_ACCESS_KEY_ID='AKIAIOSFODNN7EXAMPLE'"
        }],
        "deep_results": [],
        "browser_results": []
    }
    
    res = await analyst.execute(context)
    assert "signals" in res
    assert len(res["signals"]) == 1
    assert res["signals"][0]["severity"] in ["high", "critical"]
    
    print("[PASS] test_analyst_agent PASSED")

# ── Test 6: Compliance Agent & Monotonic Score ──
async def test_compliance_monotonic_score():
    compliance = ComplianceAgent()
    
    # Scenario A: 1 high severity signal
    res1 = await compliance.execute({
        "vendor": "Okta",
        "signals": [{"severity": "high", "type": "credential_leak"}]
    })
    
    # Scenario B: 2 high severity signals (must increase monotonically)
    res2 = await compliance.execute({
        "vendor": "Okta",
        "signals": [
            {"severity": "high", "type": "credential_leak"},
            {"severity": "high", "type": "github"}
        ]
    })
    
    assert res2["risk_score"] > res1["risk_score"], \
        f"Score must be monotonic: res2 ({res2['risk_score']}) should be greater than res1 ({res1['risk_score']})"
    assert res2["risk_tier"] in ["HIGH", "CRITICAL"]
    assert "DORA" in res2["compliance_mappings"]
    
    print("[PASS] test_compliance_monotonic_score PASSED")

# ── Test 7: Sentinel Master Orchestrator ──
async def test_sentinel_orchestrator():
    init_db()
    sentinel = SentinelAgent()
    
    # Active parallel scan on a vendor
    res = await sentinel.execute({"vendor": "Snowflake"})
    
    assert "vendor" in res
    assert res["vendor"] == "Snowflake"
    assert "risk_score" in res
    assert "recommended_action" in res or "ciso_directive" in res
    assert len(res["signals"]) > 0
    assert "stats" in res
    assert res["stats"]["total_discovered"] > 0
    
    # Verify that database persistence worked
    db_signals = fetch_signals_by_vendor("Snowflake")
    assert len(db_signals) > 0
    
    print("[PASS] test_sentinel_orchestrator PASSED")

async def run_all_async_tests():
    print("\n" + "=" * 60)
    print("  Integration Tests: 6-Agent Parallel Architecture & SSE Stream")
    print("=" * 60 + "\n")
    
    tests = [
        test_event_bus,
        test_scout_agent,
        test_extractor_agent,
        test_browser_agent,
        test_analyst_agent,
        test_compliance_monotonic_score,
        test_sentinel_orchestrator
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            await test()
            passed += 1
        except Exception as e:
            import traceback
            print(f"[FAIL] {test.__name__} FAILED: {e}")
            traceback.print_exc()
            failed += 1
            
    print(f"\n{'=' * 60}")
    print(f"  Results: {passed} passed, {failed} failed, {len(tests)} total")
    print(f"{'=' * 60}\n")
    
    sys.exit(1 if failed > 0 else 0)

if __name__ == "__main__":
    asyncio.run(run_all_async_tests())
