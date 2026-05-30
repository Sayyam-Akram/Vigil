import asyncio
import json
from datetime import datetime
from typing import Set, Dict, Any
import logging

logger = logging.getLogger("vendorsentinel")

class EventBus:
    def __init__(self):
        self._subscribers: Set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()

    async def subscribe(self) -> asyncio.Queue:
        async with self._lock:
            queue = asyncio.Queue()
            self._subscribers.add(queue)
            logger.debug(f"New SSE client subscribed. Total subscribers: {len(self._subscribers)}")
            return queue

    async def unsubscribe(self, queue: asyncio.Queue):
        async with self._lock:
            if queue in self._subscribers:
                self._subscribers.remove(queue)
                logger.debug(f"SSE client unsubscribed. Total subscribers: {len(self._subscribers)}")

    async def publish(self, event_type: str, agent: str, data: Dict[str, Any]):
        async with self._lock:
            if not self._subscribers:
                return

            event = {
                "type": event_type,
                "agent": agent,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Send to all subscriber queues
            for queue in self._subscribers:
                await queue.put(event)

# Global Event Bus instance
event_bus = EventBus()
