import logging
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.utils.scraper import get_demo_context

logger = logging.getLogger("vendorsentinel")

class ComplianceAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Compliance Agent", agent_id="compliance")

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        vendor = context.get("vendor", "")
        signals = context.get("signals", [])

        await self.report_status("running", f"Deploying Compliance Agent to assess regulatory impact and risk score")

        # 1. Monotonic Cumulative Scoring Strategy
        # We start with a base score. If it's a known breach vendor, we bootstrap it, otherwise base is 0.0.
        demo_ctx = get_demo_context(vendor)
        if demo_ctx:
            # Okta or Snowflake get a higher bootstrap base representing established breach posture
            min_score, max_score = demo_ctx["force_score_range"]
            base_score = min_score
        else:
            base_score = 1.0  # clean/default baseline risk
            
        risk_contribution = 0.0
        
        # Accumulate risk monotonically based on detected signals
        for sig in signals:
            severity = sig.get("severity", "low").lower()
            sig_type = sig.get("type", "").lower()
            
            if severity == "critical":
                risk_contribution += 1.8
            elif severity == "high":
                risk_contribution += 1.2
            elif severity == "medium":
                risk_contribution += 0.6
            else:
                risk_contribution += 0.15
                
        # Total risk score is base + contribution, capped at 9.8 (nearly absolute risk)
        final_score = base_score + risk_contribution
        
        # If it is a demo vendor, ensure it stays strictly within the validated realistic range
        if demo_ctx:
            min_score, max_score = demo_ctx["force_score_range"]
            final_score = max(min_score, min(max_score, final_score))
            
        final_score = round(min(9.8, final_score), 2)
        
        # Determine risk tier
        if final_score >= 7.5:
            risk_tier = "CRITICAL"
        elif final_score >= 5.0:
            risk_tier = "HIGH"
        elif final_score >= 3.0:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "LOW"

        # 2. Regulatory Compliance Mapping
        # Map signal counts and details to regulatory frameworks
        compliance_mappings = {
            "DORA": {
                "framework": "DORA (Digital Operational Resilience Act)",
                "article": "Article 28 - Third-Party Risk Management",
                "status": "NON-COMPLIANT" if final_score >= 5.0 else "COMPLIANT WITH DRIFT",
                "details": f"Vendor exposes systemic vulnerabilities. Enforces DORA requirement to continuously monitor, assess, and audit third-party ICT concentrations."
            },
            "SOC2": {
                "framework": "SOC 2 Trust Services Criteria",
                "article": "CC9.2 - Risk Assessment & Third-Party Management",
                "status": "EXCEPTIONS DETECTED" if final_score >= 3.0 else "SECURE",
                "details": "Requires continuous evaluation of third-party vendors' operating effectiveness. Incident indicators bypass standard annual SOC 2 review cycles."
            },
            "ISO27001": {
                "framework": "ISO/IEC 27001:2022",
                "article": "Control A.15 - Supplier Relationships",
                "status": "AUDIT REQUIRED" if final_score >= 3.0 else "PASSED",
                "details": "Fails standard vendor trust thresholds. Organizations must supervise and monitor supplier service delivery in compliance with security agreements."
            },
            "NIS2": {
                "framework": "NIS 2 Directive",
                "article": "Article 21 - Supply Chain Security",
                "status": "HIGH EXPOSURE" if final_score >= 5.0 else "SECURE",
                "details": "Requires proactive screening of supply chain actors and direct infrastructure integrations to secure critical national systems."
            }
        }

        # 3. CISO Actionable Directive Generation
        ciso_directive = self._generate_ciso_directive(vendor, final_score, risk_tier, signals)

        await self.report_status(
            "complete",
            f"Compliance review finalized. Calculated Risk Score: {final_score} ({risk_tier} Tier). Map generated for DORA, SOC2, NIS2, ISO27001."
        )

        return {
            "risk_score": final_score,
            "risk_tier": risk_tier,
            "compliance_mappings": compliance_mappings,
            "ciso_directive": ciso_directive
        }

    def _generate_ciso_directive(self, vendor: str, score: float, tier: str, signals: List[Dict[str, Any]]) -> str:
        """Generates a highly contextual and formal CISO security directive."""
        if tier == "CRITICAL" or tier == "HIGH":
            return (
                f"IMMEDIATE SECURITY EXCLUSION DIRECTIVE FOR VENDOR '{vendor.upper()}'.\n"
                f"Risk assessment has returned a {tier} rating of {score}/10 based on "
                f"{len(signals)} actively verified security incidents. Recommended actions:\n"
                f"1. Freeze all active staging/production API secrets mapped to {vendor} services.\n"
                f"2. Initiate mandatory credential and MFA token rotation for downstream corporate SSO integrations.\n"
                f"3. Deploy temporary zero-trust network ingress policies to block active endpoints from {vendor} networks.\n"
                f"4. Engage legal and compliance teams to invoke DORA Article 28 breach notice templates."
            )
        elif tier == "MEDIUM":
            return (
                f"CONDITIONAL ACCESS DIRECTIVE FOR VENDOR '{vendor.upper()}'.\n"
                f"Risk assessment has returned a {tier} rating of {score}/10. Recommended actions:\n"
                f"1. Add vendor to the active surveillance watchlist (10-minute sweep interval).\n"
                f"2. Audit data ingestion pipelines connected to vendor endpoints for anomalies.\n"
                f"3. Request latest SOC 2 Type II audit report highlighting CC9.2 compliance remediation plans."
            )
        else:
            return (
                f"STANDARD SURVEILLANCE DIRECTIVE FOR VENDOR '{vendor.upper()}'.\n"
                f"Risk assessment has returned a {tier} rating of {score}/10. No immediate remediation actions "
                f"required. Standard security monitoring and annual audit review schedules are sufficient."
            )
