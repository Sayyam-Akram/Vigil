import asyncio
import logging
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.pipeline.analyzer import run_layer3_llm_analyzer
import time

logger = logging.getLogger("vendorsentinel")

class AnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Analyst Agent", agent_id="analyst")

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        vendor = context.get("vendor", "")
        # Combined content inputs: direct_api_results, deep_results (Web Unlocker), browser_results (Scraping Browser)
        direct_api_results = context.get("direct_api_results", [])
        deep_results = context.get("deep_results", [])
        browser_results = context.get("browser_results", [])
        
        all_raw_inputs = []
        
        # 1. Format direct API results
        for item in direct_api_results:
            all_raw_inputs.append({
                "source": item["source"],
                "url": item["url"],
                "text": item["content"]
            })
            
        # 2. Format Extractor results (Web Unlocker)
        for item in deep_results:
            all_raw_inputs.append({
                "source": f"Web Unlocker - {item['url']}",
                "url": item["url"],
                "text": item["text"]
            })
            
        # 3. Format Browser results (Scraping Browser)
        for item in browser_results:
            all_raw_inputs.append({
                "source": f"Scraping Browser - {item['title'] or item['url']}",
                "url": item["url"],
                "text": item["text"]
            })
            
        if not all_raw_inputs:
            await self.report_status("complete", "No raw intelligence content found to analyze")
            return {"signals": []}

        await self.report_status("running", f"Deploying Threat Analyst Agent to analyze {len(all_raw_inputs)} raw text inputs")
        
        analyzed_signals = []
        
        # Run classification on each raw input
        # Note: We run these in parallel using gather, which is much faster than synchronous linear loop!
        tasks = []
        for i, item in enumerate(all_raw_inputs):
            tasks.append(self._analyze_item(vendor, item, i))
            
        results = await asyncio.gather(*tasks)
        
        # Filter out low-severity / non-threat signals to avoid noise
        for sig in results:
            if sig and sig.get("severity") in ["medium", "high", "critical"]:
                analyzed_signals.append(sig)
                # Report finding in real-time to SSE!
                await self.report_finding(sig)
                
        await self.report_status(
            "complete",
            f"Analysis complete. Identified {len(analyzed_signals)} relevant threat signals out of {len(all_raw_inputs)} sources scanned."
        )
        
        return {"signals": analyzed_signals}

    async def _analyze_item(self, vendor: str, item: Dict[str, Any], index: int) -> Dict[str, Any]:
        source_short = item["source"][:50]
        await self.report_status("running", f"Analyzing source [{index + 1}]: {source_short}...")
        
        # Call the existing core LLM/Mock analyzer
        # We wrap this in an executor or run it directly since it might do blocking network calls
        loop = asyncio.get_event_loop()
        try:
            analysis = await loop.run_in_executor(
                None, 
                run_layer3_llm_analyzer, 
                vendor, 
                item["text"], 
                item["source"]
            )
            
            # Format as a formal database/frontend signal
            signal_id = f"sig_{int(time.time())}_{index}"
            
            # Map LLM output to DB schema schema
            signal = {
                "id": signal_id,
                "vendor": vendor,
                "type": analysis.get("signal_type", "news"),
                "severity": analysis.get("severity", "low"),
                "title": f"{analysis.get('signal_type', 'threat').upper().replace('_', ' ')}: {analysis.get('summary', 'Threat signal detected')[:80]}",
                "source": item["source"],
                "source_url": item["url"],
                "detail": analysis.get("summary", "No details provided"),
                "detected_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "detected_relative": "Just now",
                "confidence": analysis.get("confidence", 50),
                "raw_signal": item["text"][:300],
                "action": "PENDING_TRIAGE" if analysis.get("severity") in ["high", "critical"] else "LOGGED"
            }
            
            return signal
        except Exception as e:
            logger.error(f"Error analyzing source {item['source']}: {e}")
            return None
