import logging
from typing import Dict, Any
from app.sse import event_bus

logger = logging.getLogger("vendorsentinel")

class BaseAgent:
    def __init__(self, name: str, agent_id: str):
        self.name = name
        self.agent_id = agent_id
        self.status = "idle"

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Override this method to implement the agent's specific logic."""
        raise NotImplementedError("Subclasses must implement execute()")

    async def report_status(self, status: str, message: str):
        """Publish status change and descriptive message to SSE stream."""
        self.status = status
        logger.info(f"🤖 [{self.name}] {status.upper()}: {message}")
        await event_bus.publish(
            event_type="agent_status",
            agent=self.agent_id,
            data={
                "name": self.name,
                "status": status,
                "message": message
            }
        )

    async def report_finding(self, signal: Dict[str, Any]):
        """Publish a discovered or analyzed signal to the live SSE stream."""
        logger.info(f"🎯 [{self.name}] Finding Detected: {signal.get('title', 'Unknown threat')}")
        await event_bus.publish(
            event_type="signal_detected",
            agent=self.agent_id,
            data=signal
        )
