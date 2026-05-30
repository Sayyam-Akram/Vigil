import asyncio
import logging
from typing import Dict, Any
from app.agents.base import BaseAgent
from app.agents.scout import ScoutAgent
from app.agents.extractor import ExtractorAgent
from app.agents.browser import BrowserAgent
from app.agents.analyst import AnalystAgent
from app.agents.compliance import ComplianceAgent
from app.database import insert_new_signal

logger = logging.getLogger("vendorsentinel")

class SentinelAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Sentinel Orchestrator", agent_id="sentinel")
        self.scout = ScoutAgent()
        self.extractor = ExtractorAgent()
        self.browser = BrowserAgent()
        self.analyst = AnalystAgent()
        self.compliance = ComplianceAgent()

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        vendor = context.get("vendor", "")
        if not vendor:
            await self.report_status("error", "No vendor name specified")
            return {"error": "No vendor name specified"}

        await self.report_status("running", f"Initiating autonomous supply-chain threat intelligence scan for: '{vendor}'")
        await asyncio.sleep(0.5)

        # ── PHASE 1: DISCOVERY (Scout Agent) ──
        scout_context = {"vendor": vendor}
        scout_result = await self.scout.execute(scout_context)
        
        static_urls = scout_result.get("static_urls", [])
        js_urls = scout_result.get("js_urls", [])
        direct_api_results = scout_result.get("direct_api_results", [])
        
        # ── PHASE 2: PARALLEL DEEP EXTRACTION (Extractor & Browser Agents) ──
        await self.report_status(
            "running", 
            f"Deploying Extractor and Browser agents in parallel for deep crawling ({len(static_urls)} static pages, {len(js_urls)} JS-heavy pages)..."
        )
        
        extractor_task = self.extractor.execute({"urls": static_urls})
        browser_task = self.browser.execute({"urls": js_urls})
        
        extractor_result, browser_result = await asyncio.gather(extractor_task, browser_task)
        
        deep_results = extractor_result.get("deep_results", [])
        browser_results = browser_result.get("browser_results", [])

        # ── PHASE 3: THREAT CLASSIFICATION (Analyst Agent) ──
        analyst_context = {
            "vendor": vendor,
            "direct_api_results": direct_api_results,
            "deep_results": deep_results,
            "browser_results": browser_results
        }
        
        analyst_result = await self.analyst.execute(analyst_context)
        signals = analyst_result.get("signals", [])

        # ── PHASE 4: COMPLIANCE ASSESSMENT & MONOTONIC SCORING (Compliance Agent) ──
        compliance_context = {
            "vendor": vendor,
            "signals": signals
        }
        compliance_result = await self.compliance.execute(compliance_context)

        # ── PHASE 5: PERSISTENCE & CONSOLIDATION ──
        await self.report_status("running", f"Persisting {len(signals)} new threat signals to SQLite database...")
        for sig in signals:
            insert_new_signal(sig)
            
        final_result = {
            "vendor": vendor,
            "risk_score": compliance_result["risk_score"],
            "risk_tier": compliance_result["risk_tier"],
            "compliance_mappings": compliance_result["compliance_mappings"],
            "ciso_directive": compliance_result["ciso_directive"],
            "signals": signals,
            "stats": {
                "total_discovered": len(scout_result.get("candidate_urls", [])) + len(direct_api_results),
                "static_scraped": len(deep_results),
                "js_scraped": len(browser_results),
                "signals_detected": len(signals)
            }
        }
        
        await self.report_status(
            "complete", 
            f"Autonomous threat intelligence sweep complete for '{vendor}'. Final Risk Score: {compliance_result['risk_score']}/10 ({compliance_result['risk_tier']})."
        )
        
        return final_result
