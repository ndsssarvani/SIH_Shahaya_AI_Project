import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { acknowledgeAlert, getAlerts } from "../../services/api";
import { officerAlertsWS } from "../../services/websocket";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("loading");

  const loadAlerts = () => {
    getAlerts()
      .then((res) => {
        setAlerts(res || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    loadAlerts();

    // Subscribe to live websocket alerts
    const unsubscribe = officerAlertsWS.subscribe((newAlert) => {
      if (newAlert.type === "NEW_ALERT") {
        setAlerts((prev) => [
          {
            id: newAlert.alert_id,
            assessment_id: newAlert.assessment_id,
            level: newAlert.level,
            message: newAlert.message,
            acknowledged: false,
            created_at: newAlert.created_at,
          },
          ...prev,
        ]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const acknowledge = async (id) => {
    await acknowledgeAlert(id);
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
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
            <h1 style={{ marginTop: "8px" }}>Live Emergency & High-Risk Alerts</h1>
            <p style={{ color: "#6b7280" }}>
              Real-time feed of severe trauma, violence, and intimidation signals detected by Sahaya AI.
            </p>
          </div>
          <button
            onClick={loadAlerts}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      {status === "loading" && <p style={{ padding: "20px", color: "#6b7280" }}>Loading alerts...</p>}
      {status === "error" && (
        <p style={{ padding: "20px", color: "#dc2626" }}>
          Unable to load alerts. Please sign in as an officer and try again.
        </p>
      )}
      {status === "ready" && alerts.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "10px" }}>
          <p style={{ fontSize: "16px", color: "#16a34a", fontWeight: "bold" }}>✓ All caught up</p>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>No active critical alerts requiring attention right now.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {alerts.map((alert) => {
          const isCritical = String(alert.level).toLowerCase() === "critical";
          const alertTime = alert.created_at
            ? new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Live";

          return (
            <div
              className="alert-card"
              key={alert.id}
              style={{
                background: isCritical ? "#fff1f2" : "#fff",
                border: `1.5px solid ${isCritical ? "#fecdd3" : "#e5e7eb"}`,
                padding: "18px 22px",
                borderRadius: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                display: "flex",
                gap: "18px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: "28px" }}>{isCritical ? "🚨" : "⚠️"}</div>

              <div className="alert-content" style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`risk ${String(alert.level).toLowerCase()}`}>
                    {String(alert.level).toUpperCase()} PRIORITY
                  </span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{alertTime}</span>
                </div>

                <h2 style={{ fontSize: "18px", margin: "8px 0 4px" }}>
                  Case #{alert.assessment_id} Escalation
                </h2>
                <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5" }}>{alert.message}</p>

                <div style={{ display: "flex", gap: "12px", marginTop: "14px", alignItems: "center" }}>
                  <Link
                    className="button"
                    to={`/officer/cases/${alert.assessment_id}`}
                    style={{ background: "#2563eb" }}
                  >
                    View Full Case Assessment
                  </Link>

                  {!alert.acknowledged ? (
                    <button
                      className="primary-button"
                      onClick={() => acknowledge(alert.id)}
                      style={{
                        padding: "8px 14px",
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ✓ Acknowledge Alert
                    </button>
                  ) : (
                    <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: "13.5px" }}>
                      ✓ Acknowledged by Responder
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}