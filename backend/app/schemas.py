from pydantic import BaseModel, Field
from typing import List, Optional

# Request schemas
class AnalyzeRequest(BaseModel):
    vendor: str = Field(..., min_length=2, max_length=100, description="Target vendor name")

# Response signal detail schemas
class SignalItem(BaseModel):
    id: str = Field(..., description="Unique signal hash ID")
    type: str = Field(..., description="Signal classification type")
    severity: str = Field(..., description="Severity level: critical, high, medium, low")
    title: str = Field(..., description="Title of the signal")
    source: str = Field(..., description="Data source description")
    source_url: Optional[str] = Field(None, description="Optional original URL")
    detail: str = Field(..., description="Detailed explanation of findings")
    detected_at: str = Field(..., description="ISO 8601 timestamp")
    detected_relative: str = Field(..., description="Friendly relative time")
    confidence: int = Field(..., ge=0, le=100, description="Confidence rating percentage")
    raw_signal: Optional[str] = Field(None, description="Raw source content context")

# Pipeline operational stats schemas
class PipelineStats(BaseModel):
    raw_signals_processed: int = Field(..., ge=0)
    survived_filter: int = Field(..., ge=0)
    filter_rate_pct: float = Field(..., ge=0.0, le=100.0)
    processing_time_ms: int = Field(..., ge=0)

# Full analyze response schema
class AnalysisResult(BaseModel):
    vendor: str = Field(..., min_length=2, max_length=100)
    risk_score: float = Field(..., ge=0.0, le=10.0)
    risk_tier: str
    timestamp: str
    summary: str
    signal_count: int = Field(..., ge=0)
    signals: List[SignalItem]
    recommended_action: str
    compliance_refs: List[str]
    pipeline_stats: PipelineStats
    report_hash: str

# Live threat feed row schemas
class LiveSignalItem(BaseModel):
    id: str
    vendor: str
    type: str
    severity: str
    source: str
    detected_relative: str
    action: str

# Stats nested in live signals
class LiveFeedStats(BaseModel):
    raw_last_hour: int
    survived_filter: int
    alerts_sent: int

# Live signals list envelope
class LiveSignalFeedResponse(BaseModel):
    signals: List[LiveSignalItem]
    updated_at: str
    stats: LiveFeedStats

# System status checks
class HealthResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: int
    bright_data_connected: bool
    groq_connected: bool
    sources_active: List[str]
