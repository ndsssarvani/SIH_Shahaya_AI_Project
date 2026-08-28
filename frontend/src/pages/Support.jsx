import React from "react";
import { useNavigate } from "react-router-dom";
import ClientNavbar from "../components/Clientnavbar.jsx";

export default function Support() {
  const navigate = useNavigate();

  const callHelpline = () => {
    window.location.href = "tel:14566";
  };

  return (
    <div className="support-page">

      <style>{`
        .support-page {
          min-height: 100vh;
          background: #FAF8F4;
          color: #2B2E33;
          font-family: 'Inter', sans-serif;
        }

        .support-container {
          max-width: 1100px;
          margin: auto;
          padding: 45px 28px 70px;
        }

        .support-kicker {
          color: #6B968C;
          font-size: 11px;
          letter-spacing: .13em;
          margin-bottom: 8px;
        }

        .support-hero h1 {
          font-family: 'Fraunces', serif;
          font-size: 40px;
          margin: 0 0 10px;
        }

        .support-hero p {
          color: #6E7278;
          font-size: 14px;
          line-height: 1.7;
          max-width: 650px;
          margin-bottom: 30px;
        }

        .support-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .support-card {
          background: white;
          border: 1px solid #E6E0D3;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(43,46,51,.06);
        }

        .support-card.dark {
          background: #2B2E33;
          color: white;
          border: none;
        }

        .support-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #E7F0EC;
          color: #48685F;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 17px;
          font-size: 20px;
        }

        .support-card h2 {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          margin: 0 0 8px;
        }

        .support-card p {
          color: #6E7278;
          font-size: 12.5px;
          line-height: 1.7;
          margin-bottom: 18px;
        }

        .support-card.dark p {
          color: #B9C6C6;
        }

        .support-link {
          border: none;
          background: #E7F0EC;
          color: #48685F;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .support-link:hover {
          background: #6B968C;
          color: white;
        }

        .helpline-number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 32px;
          margin: 15px 0;
          letter-spacing: .03em;
        }

        .call-btn {
          width: 100%;
          border: none;
          background: white;
          color: #2B2E33;
          padding: 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .call-btn:hover {
          transform: translateY(-1px);
        }

        .support-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .support-list li {
          padding: 11px 0;
          border-bottom: 1px solid #E6E0D3;
          font-size: 12.5px;
          color: #555A60;
          display: flex;
          gap: 10px;
        }

        .support-list li:last-child {
          border-bottom: none;
        }

        .check {
          color: #6B968C;
          font-weight: 700;
        }

        .bottom-banner {
          margin-top: 20px;
          padding: 22px;
          border-radius: 18px;
          background: #F1ECE3;
          border: 1px solid #E6E0D3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .bottom-banner h3 {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          margin: 0 0 5px;
        }

        .bottom-banner p {
          color: #6E7278;
          font-size: 12px;
          margin: 0;
        }

        .bottom-btn {
          border: none;
          background: #6B968C;
          color: white;
          padding: 11px 18px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        @media(max-width:750px) {
          .support-grid {
            grid-template-columns: 1fr;
          }

          .support-container {
            padding: 30px 16px;
          }

          .support-hero h1 {
            font-size: 32px;
          }

          .bottom-banner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <ClientNavbar />

      <main className="support-container">

        <section className="support-hero">
          <div className="support-kicker mono">
            SAHAYA AI · SUPPORT
          </div>

          <h1>You're not alone.</h1>

          <p>
            Choose the kind of support that feels right for you. You can talk
            to Sahaya, request human support, understand your options, or call
            the helpline directly.
          </p>
        </section>

        <div className="support-grid">

          <section className="support-card">
            <div className="support-icon">💬</div>

            <h2>Talk to Sahaya</h2>

            <p>
              Continue your private conversation with Sahaya and share only
              what you feel comfortable sharing.
            </p>

            <button
              className="support-link"
              onClick={() => navigate("/complaint")}
            >
              Start conversation
            </button>
          </section>

          <section className="support-card">
            <div className="support-icon">🤝</div>

            <h2>Counsellor support</h2>

            <p>
              Request support from a trained human professional when you feel
              that talking to someone would help.
            </p>

            <button
              className="support-link"
              onClick={() => navigate("/complaint")}
            >
              Request support
            </button>
          </section>

          <section className="support-card">
            <div className="support-icon">⚖</div>

            <h2>Legal information</h2>

            <p>
              Understand possible next steps and available options without
              having to make a decision immediately.
            </p>

            <button
              className="support-link"
              onClick={() => navigate("/complaint")}
            >
              Explore options
            </button>
          </section>

          <section className="support-card">
            <div className="support-icon">🛡</div>

            <h2>Safety support</h2>

            <p>
              If you feel unsafe right now, prioritise immediate safety and
              reach out to appropriate real-world support.
            </p>

            <button
              className="support-link"
              onClick={callHelpline}
            >
              Call helpline
            </button>
          </section>

          <section className="support-card">
            <h2>What Sahaya can help with</h2>

            <p>
              Support can include:
            </p>

            <ul className="support-list">
              <li>
                <span className="check">✓</span>
                Emotional support and listening
              </li>

              <li>
                <span className="check">✓</span>
                Understanding available options
              </li>

              <li>
                <span className="check">✓</span>
                Connecting you to human support
              </li>

              <li>
                <span className="check">✓</span>
                Guidance towards appropriate services
              </li>
            </ul>
          </section>

          <section className="support-card dark">
            <div className="support-kicker">
              NATIONAL HELPLINE
            </div>

            <h2>Need immediate help?</h2>

            <div className="helpline-number">
              14566
            </div>

            <p>
              Toll-free, 24×7 support. You can call directly even if you don't
              continue the conversation here.
            </p>

            <button
              className="call-btn"
              onClick={callHelpline}
            >
              Call 14566
            </button>
          </section>

        </div>

        <div className="bottom-banner">

          <div>
            <h3>Want to continue your case?</h3>
            <p>
              You can return to your conversation whenever you're ready.
            </p>
          </div>

          <button
            className="bottom-btn"
            onClick={() => navigate("/status")}
          >
            View case status
          </button>

        </div>

      </main>
    </div>
  );
}