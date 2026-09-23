import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnalytics } from "../../services/api";

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => {
        setAnalytics(res);
      })
      .catch((err) => console.warn("[Reports] Error fetching analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const riskBreakdown = analytics?.risk_level_breakdown || [];
  const channelBreakdown = analytics?.channel_breakdown || [];
  const sviStats = analytics?.svi_by_risk || [];
  const alertsSummary = analytics?.unacknowledged_alerts || [];

  const totalCases = riskBreakdown.reduce((sum, item) => sum + (item.count || 0), 0) || 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="officer-page">
      <header className="page-header" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Link
              to="/officer/dashboard"
              style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}
            >
              ← Back to Dashboard
            </Link>
            <h1 style={{ marginTop: "8px" }}>Reports & System Analytics</h1>
            <p style={{ color: "#6b7280" }}>
              Aggregate statistical indicators for Ministry of Social Justice & Empowerment (MoSJE) / NHAA.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={handlePrint}
            style={{
              padding: "10px 18px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🖨️ Export / Print Report
          </button>
        </div>
      </header>

      {loading ? (
        <p style={{ padding: "20px", color: "#6b7280" }}>Generating real-time analytics...</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat-card">
              <span>Total Recorded Assessments</span>
              <h2>{totalCases}</h2>
            </div>

            <div className="stat-card critical">
              <span>Critical Intakes</span>
              <h2>
                {riskBreakdown.find((r) => r.risk_level === "critical")?.count || 0}
              </h2>
            </div>

            <div className="stat-card high">
              <span>High Risk Intakes</span>
              <h2>
                {riskBreakdown.find((r) => r.risk_level === "high")?.count || 0}
              </h2>
            </div>

            <div className="stat-card">
              <span>Active Intake Channels</span>
              <h2>{channelBreakdown.length || 1}</h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Risk Distribution Card */}
            <div className="card">
              <h2>Risk Level Breakdown</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                {riskBreakdown.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>No data recorded yet.</p>
                ) : (
                  riskBreakdown.map((row) => {
                    const percentage = Math.round((row.count / totalCases) * 100);
                    const riskColor =
                      row.risk_level === "critical"
                        ? "#dc2626"
                        : row.risk_level === "high"
                        ? "#ea580c"
                        : row.risk_level === "moderate"
                        ? "#d97706"
                        : "#16a34a";

                    return (
                      <div key={row.risk_level}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <b style={{ textTransform: "capitalize" }}>{row.risk_level}</b>
                          <span>
                            {row.count} cases ({percentage}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "8px",
                            background: "#e5e7eb",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${percentage}%`,
                              background: riskColor,
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Channel Breakdown Card */}
            <div className="card">
              <h2>Intake Channels Distribution</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                {channelBreakdown.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>No channel data available.</p>
                ) : (
                  channelBreakdown.map((row) => {
                    const percentage = Math.round((row.count / totalCases) * 100);
                    return (
                      <div key={row.channel}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <b style={{ textTransform: "capitalize" }}>
                            {row.channel?.replace(/_/g, " ") || "Other"}
                          </b>
                          <span>
                            {row.count} ({percentage}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "8px",
                            background: "#e5e7eb",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${percentage}%`,
                              background: "#2563eb",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* SVI Stats Table */}
          <div className="card" style={{ marginTop: "20px" }}>
            <h2>Stress Vulnerability Index (SVI) Metrics by Risk Tier</h2>
            <table style={{ marginTop: "12px" }}>
              <thead>
                <tr>
                  <th>Risk Tier</th>
                  <th>Average SVI</th>
                  <th>Minimum SVI</th>
                  <th>Maximum SVI</th>
                  <th>Total Sample Size</th>
                </tr>
              </thead>
              <tbody>
                {sviStats.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                      No SVI metrics calculated yet.
                    </td>
                  </tr>
                ) : (
                  sviStats.map((row) => (
                    <tr key={row.risk_level}>
                      <td>
                        <span className={`risk ${row.risk_level}`}>
                          {row.risk_level?.toUpperCase()}
                        </span>
                      </td>
                      <td><b>{row.avg_svi}</b> / 100</td>
                      <td>{row.min_svi}</td>
                      <td>{row.max_svi}</td>
                      <td>{row.n} cases</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}