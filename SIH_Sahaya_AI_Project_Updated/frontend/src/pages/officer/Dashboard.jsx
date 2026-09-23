import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboard, logout } from "../../services/api";
import { officerAlertsWS } from "../../services/websocket";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    total_cases: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    cases: [],
  });
  const [loading, setLoading] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.warn("[Dashboard] Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to live WebSocket alerts
    const unsubscribe = officerAlertsWS.subscribe((alertData) => {
      if (alertData.type === "NEW_ALERT") {
        setLiveAlerts((prev) => [alertData, ...prev.slice(0, 4)]);
        // Refresh case stats
        fetchDashboardData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const criticalCount = data.critical || 0;
  const highCount = data.high || 0;
  const recentCases = data.cases || [];

  return (
    <div className="officer-page">
      <header className="officer-header">
        <div>
          <h1>Officer Dashboard</h1>
          <p>AI-Assisted Real-Time Stress & Trauma Redressal Portal · NHAA 14566</p>
        </div>

        <div className="officer-profile">
          <div className="profile-icon">O</div>
          <div>
            <b>Duty Officer</b>
            <small>Response & Triage Unit</small>
          </div>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "16px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <Link to="/officer/dashboard" className="button" style={{ background: "#1d4ed8" }}>
          📊 Overview
        </Link>
        <Link to="/officer/cases" className="button" style={{ background: "#4b5563" }}>
          📁 All Cases
        </Link>
        <Link to="/officer/alerts" className="button" style={{ background: "#dc2626" }}>
          🚨 Live Alerts {criticalCount > 0 && `(${criticalCount})`}
        </Link>
        <Link to="/officer/reports" className="button" style={{ background: "#059669" }}>
          📈 Analytics & Reports
        </Link>
      </div>

      {/* Real-time incoming alert banner */}
      {liveAlerts.length > 0 && (
        <div
          style={{
            background: "#fef2f2",
            border: "1.5px solid #ef4444",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            animation: "pulse 2s infinite",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "bold", color: "#991b1b" }}>
              ⚡ Real-Time Intake Alert: {liveAlerts[0].message}
            </span>
            <Link
              to={`/officer/cases/${liveAlerts[0].assessment_id}`}
              style={{
                color: "#b91c1c",
                fontWeight: "bold",
                textDecoration: "underline",
                fontSize: "13.5px",
              }}
            >
              Open Case #{liveAlerts[0].assessment_id} →
            </Link>
          </div>
        </div>
      )}

      {criticalCount > 0 && (
        <div className="alert-box">
          🚨 <b>Critical Attention Required:</b>
          <span>{criticalCount} high/critical victim assessment(s) awaiting review.</span>
          <Link to="/officer/alerts">View Alerts →</Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="stats">
        <div className="stat-card">
          <span>Total Assessments</span>
          <h2>{loading ? "..." : data.total_cases}</h2>
        </div>

        <div className="stat-card critical">
          <span>Critical Severity</span>
          <h2>{loading ? "..." : criticalCount}</h2>
        </div>

        <div className="stat-card high">
          <span>High Risk</span>
          <h2>{loading ? "..." : highCount}</h2>
        </div>

        <div className="stat-card">
          <span>Moderate / Low</span>
          <h2>{loading ? "..." : (data.moderate || 0) + (data.low || 0)}</h2>
        </div>
      </div>

      {/* Recent Cases Table */}
      <div className="card">
        <div className="card-title">
          <h2>Recent Intake Statements & Assessments</h2>
          <Link to="/officer/cases">View All Cases →</Link>
        </div>

        {loading ? (
          <p style={{ padding: "20px", color: "#6b7280" }}>Loading assessments from database...</p>
        ) : recentCases.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>
            <p>No victim statements recorded yet.</p>
            <small>Assessments submitted via 14566, Chatbot, or Mobile App will appear here in real time.</small>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Channel</th>
                <th>Language</th>
                <th>Statement Summary</th>
                <th>SVI Score</th>
                <th>Risk Category</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {recentCases.slice(0, 8).map((item) => {
                const caseIdStr = `NHAA-${1000 + item.id}`;
                const riskLevelStr = (item.risk_level || "low").toLowerCase();
                const previewText = item.raw_text
                  ? item.raw_text.length > 50
                    ? item.raw_text.substring(0, 50) + "..."
                    : item.raw_text
                  : "Voice / Audio intake";

                return (
                  <tr key={item.id}>
                    <td>
                      <b>{caseIdStr}</b>
                    </td>
                    <td>
                      <span style={{ textTransform: "capitalize" }}>
                        {item.channel?.replace("_", " ") || "Chatbot"}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: "uppercase", fontSize: "12px", color: "#4b5563" }}>
                        {item.detected_language || "EN"}
                      </span>
                    </td>
                    <td style={{ maxWidth: "300px", color: "#374151" }}>{previewText}</td>
                    <td>
                      <b>{Math.round(item.svi_score || 0)}</b>/100
                    </td>
                    <td>
                      <span className={`risk ${riskLevelStr}`}>
                        {item.risk_level?.toUpperCase() || "LOW"}
                      </span>
                    </td>
                    <td>
                      <Link className="button" to={`/officer/cases/${item.id}`}>
                        Review Case
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}