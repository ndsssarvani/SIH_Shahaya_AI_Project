import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CONSENT_CSS = `
  :root{
    --paper:#FAF8F4;
    --paper-2:#F1ECE3;
    --ink:#2B2E33;
    --ink-soft:#6E7278;
    --teal:#6B968C;
    --teal-deep:#48685F;
    --teal-pale:#E7F0EC;
    --amber:#C9A468;
    --amber-pale:#F5ECD9;
    --coral:#C08A7B;
    --coral-pale:#F3E4DE;
    --line:#E6E0D3;
    --radius:16px;
    --shadow: 0 10px 30px rgba(43,46,51,0.06);
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    background:var(--paper);
    color:var(--ink);
    font-family:'Inter',sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  h1,h2,h3{
    font-family:'Fraunces',serif;
    font-weight:600;
    letter-spacing:-0.01em;
    margin:0;
  }
  .mono{
    font-family:'IBM Plex Mono',monospace;
    letter-spacing:0.06em;
    text-transform:uppercase;
  }
  a{color:inherit;text-decoration:none;}

  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}

  .consent-shell{
    min-height:100vh;
    display:flex;
    flex-direction:column;
    align-items:center;
    padding:48px 24px 64px;
    position:relative;
    overflow:hidden;
  }
  .consent-aurora{
    position:absolute;border-radius:50%;filter:blur(100px);opacity:0.35;pointer-events:none;
  }
  .consent-aurora.a1{width:420px;height:420px;top:-160px;left:-120px;background:radial-gradient(circle,rgba(107,150,140,0.55) 0%,rgba(107,150,140,0) 70%);}
  .consent-aurora.a2{width:380px;height:380px;bottom:-160px;right:-100px;background:radial-gradient(circle,rgba(201,164,104,0.4) 0%,rgba(201,164,104,0) 70%);}

  .consent-brand{
    display:flex;align-items:center;gap:12px;position:relative;z-index:1;margin-bottom:36px;
  }
  .consent-brand-mark{
    width:38px;height:38px;border-radius:10px;
    background:linear-gradient(145deg,var(--teal),var(--teal-deep));
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 14px rgba(107,150,140,0.35);
  }
  .consent-brand-mark svg{width:20px;height:20px;stroke:#fff;}
  .consent-brand-name{font-family:'Fraunces',serif;font-weight:600;font-size:19px;color:var(--ink);}
  .consent-brand-name span{color:var(--teal);}
  .consent-brand-sub{font-size:10.5px;color:var(--ink-soft);}

  .consent-card{
    position:relative;z-index:1;
    width:100%;max-width:640px;
    background:#fff;border:1px solid var(--line);border-radius:22px;
    padding:44px;box-shadow:var(--shadow);
  }

  .consent-eyebrow{
    display:inline-flex;align-items:center;gap:9px;
    font-size:11px;color:var(--teal-deep);background:var(--teal-pale);
    padding:8px 16px;border-radius:999px;margin-bottom:22px;
  }
  .consent-eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite;}

  .consent-title{font-size:28px;line-height:1.25;margin-bottom:12px;}
  .consent-subtitle{font-size:14.5px;color:var(--ink-soft);line-height:1.7;margin-bottom:30px;}

  .consent-section-label{
    font-size:11.5px;color:var(--teal-deep);margin-bottom:14px;display:flex;align-items:center;gap:8px;
  }
  .consent-section-label::before{content:'';width:18px;height:1.5px;background:var(--teal);}

  .consent-list{list-style:none;padding:0;margin:0 0 30px;display:flex;flex-direction:column;gap:10px;}
  .consent-list li{
    display:flex;gap:12px;align-items:flex-start;
    padding:14px 16px;background:var(--paper-2);border-radius:12px;
    font-size:13.5px;color:var(--ink-soft);line-height:1.55;
  }
  .consent-list li b{color:var(--ink);font-weight:600;}
  .consent-list .icon{
    width:26px;height:26px;border-radius:50%;background:var(--teal-pale);flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
  }
  .consent-list .icon svg{width:13px;height:13px;stroke:var(--teal-deep);}

  .consent-checks{display:flex;flex-direction:column;gap:14px;margin-bottom:8px;}
  .consent-check{
    display:flex;gap:12px;align-items:flex-start;
    padding:16px;border:1.5px solid var(--line);border-radius:14px;
    cursor:pointer;transition:border-color .2s ease,background .2s ease;
  }
  .consent-check:hover{border-color:var(--teal);}
  .consent-check.checked{border-color:var(--teal);background:var(--teal-pale);}
  .consent-check input{
    margin-top:2px;width:17px;height:17px;accent-color:var(--teal);flex-shrink:0;cursor:pointer;
  }
  .consent-check .txt{font-size:13.5px;color:var(--ink);line-height:1.55;}
  .consent-check .txt .req{
    font-size:9.5px;font-weight:700;letter-spacing:0.04em;color:var(--coral);margin-left:6px;
  }
  .consent-check .txt .opt{
    font-size:9.5px;font-weight:700;letter-spacing:0.04em;color:var(--ink-soft);margin-left:6px;
  }
  .consent-error{font-size:12px;color:#B5453A;margin:-4px 0 18px;}

  .consent-actions{
    display:flex;gap:12px;margin-top:28px;flex-wrap:wrap;
  }
  .btn-consent{
    font-family:'Inter',sans-serif;font-size:14px;font-weight:700;
    padding:14px 26px;border-radius:999px;cursor:pointer;border:1.5px solid transparent;
    display:inline-flex;align-items:center;gap:8px;transition:all .25s ease;flex:1;justify-content:center;
  }
  .btn-consent svg{width:15px;height:15px;}
  .btn-consent.primary{background:var(--teal);color:#fff;box-shadow:0 6px 16px rgba(107,150,140,0.28);}
  .btn-consent.primary:hover{background:var(--teal-deep);transform:translateY(-1px);}
  .btn-consent.primary:disabled{background:#C9D3CE;cursor:not-allowed;transform:none;box-shadow:none;}
  .btn-consent.ghost{border-color:var(--line);color:var(--ink-soft);background:transparent;}
  .btn-consent.ghost:hover{border-color:var(--coral);color:#8A4A3B;}

  .consent-helpline{
    margin-top:26px;padding:14px 16px;border-radius:12px;background:var(--coral-pale);
    display:flex;gap:10px;align-items:flex-start;font-size:12px;color:#8A4A3B;line-height:1.6;
  }
  .consent-helpline svg{width:16px;height:16px;stroke:#C08A7B;flex-shrink:0;margin-top:1px;}
  .consent-helpline b{font-family:'IBM Plex Mono',monospace;}

  .consent-back{
    display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-soft);
    margin-top:24px;position:relative;z-index:1;
  }
  .consent-back:hover{color:var(--ink);}
  .consent-back svg{width:15px;height:15px;}

  @media (max-width:640px){
    .consent-card{padding:28px;}
    .consent-actions{flex-direction:column;}
  }
`;

export default function Consent() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = location.state?.role === "officer" ? "officer" : "client";
  const identifier = location.state?.identifier || "";

  const [checks, setChecks] = useState({
    analysis: false,
    supportNotReplace: false,
    dataUse: false, // optional
  });
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Your Consent — SAHAYA AI";
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(fontLink);
    return () => {
      if (fontLink.parentNode) fontLink.parentNode.removeChild(fontLink);
    };
  }, []);

  const toggle = (key) => () => {
    setChecks((c) => ({ ...c, [key]: !c[key] }));
    setError("");
  };

  const requiredMet = checks.analysis && checks.supportNotReplace;

  const handleContinue = () => {
    if (!requiredMet) {
      setError("Please confirm the two required items above before continuing.");
      return;
    }
    const consent = {
      analysis: checks.analysis,
      supportNotReplace: checks.supportNotReplace,
      dataUse: checks.dataUse,
      givenAt: new Date().toISOString(),
    };
    // Officers go to the case dashboard; clients go straight into the
    // complaint chatbot, carrying their consent record with them.
    navigate(role === "officer" ? "/dashboard" : "/complaint", {
      state: { role, identifier, consent },
    });
  };

  const handleDecline = () => {
    // Route declined users to a resources page instead of the analysis flow.
    navigate("/resources", { state: { role, consentDeclined: true } });
  };

  return (
    <>
      <style>{CONSENT_CSS}</style>
      <div className="consent-shell">
        <div className="consent-aurora a1"></div>
        <div className="consent-aurora a2"></div>

        <div className="consent-brand">
          <div className="consent-brand-mark">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21c-4-2.5-7-6-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 7.5-7 10z" />
              <path d="M9 12h1.5l1-2 2 4 1-2H16" />
            </svg>
          </div>
          <div>
            <div className="consent-brand-name">SAHAYA <span>AI</span></div>
            <div className="consent-brand-sub mono">NHAA · 14566</div>
          </div>
        </div>

        <div className="consent-card">
          <div className="consent-eyebrow">
            <span className="dot"></span> BEFORE WE BEGIN
          </div>
          <h1 className="consent-title">Your voice matters — and so does your consent.</h1>
          <p className="consent-subtitle">
            Before we start, here's exactly what SAHAYA AI looks at, and why. You're in control of what
            happens next.
          </p>

          <div className="consent-section-label mono">What we analyse</div>
          <ul className="consent-list">
            <li>
              <span className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
                </svg>
              </span>
              <span><b>Voice and speech patterns</b> — pace, pauses, pitch and vocal strain, if you speak with us.</span>
            </li>
            <li>
              <span className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span><b>Text and language</b> — the words you type or that are transcribed, to understand tone and emotion.</span>
            </li>
            <li>
              <span className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18M7 15l4-6 3 4 5-8" />
                </svg>
              </span>
              <span><b>A resulting SVI score</b> — a single, explainable number our counsellors use to prioritise support.</span>
            </li>
          </ul>

          <div className="consent-section-label mono">Please confirm</div>
          <div className="consent-checks">
            <label className={`consent-check ${checks.analysis ? "checked" : ""}`}>
              <input type="checkbox" checked={checks.analysis} onChange={toggle("analysis")} />
              <span className="txt">
                I understand my voice and/or text may be analysed to assess stress and distress signals.
                <span className="req">REQUIRED</span>
              </span>
            </label>

            <label className={`consent-check ${checks.supportNotReplace ? "checked" : ""}`}>
              <input type="checkbox" checked={checks.supportNotReplace} onChange={toggle("supportNotReplace")} />
              <span className="txt">
                I understand this is a decision-support tool that assists, and does not replace, professional
                psychological, medical or legal assessment.
                <span className="req">REQUIRED</span>
              </span>
            </label>

            <label className={`consent-check ${checks.dataUse ? "checked" : ""}`}>
              <input type="checkbox" checked={checks.dataUse} onChange={toggle("dataUse")} />
              <span className="txt">
                I agree that my anonymised data may be used to improve SAHAYA AI's accuracy over time.
                <span className="opt">OPTIONAL</span>
              </span>
            </label>
          </div>

          {error && <div className="consent-error">{error}</div>}

          <div className="consent-actions">
            <button
              type="button"
              className="btn-consent primary"
              onClick={handleContinue}
              disabled={!requiredMet}
            >
              I Consent — Continue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <button type="button" className="btn-consent ghost" onClick={handleDecline}>
              I Do Not Consent
            </button>
          </div>

          <div className="consent-helpline">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            <span>
              If you or someone you know is in immediate danger, you don't need to consent to anything first —
              call <b>14566</b> or local emergency services now.
            </span>
          </div>
        </div>

        <Link className="consent-back" to="/login" state={{ role }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to sign in
        </Link>
      </div>
    </>
  );
}