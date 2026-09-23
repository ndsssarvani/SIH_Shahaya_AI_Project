import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAssessment } from "../../services/api";

export default function CaseDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    // Handle both raw numeric id or NHAA-xxxx string
    const rawId = id.toString().replace("NHAA-", "");
    const assessmentId = parseInt(rawId, 10) > 1000 ? parseInt(rawId, 10) - 1000 : parseInt(rawId, 10) || 1;

    getAssessment(assessmentId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.warn("[CaseDetails] Error fetching assessment:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="officer-page">
        <p style={{ padding: "30px", color: "#6b7280" }}>Loading case details...</p>
      </div>
    );
  }

  const caseIdStr = `NHAA-${1000 + (data?.id || 1)}`;
  const riskLevelStr = (data?.risk_level || "low").toLowerCase();
  const rawIndicators = data?.indicators || {};
  const indicatorList = Object.entries(rawIndicators).map(([category, hits]) => {
    const hitsStr = Array.isArray(hits) ? hits.join(", ") : String(hits);
    return `${category.replace(/_/g, " ").toUpperCase()}: ${hitsStr}`;
  });

  const supportList = data?.recommendations && data.recommendations.length > 0
    ? data.recommendations
    : ["Standard psychosocial support", "Legal counselling referral"];

  return (
    <div className="officer-page">
      <Link to="/officer/cases" className="back" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>
        ← Back to Cases
      </Link>

      <header className="page-header" style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Case {caseIdStr}</h1>
          <p>AI-Assisted Psychological Stress & Trauma Assessment Record</p>
        </div>

        <span className={`risk ${riskLevelStr}`} style={{ fontSize: "14px", padding: "8px 16px" }}>
          {data?.risk_level?.toUpperCase() || "LOW"}
        </span>
      </header>

      <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginTop: "20px" }}>
        <div className="card">
          <h2>Intake & Statement Information</h2>
          <p><b>Intake Channel:</b> <span style={{ textTransform: "capitalize" }}>{data?.channel?.replace(/_/g, " ") || "Chatbot"}</span></p>
          <p><b>Detected Language:</b> {data?.detected_language?.toUpperCase() || "EN"}</p>
          <p><b>Informed Consent Recorded:</b> {data?.consent_given ? "✅ Yes (Verified)" : "⚠️ Not recorded"}</p>
          <p><b>Intake Timestamp:</b> {data?.created_at ? new Date(data.created_at).toLocaleString() : "Recent"}</p>

          <hr style={{ margin: "16px 0", borderColor: "#e5e7eb" }} />

          <h3>Victim Narrative / Incident Statement</h3>
          <div className="complaint" style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px", marginTop: "8px", lineHeight: "1.6" }}>
            {data?.raw_text || "Audio / verbal statement recorded via NHAA Helpline."}
          </div>

          {data?.audio_url && (
            <div style={{ marginTop: "16px", padding: "12px 16px", background: "#f3f4f6", borderRadius: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>
                🎙️ Audio Recording Playback:
              </div>
              <audio controls style={{ width: "100%" }} src={`http://localhost:8000${data.audio_url}`} />
            </div>
          )}
        </div>

        <div className="card svi-card" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <h2>Stress Vulnerability Index</h2>
          <div className="svi-number" style={{ fontSize: "48px", fontWeight: "bold", margin: "14px 0", color: riskLevelStr === "critical" ? "#dc2626" : riskLevelStr === "high" ? "#ea580c" : "#2563eb" }}>
            {Math.round(data?.svi_score || 0)}
            <small style={{ fontSize: "16px", color: "#6b7280" }}>/100</small>
          </div>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>
            Multimodal Fusion: Voice Pitch/Prosody + Emotion AI + Atrocity Indicators
          </p>

          {data?.speech_features && (
            <div style={{ marginTop: "14px", width: "100%", textAlign: "left", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#475569", textTransform: "uppercase" }}>Acoustic Distress Markers</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}><b>Vocal Distress Score:</b> {data.speech_features.vocal_distress_score}/100</div>
              <div style={{ fontSize: "13px" }}><b>Pause / Silence Ratio:</b> {Math.round(data.speech_features.pause_ratio * 100)}%</div>
              <div style={{ fontSize: "13px" }}><b>Pitch Variation:</b> {data.speech_features.pitch_variation} Hz</div>
            </div>
          )}
        </div>
      </div>

      <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        <div className="card">
          <h2>Detected Trauma & Risk Indicators</h2>
          {indicatorList.length === 0 ? (
            <p style={{ color: "#6b7280", marginTop: "10px" }}>No acute trauma keywords detected in this statement.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {indicatorList.map((item, index) => (
                <li key={index} style={{ padding: "8px 12px", background: "#fef2f2", borderLeft: "3px solid #ef4444", borderRadius: "4px", fontSize: "13.5px" }}>
                  🚨 <b>{item}</b>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Statutory Recommendations & Support</h2>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {supportList.map((item, index) => (
              <li key={index} style={{ padding: "8px 12px", background: "#f0fdf4", borderLeft: "3px solid #16a34a", borderRadius: "4px", fontSize: "13.5px" }}>
                ✓ {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="human-review" style={{ marginTop: "25px", padding: "20px", background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "10px" }}>
        <b>⚖️ Human-in-the-Loop Oversight:</b>
        <p style={{ margin: "6px 0 14px", color: "#4b5563" }}>
          AI assessment serves as an evidentiary decision-support tool under SC/ST PoA Act protocols. All escalations to District Administration, Special Public Prosecutors, or Police must be verified by the duty officer.
        </p>

        {reviewed ? (
          <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: "14px" }}>
            ✓ Case Verified & Marked as Reviewed by Officer
          </span>
        ) : (
          <button
            className="primary-button"
            onClick={() => setReviewed(true)}
            style={{ padding: "10px 20px", borderRadius: "6px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            Mark as Reviewed & Escalate
          </button>
        )}
      </div>
    </div>
  );
}
