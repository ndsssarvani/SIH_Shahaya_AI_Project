import React from "react";
import { useNavigate } from "react-router-dom";
import ClientNavbar from "../components/Clientnavbar.jsx";

export default function Status() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Complaint received",
      description: "Your complaint has been securely received by SAHAYA.",
      date: "Today · 10:42 AM",
      done: true
    },
    {
      title: "Initial assessment",
      description: "The submitted information is being reviewed for support routing.",
      date: "In progress",
      done: true,
      current: true
    },
    {
      title: "Human review",
      description: "A trained support professional can review the case when required.",
      date: "Pending",
      done: false
    },
    {
      title: "Support / action",
      description: "You will be guided towards the appropriate next step.",
      date: "Pending",
      done: false
    }
  ];

  return (
    <div className="status-page">
      <style>{`
        .status-page {
          min-height: 100vh;
          background: #FAF8F4;
          color: #2B2E33;
          font-family: 'Inter', sans-serif;
        }

        .status-container {
          max-width: 1050px;
          margin: auto;
          padding: 45px 28px 70px;
        }

        .status-kicker {
          color: #6B968C;
          font-size: 11px;
          letter-spacing: .13em;
          margin-bottom: 8px;
        }

        .status-hero h1 {
          font-family: 'Fraunces', serif;
          font-size: 40px;
          margin: 0 0 10px;
        }

        .status-hero p {
          color: #6E7278;
          font-size: 14px;
          line-height: 1.7;
          max-width: 650px;
          margin-bottom: 30px;
        }

        .case-card {
          background: white;
          border: 1px solid #E6E0D3;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(43,46,51,.06);
          margin-bottom: 22px;
        }

        .case-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .case-label {
          color: #6E7278;
          font-size: 10px;
          letter-spacing: .1em;
          margin-bottom: 5px;
        }

        .case-number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 18px;
          font-weight: 600;
        }

        .case-badge {
          background: #F5ECD9;
          color: #8C6E36;
          border: 1px solid #D3B579;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 10px;
          font-weight: 700;
        }

        .timeline-card {
          background: white;
          border: 1px solid #E6E0D3;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(43,46,51,.06);
        }

        .timeline-title {
          font-family: 'Fraunces', serif;
          font-size: 23px;
          margin-bottom: 25px;
        }

        .timeline {
          position: relative;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 14px;
          top: 15px;
          bottom: 15px;
          width: 2px;
          background: #E6E0D3;
        }

        .timeline-item {
          position: relative;
          display: grid;
          grid-template-columns: 30px 1fr auto;
          gap: 15px;
          margin-bottom: 28px;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #F1ECE3;
          border: 2px solid #D8D1C4;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .timeline-dot.done {
          background: #E7F0EC;
          border-color: #6B968C;
          color: #48685F;
        }

        .timeline-dot.current {
          box-shadow: 0 0 0 5px rgba(107,150,140,.12);
        }

        .timeline-content h3 {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          margin: 3px 0 5px;
        }

        .timeline-content p {
          color: #6E7278;
          font-size: 12.5px;
          line-height: 1.6;
          margin: 0;
        }

        .timeline-date {
          font-size: 10.5px;
          color: #6E7278;
          padding-top: 7px;
          text-align: right;
          white-space: nowrap;
        }

        .status-note {
          margin-top: 22px;
          background: #E7F0EC;
          color: #48685F;
          border-radius: 14px;
          padding: 15px 17px;
          font-size: 12px;
          line-height: 1.6;
        }

        .status-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }

        .status-btn {
          border: none;
          border-radius: 999px;
          padding: 11px 18px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          background: #6B968C;
          color: white;
        }

        .status-btn.secondary {
          background: white;
          border: 1px solid #D8D1C4;
          color: #2B2E33;
        }

        @media(max-width:700px) {
          .status-container {
            padding: 30px 16px;
          }

          .status-hero h1 {
            font-size: 32px;
          }

          .timeline-item {
            grid-template-columns: 30px 1fr;
          }

          .timeline-date {
            grid-column: 2;
            text-align: left;
            padding-top: 0;
          }
        }
      `}</style>

      <ClientNavbar />

      <main className="status-container">

        <section className="status-hero">
          <div className="status-kicker mono">
            SAHAYA AI · CASE STATUS
          </div>

          <h1>Your complaint status</h1>

          <p>
            Follow the progress of your complaint and understand what happens
            at each stage. You remain in control of what information you share.
          </p>
        </section>

        <section className="case-card">
          <div className="case-top">
            <div>
              <div className="case-label mono">CASE REFERENCE</div>
              <div className="case-number">SH-2026-00184</div>
            </div>

            <div className="case-badge">
              ASSESSMENT IN PROGRESS
            </div>
          </div>
        </section>

        <section className="timeline-card">

          <h2 className="timeline-title">
            Case journey
          </h2>

          <div className="timeline">

            {steps.map((step, index) => (
              <div className="timeline-item" key={step.title}>

                <div
                  className={`timeline-dot
                    ${step.done ? "done" : ""}
                    ${step.current ? "current" : ""}
                  `}
                >
                  {step.done ? "✓" : index + 1}
                </div>

                <div className="timeline-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>

                <div className="timeline-date">
                  {step.date}
                </div>

              </div>
            ))}

          </div>

          <div className="status-note">
            <strong>Privacy reminder:</strong> Case information shown here is
            for your support journey. Do not share your case reference publicly.
          </div>

          <div className="status-actions">
            <button
              className="status-btn"
              onClick={() => navigate("/support")}
            >
              Get support
            </button>

            <button
              className="status-btn secondary"
              onClick={() => navigate("/complaint")}
            >
              Return to Sahaya
            </button>
          </div>

        </section>

      </main>
    </div>
  );
}