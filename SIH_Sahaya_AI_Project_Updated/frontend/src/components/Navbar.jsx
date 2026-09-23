import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Icon = {
  heart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.8 8.8c0 5.5-8.8 10.7-8.8 10.7S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    </svg>
  ),

  clipboard: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
    </svg>
  ),

  status: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 17V7M10 17v-5M16 17V4M22 17v-9" />
    </svg>
  ),

  support: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v5a2 2 0 0 0 2 2h2v-7H4ZM20 13v5a2 2 0 0 1-2 2h-2v-7h4Z" />
      <path d="M16 20c-1 1-2.4 1.5-4 1.5" />
    </svg>
  ),

  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
};

export default function ClientNavbar() {
  const navigate = useNavigate();

  const navItems = [
    { path: "/complaint", label: "Complaint", icon: Icon.heart },
    { path: "/assessment", label: "Assessment", icon: Icon.clipboard },
    { path: "/status", label: "Status", icon: Icon.status },
    { path: "/support", label: "Support", icon: Icon.support }
  ];

  return (
    <>
      <style>{`
        .sahaya-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(24,26,29,0.96);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sahaya-navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .sahaya-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .sahaya-logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(145deg,#6B968C,#48685F);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(107,150,140,.35);
        }

        .sahaya-logo-mark svg {
          width: 19px;
          height: 19px;
          color: white;
        }

        .sahaya-logo-name {
          color: white;
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 600;
        }

        .sahaya-logo-name span {
          color: #6B968C;
        }

        .sahaya-logo-sub {
          color: rgba(255,255,255,.48);
          font-size: 9px;
          margin-top: 1px;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        .sahaya-nav-links {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sahaya-nav-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border-radius: 10px;
          color: rgba(255,255,255,.62);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all .2s ease;
        }

        .sahaya-nav-link svg {
          width: 15px;
          height: 15px;
        }

        .sahaya-nav-link:hover {
          color: white;
          background: rgba(255,255,255,.07);
        }

        .sahaya-nav-link.active {
          color: #DCEAE6;
          background: rgba(107,150,140,.18);
          box-shadow: inset 0 0 0 1px rgba(107,150,140,.22);
        }

        .sahaya-nav-link.active svg {
          color: #8FB6AB;
        }

        .sahaya-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sahaya-safe {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 999px;
          color: #DCEAE6;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          font-size: 10.5px;
        }

        .sahaya-safe-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6B968C;
        }

        .sahaya-home-btn {
          border: 1px solid rgba(255,255,255,.25);
          background: transparent;
          color: rgba(255,255,255,.75);
          padding: 8px 13px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 11.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sahaya-home-btn:hover {
          color: white;
          border-color: white;
          background: rgba(255,255,255,.08);
        }

        .sahaya-home-btn svg {
          width: 13px;
          height: 13px;
        }

        @media(max-width:900px) {
          .sahaya-navbar-inner {
            padding: 10px 15px;
          }

          .sahaya-logo-sub,
          .sahaya-safe {
            display: none;
          }

          .sahaya-nav-link {
            padding: 8px 9px;
          }

          .sahaya-nav-link span {
            display: none;
          }

          .sahaya-home-btn span {
            display: none;
          }
        }

        @media(max-width:600px) {
          .sahaya-navbar-inner {
            gap: 8px;
          }

          .sahaya-nav-links {
            flex: 1;
            justify-content: flex-end;
          }

          .sahaya-nav-link {
            padding: 8px;
          }
        }
      `}</style>

      <nav className="sahaya-navbar">
        <div className="sahaya-navbar-inner">

          <div className="sahaya-logo" onClick={() => navigate("/complaint")}>
            <div className="sahaya-logo-mark">
              <Icon.heart />
            </div>

            <div>
              <div className="sahaya-logo-name">
                SAHAYA <span>AI</span>
              </div>
              <div className="sahaya-logo-sub">
                confidential client support
              </div>
            </div>
          </div>

          <div className="sahaya-nav-links">
            {navItems.map((item) => {
              const NavIcon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sahaya-nav-link${isActive ? " active" : ""}`
                  }
                >
                  <NavIcon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="sahaya-nav-right">
            <div className="sahaya-safe">
              <span className="sahaya-safe-dot" />
              Private
            </div>

            <button
              className="sahaya-home-btn"
              onClick={() => navigate("/")}
            >
              <Icon.arrow />
              <span>Home</span>
            </button>
          </div>

        </div>
      </nav>
    </>
  );
}