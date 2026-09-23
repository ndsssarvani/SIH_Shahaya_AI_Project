import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { register } from "../services/api";

const AUTH_CSS = `
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

  .auth-shell{
    min-height:100vh;
    display:grid;
    grid-template-columns:1fr 1fr;
  }

  /* LEFT PANEL */
  .auth-side{
    position:relative;
    overflow:hidden;
    background:radial-gradient(120% 100% at 0% 0%, #262A2F 0%, #17191C 60%, #121315 100%);
    color:#fff;
    padding:48px;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
  }
  .auth-aurora{
    position:absolute;border-radius:50%;filter:blur(95px);opacity:0.6;pointer-events:none;
  }
  .auth-aurora.a1{width:480px;height:480px;left:-160px;top:-160px;background:radial-gradient(circle,rgba(107,150,140,0.55) 0%,rgba(107,150,140,0) 70%);}
  .auth-aurora.a2{width:420px;height:420px;right:-140px;bottom:-160px;background:radial-gradient(circle,rgba(201,164,104,0.4) 0%,rgba(201,164,104,0) 70%);}

  .auth-brand{display:flex;align-items:center;gap:12px;position:relative;z-index:1;}
  .auth-brand-mark{
    width:38px;height:38px;border-radius:10px;
    background:linear-gradient(145deg,var(--teal),var(--teal-deep));
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 14px rgba(107,150,140,0.35);
  }
  .auth-brand-mark svg{width:20px;height:20px;stroke:#fff;}
  .auth-brand-name{font-family:'Fraunces',serif;font-weight:600;font-size:19px;}
  .auth-brand-name span{color:var(--teal);}
  .auth-brand-sub{font-size:10.5px;color:rgba(255,255,255,0.55);}

  .auth-side-body{position:relative;z-index:1;max-width:420px;}
  .auth-eyebrow{
    display:inline-flex;align-items:center;gap:9px;
    font-size:11px;color:#DCEAE6;background:rgba(255,255,255,0.07);
    border:1px solid rgba(255,255,255,0.14);
    padding:8px 16px;border-radius:999px;margin-bottom:28px;
  }
  .auth-eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite;}
  .auth-side-title{font-size:clamp(28px,3vw,38px);line-height:1.2;letter-spacing:-0.01em;}
  .auth-side-title .accent{color:#AFC9C1;}
  .auth-side-copy{margin-top:18px;font-size:14.5px;line-height:1.7;color:rgba(255,255,255,0.65);}

  .auth-side-foot{
    position:relative;z-index:1;font-size:13px;color:rgba(255,255,255,0.7);
    border-top:1px solid rgba(255,255,255,0.12);padding-top:20px;
  }
  .auth-side-foot b{font-family:'IBM Plex Mono',monospace;letter-spacing:0.05em;color:#fff;}

  /* RIGHT PANEL */
  .auth-form-wrap{
    display:flex;align-items:center;justify-content:center;
    padding:48px 32px;background:var(--paper);
  }
  .auth-card{width:100%;max-width:420px;}
  .auth-back{
    display:inline-flex;align-items:center;gap:8px;font-size:13.5px;color:var(--ink-soft);
    margin-bottom:32px;transition:color .2s ease;
  }
  .auth-back:hover{color:var(--ink);}
  .auth-back svg{width:16px;height:16px;}

  .toast-banner{
    display:flex;align-items:center;gap:10px;
    background:var(--teal-pale);color:var(--teal-deep);
    border:1px solid #BFDBD1;border-radius:12px;
    padding:12px 16px;font-size:13.5px;margin-bottom:22px;
  }
  .toast-banner svg{width:16px;height:16px;flex-shrink:0;}

  .auth-role-toggle{
    display:flex;background:var(--paper-2);border-radius:999px;padding:4px;margin-bottom:28px;
  }
  .auth-role-btn{
    flex:1;border:none;background:transparent;padding:10px 0;border-radius:999px;
    font-size:13.5px;font-weight:600;color:var(--ink-soft);cursor:pointer;transition:all .25s ease;
  }
  .auth-role-btn.active{background:#fff;color:var(--ink);box-shadow:var(--shadow);}

  .auth-title{font-size:26px;margin-bottom:8px;}
  .auth-subtitle{font-size:14px;color:var(--ink-soft);margin-bottom:28px;line-height:1.6;}

  .field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .field-group{margin-bottom:18px;}
  .field-label{
    display:block;font-size:12.5px;font-weight:600;color:var(--ink);margin-bottom:8px;
  }
  .field-input{
    width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--line);
    background:#fff;font-size:14px;color:var(--ink);outline:none;transition:border-color .2s ease;
  }
  .field-input:focus{border-color:var(--teal);}
  .field-input::placeholder{color:#A9A497;}
  .field-error{font-size:12px;color:#B5453A;margin-top:6px;}

  .field-meta-row{
    display:flex;justify-content:space-between;align-items:center;margin-bottom:26px;font-size:13px;
  }
  .checkbox-row{display:flex;align-items:center;gap:8px;color:var(--ink-soft);cursor:pointer;}
  .checkbox-row input{accent-color:var(--teal);width:15px;height:15px;}
  .link-teal{color:var(--teal-deep);font-weight:600;}
  .link-teal:hover{text-decoration:underline;}

  .btn-auth-submit{
    width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
    background:var(--teal);color:#fff;font-size:14.5px;font-weight:700;
    padding:14px 0;border-radius:999px;border:none;cursor:pointer;
    box-shadow:0 6px 16px rgba(107,150,140,0.28);transition:all .25s ease;
  }
  .btn-auth-submit:hover{background:var(--teal-deep);transform:translateY(-1px);}
  .btn-auth-submit svg{width:16px;height:16px;}

  .auth-divider{display:flex;align-items:center;gap:14px;margin:28px 0 18px;}
  .auth-divider .line{flex:1;height:1px;background:var(--line);}
  .auth-divider .mono{font-size:10.5px;color:var(--ink-soft);}

  .auth-switch{text-align:center;font-size:13.5px;color:var(--ink-soft);}

  .auth-helpline{
    margin-top:32px;padding:14px 16px;border-radius:12px;background:var(--coral-pale);
    display:flex;gap:10px;align-items:flex-start;font-size:12px;color:#8A4A3B;line-height:1.6;
  }
  .auth-helpline svg{width:16px;height:16px;stroke:#C08A7B;flex-shrink:0;margin-top:1px;}
  .auth-helpline b{font-family:'IBM Plex Mono',monospace;}

  @media (max-width:900px){
    .auth-shell{grid-template-columns:1fr;}
    .auth-side{display:none;}
    .field-row{grid-template-columns:1fr;}
  }
`;

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialRole = location.state?.role === "officer" ? "officer" : "client";
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({
    fullName: "",
    identifier: "",
    department: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Create Account — SAHAYA AI";
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(fontLink);
    return () => {
      if (fontLink.parentNode) fontLink.parentNode.removeChild(fontLink);
    };
  }, []);

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name.";
    if (!form.identifier.trim()) {
      next.identifier = role === "officer" ? "Enter your official email." : "Enter your phone number or email.";
    }
    if (role === "officer" && !form.department.trim()) {
      next.department = "Enter your department or district.";
    }
    if (!form.password) {
      next.password = "Create a password.";
    } else if (form.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords don't match.";
    }
    if (!form.agree) {
      next.agree = "You need to accept the terms to continue.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const data = await register(form.fullName, form.identifier, form.password, role);
      if (data && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      navigate(role === "officer" ? "/officer/dashboard" : "/complaint", {
        state: { role, registered: true, name: form.fullName },
      });
    } catch (error) {
      if (!error.response) {
        setErrors({
          submit: "Cannot reach backend server. Please make sure FastAPI backend is running on http://localhost:8000.",
        });
      } else {
        const detail = error.response?.data?.detail;
        let errorMsg = "Unable to create your account. Please try again.";
        if (typeof detail === "string") {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
        }
        setErrors({ submit: errorMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <style>{AUTH_CSS}</style>
      <div className="auth-shell">
        <aside className="auth-side">
          <div className="auth-aurora a1"></div>
          <div className="auth-aurora a2"></div>

          <div className="auth-brand">
            <div className="auth-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21c-4-2.5-7-6-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 7.5-7 10z" />
                <path d="M9 12h1.5l1-2 2 4 1-2H16" />
              </svg>
            </div>
            <div>
              <div className="auth-brand-name">SAHAYA <span>AI</span></div>
              <div className="auth-brand-sub mono">NHAA · 14566</div>
            </div>
          </div>

          <div className="auth-side-body">
            <div className="auth-eyebrow">
              <span className="dot"></span> REAL-TIME STRESS &amp; TRAUMA ASSESSMENT
            </div>
            <h1 className="auth-side-title">
              Set up access <span className="accent">built around consent.</span>
            </h1>
            <p className="auth-side-copy">
              Officers get a role-based, auditable account for case review and routing. Clients get free,
              confidential access — no case number required to begin.
            </p>
          </div>

          <div className="auth-side-foot">
            In an emergency, call the National Helpline Against Atrocities — <b>14566</b>, toll-free, 24×7.
          </div>
        </aside>

        <div className="auth-form-wrap">
          <div className="auth-card">
            <Link className="auth-back" to="/">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>

            <div className="auth-role-toggle">
              <button
                type="button"
                className={`auth-role-btn ${role === "client" ? "active" : ""}`}
                onClick={() => setRole("client")}
              >
                Client
              </button>
              <button
                type="button"
                className={`auth-role-btn ${role === "officer" ? "active" : ""}`}
                onClick={() => setRole("officer")}
              >
                Officer
              </button>
            </div>

            <h2 className="auth-title">
              {role === "officer" ? "Create an officer account" : "Create your account"}
            </h2>
            <p className="auth-subtitle">
              {role === "officer"
                ? "Officer accounts are verified before dashboard access is granted."
                : "Free for victims. Confidential. Takes less than a minute."}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {errors.submit && <div className="field-error">{errors.submit}</div>}
              <div className="field-group">
                <label className="field-label" htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  className="field-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={update("fullName")}
                  autoComplete="name"
                />
                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="identifier">
                  {role === "officer" ? "Official email" : "Phone number or email"}
                </label>
                <input
                  id="identifier"
                  className="field-input"
                  type="text"
                  placeholder={role === "officer" ? "name@dept.gov.in" : "e.g. 98765 43210"}
                  value={form.identifier}
                  onChange={update("identifier")}
                  autoComplete="username"
                />
                {errors.identifier && <div className="field-error">{errors.identifier}</div>}
              </div>

              {role === "officer" && (
                <div className="field-group">
                  <label className="field-label" htmlFor="department">Department / district</label>
                  <input
                    id="department"
                    className="field-input"
                    type="text"
                    placeholder="e.g. District Administration, Guntur"
                    value={form.department}
                    onChange={update("department")}
                  />
                  {errors.department && <div className="field-error">{errors.department}</div>}
                </div>
              )}

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    className="field-input"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={update("password")}
                    autoComplete="new-password"
                  />
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
                  <input
                    id="confirmPassword"
                    className="field-input"
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                </div>
              </div>

              <div className="field-meta-row" style={{ alignItems: "flex-start" }}>
                <label className="checkbox-row">
                  <input type="checkbox" checked={form.agree} onChange={update("agree")} />
                  I understand what's analysed and agree to the Privacy Policy and Terms.
                </label>
              </div>
              {errors.agree && <div className="field-error" style={{ marginTop: "-14px", marginBottom: "18px" }}>{errors.agree}</div>}

              <button type="submit" className="btn-auth-submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : role === "officer" ? "Request officer access" : "Create account"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>

            <div className="auth-divider">
              <span className="line"></span>
              <span className="mono">Already registered</span>
              <span className="line"></span>
            </div>

            <div className="auth-switch">
              Already have an account?{" "}
              <Link className="link-teal" to="/login" state={{ role }}>
                Sign in
              </Link>
            </div>

            <div className="auth-helpline">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
              <span>
                If you or someone you know is in immediate danger, don't wait to register —
                call <b>14566</b> or local emergency services now.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}