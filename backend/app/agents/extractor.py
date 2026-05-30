import asyncio
import logging
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.utils.scraper import scrape_deep_content_via_unlocker

logger = logging.getLogger("vendorsentinel")

class ExtractorAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Extractor Agent", agent_id="extractor")

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        urls = context.get("urls", [])
        vendor = context.get("vendor", "")
        if not urls:
            await self.report_status("complete", "No static URLs to extract content from")
            return {"deep_results": []}

        await self.report_status("running", f"Deploying Web Unlocker deep extraction for {len(urls)} static URLs")
        
        tasks = [self._scrape_url(url, vendor) for url in urls]
        results = await asyncio.gather(*tasks)
        
        successful_scrapes = [r for r in results if r["success"]]
        
        await self.report_status(
            "complete",
            f"Extraction complete. Successfully deep scraped {len(successful_scrapes)}/{len(urls)} URLs."
        )
        
        return {"deep_results": results}

    async def _scrape_url(self, url: str, vendor: str) -> Dict[str, Any]:
        await self.report_status("running", f"Deep scraping static URL via Web Unlocker: {url[:60]}...")
        res = await scrape_deep_content_via_unlocker(url, vendor)
        
        if res.get("success"):
            await self.report_status("running", f"Successfully extracted static content ({len(res.get('text', ''))} chars) from {url[:50]}")
        else:
            await self.report_status("running", f"Unlocker failed for {url[:50]}, using fallback mock content")
            
        return res
