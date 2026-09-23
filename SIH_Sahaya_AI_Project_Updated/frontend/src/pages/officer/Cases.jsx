import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../services/api";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");

  useEffect(() => {
    getDashboard()
      .then((res) => {
        setCases(res.cases || []);
      })
      .catch((err) => console.warn("[Cases] Error fetching cases:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = cases.filter((item) => {
    const caseIdStr = `NHAA-${1000 + item.id}`.toLowerCase();
    const rawText = (item.raw_text || "").toLowerCase();
    const lang = (item.detected_language || "").toLowerCase();
    const channel = (item.channel || "").toLowerCase();
    const riskLevel = (item.risk_level || "").toLowerCase();

    const matchesSearch =
      caseIdStr.includes(search.toLowerCase()) ||
      rawText.includes(search.toLowerCase()) ||
      lang.includes(search.toLowerCase()) ||
      channel.includes(search.toLowerCase());

    const matchesRisk =
      risk === "All" || riskLevel === risk.toLowerCase();

    const matchesChannel =
      channelFilter === "All" || channel === channelFilter.toLowerCase();

    return matchesSearch && matchesRisk && matchesChannel;
  });

  return (
    <div className="officer-page">
      <header className="page-header" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Link to="/officer/dashboard" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ marginTop: "8px" }}>All Intake Cases & Statements</h1>
            <p style={{ color: "#6b7280" }}>
              Comprehensive log of victim statements received across NHAA 14566 channels.
            </p>
          </div>
        </div>
      </header>

      <div className="filters" style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search Case ID, keywords or language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 300px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db" }}
        />

        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db" }}
        >
          <option value="All">All Risk Levels</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Moderate">Moderate</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db" }}
        >
          <option value="All">All Channels</option>
          <option value="chatbot">Chatbot</option>
          <option value="helpline_14566">Helpline 14566</option>
          <option value="ivrs">IVRS</option>
          <option value="mobile_app">Mobile App</option>
          <option value="integrated_portal">Integrated Portal</option>
        </select>
      </div>

      <div className="card">
        <h2>
          Cases ({filteredCases.length})
        </h2>

        {loading ? (
          <p style={{ padding: "20px", color: "#6b7280" }}>Loading cases from database...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Channel</th>
                <th>Language</th>
                <th>Statement Excerpt</th>
                <th>SVI Score</th>
                <th>Risk Level</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCases.map((item) => {
                const caseIdStr = `NHAA-${1000 + item.id}`;
                const riskLevelStr = (item.risk_level || "low").toLowerCase();
                const preview = item.raw_text
                  ? item.raw_text.length > 55
                    ? item.raw_text.substring(0, 55) + "..."
                    : item.raw_text
                  : "Voice recording intake";
                const dateStr = item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : "Today";

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
                    <td style={{ maxWidth: "320px", color: "#374151" }}>{preview}</td>
                    <td>
                      <b>{Math.round(item.svi_score || 0)}</b>/100
                    </td>
                    <td>
                      <span className={`risk ${riskLevelStr}`}>
                        {item.risk_level?.toUpperCase() || "LOW"}
                      </span>
                    </td>
                    <td style={{ fontSize: "12.5px", color: "#6b7280" }}>{dateStr}</td>
                    <td>
                      <Link className="button" to={`/officer/cases/${item.id}`}>
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filteredCases.length === 0 && (
          <div className="empty" style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>
            No matching cases found.
          </div>
        )}
      </div>
    </div>
  );
}