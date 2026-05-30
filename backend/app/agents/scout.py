import asyncio
import logging
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.utils.scraper import (
    generate_scrape_targets,
    query_bright_data_serp,
    query_direct_api,
    extract_candidate_urls_from_serp,
    _is_deep_scrape_worthy
)
from urllib.parse import urlparse

logger = logging.getLogger("vendorsentinel")

JS_DOMAINS = [
    "nvd.nist.gov",
    "sec.gov",
    "securityscorecard.com",
    "bitsighttech.com",
    "status."
]

class ScoutAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Scout Agent", agent_id="scout")

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        vendor = context.get("vendor", "")
        if not vendor:
            await self.report_status("error", "No vendor provided")
            return {"error": "No vendor provided"}

        await self.report_status("running", f"Starting discovery phase for vendor: '{vendor}'")
        targets = generate_scrape_targets(vendor)
        
        await self.report_status("running", f"Generated {len(targets)} search & discovery queries")
        
        tasks = []
        for target in targets:
            url = target["url"]
            source = target["source"]
            zone = target["zone"]
            
            if zone == "__direct_api__":
                tasks.append(self._run_direct_query(source, url))
            else:
                tasks.append(self._run_serp_query(source, zone, url))
                
        # Run all discovery tasks in parallel
        results = await asyncio.gather(*tasks)
        
        # Combine all raw text for candidate extraction
        all_serp_texts = []
        direct_api_results = []
        
        for res in results:
            if res["success"]:
                if res["source_type"] == "direct":
                    direct_api_results.append({
                        "source": res["source"],
                        "url": res["url"],
                        "content": res["text"]
                    })
                else:
                    all_serp_texts.append(res["text"])
                    
        # Extract deep URLs to investigate further
        combined_serp = "\n".join(all_serp_texts)
        candidate_urls = extract_candidate_urls_from_serp(combined_serp)
        
        # Split into JS-heavy (Browser Agent) vs Static (Extractor Agent) URLs
        js_urls = []
        static_urls = []
        
        for url in candidate_urls:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            is_js = any(js_dom in domain for js_dom in JS_DOMAINS)
            if is_js:
                js_urls.append(url)
            else:
                static_urls.append(url)
                
        await self.report_status(
            "complete",
            f"Discovery complete. Found {len(direct_api_results)} direct API signals and {len(candidate_urls)} candidate URLs ({len(static_urls)} static, {len(js_urls)} JS-heavy)."
        )
        
        return {
            "candidate_urls": candidate_urls,
            "static_urls": static_urls,
            "js_urls": js_urls,
            "direct_api_results": direct_api_results
        }

    async def _run_direct_query(self, source: str, url: str) -> Dict[str, Any]:
        await self.report_status("running", f"Querying public API: {source}")
        res = await query_direct_api(url)
        if res.get("success"):
            await self.report_status("running", f"Successfully fetched API data from {source}")
        else:
            await self.report_status("running", f"API query failed for {source}, using mock backup")
        
        res["source"] = source
        res["source_type"] = "direct"
        res["url"] = url
        return res

    async def _run_serp_query(self, source: str, zone: str, url: str) -> Dict[str, Any]:
        await self.report_status("running", f"Running search query: '{source}'")
        res = await query_bright_data_serp(zone, url)
        if res.get("success"):
            await self.report_status("running", f"Successfully completed search for '{source}' (Live)")
        else:
            await self.report_status("running", f"Search query failed for '{source}', using mock backup")
            
        res["source"] = source
        res["source_type"] = "serp"
        res["url"] = url
        return res
