import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_CSS = `
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
  html{scroll-behavior:smooth;}
  body{
    margin:0;
    background:var(--paper);
    color:var(--ink);
    font-family:'Inter',sans-serif;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }
  h1,h2,h3,.display{
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
  .wrap{max-width:1180px;margin:0 auto;padding:0 32px;}
  ::selection{background:var(--teal-pale);color:var(--teal-deep);}

  /* subtle grain / ambient background shapes */
  .ambient{
    position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
  }
  .blob{
    position:absolute;border-radius:50%;
    filter:blur(70px);opacity:0.35;
    animation:drift 22s ease-in-out infinite;
  }
  .blob.b1{width:420px;height:420px;background:var(--teal-pale);top:-120px;left:-100px;}
  .blob.b2{width:360px;height:360px;background:var(--amber-pale);bottom:-140px;right:-80px;animation-duration:28s;animation-delay:-6s;}
  .blob.b3{width:260px;height:260px;background:var(--coral-pale);top:40%;right:10%;animation-duration:34s;animation-delay:-12s;}
  @keyframes drift{
    0%,100%{transform:translate(0,0) scale(1);}
    50%{transform:translate(40px,-30px) scale(1.08);}
  }

  /* NAV */
  header{
    position:sticky;top:0;z-index:50;
    background:rgba(24,26,29,0.72);
    backdrop-filter:blur(14px);
    border-bottom:1px solid rgba(255,255,255,0.08);
  }
  header .brand-name{color:#fff;}
  header .brand-sub{color:rgba(255,255,255,0.55);}
  header .nav-links a{color:rgba(255,255,255,0.72);}
  header .nav-links a:hover{color:#fff;}
  header .btn-ghost{border-color:rgba(255,255,255,0.32);color:#fff;}
  header .btn-ghost:hover{border-color:#fff;background:rgba(255,255,255,0.1);color:#fff;}
  nav{
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 32px;max-width:1180px;margin:0 auto;
  }
  .brand{display:flex;align-items:center;gap:12px;}
  .brand-mark{
    width:38px;height:38px;border-radius:10px;
    background:linear-gradient(145deg,var(--teal),var(--teal-deep));
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 14px rgba(107,150,140,0.35);
  }
  .brand-mark svg{width:20px;height:20px;stroke:#fff;}
  .brand-name{font-family:'Fraunces',serif;font-weight:600;font-size:19px;}
  .brand-name span{color:var(--teal);}
  .brand-sub{font-size:10.5px;color:var(--ink-soft);}
  .nav-links{display:flex;gap:30px;align-items:center;}
  .nav-links a{
    font-size:14px;color:var(--ink-soft);position:relative;padding:4px 0;
    transition:color .25s ease;
  }
  .nav-links a:hover{color:var(--ink);}
  .nav-links a::after{
    content:'';position:absolute;left:0;bottom:-2px;width:0;height:2px;background:var(--teal);
    transition:width .25s ease;
  }
  .nav-links a:hover::after{width:100%;}
  .nav-actions{display:flex;gap:12px;align-items:center;}
  .btn{
    font-family:'Inter',sans-serif;font-size:13.5px;font-weight:600;
    padding:10px 20px;border-radius:999px;cursor:pointer;border:1.5px solid transparent;
    display:inline-flex;align-items:center;gap:8px;transition:all .25s ease;
    white-space:nowrap;
  }
  .btn-ghost{border-color:var(--line);color:var(--ink);background:transparent;}
  .btn-ghost:hover{border-color:var(--teal);color:var(--teal-deep);transform:translateY(-1px);}
  .btn-solid{background:var(--teal);color:#fff;box-shadow:0 6px 16px rgba(107,150,140,0.28);}
  .btn-solid:hover{background:var(--teal-deep);transform:translateY(-1px);box-shadow:0 10px 22px rgba(107,150,140,0.36);}
  .btn svg{width:14px;height:14px;transition:transform .25s ease;}
  .btn:hover svg{transform:translateX(3px);}

  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}

  /* CINEMATIC HERO */
  .hero-cine{
    position:relative;z-index:1;overflow:visible;
    background:radial-gradient(120% 100% at 50% 0%, #262A2F 0%, #17191C 60%, #121315 100%);
    padding:110px 0 250px;text-align:center;
  }
  .cine-bg{position:absolute;inset:0;z-index:0;overflow:hidden;}
  .aurora{position:absolute;border-radius:50%;filter:blur(95px);animation:auroraMove ease-in-out infinite;}
  .aurora.a1{width:560px;height:560px;left:-160px;top:-200px;background:radial-gradient(circle,rgba(107,150,140,0.55) 0%,rgba(107,150,140,0) 70%);animation-duration:26s;}
  .aurora.a2{width:520px;height:520px;right:-140px;bottom:-220px;background:radial-gradient(circle,rgba(201,164,104,0.4) 0%,rgba(201,164,104,0) 70%);animation-duration:33s;animation-delay:-8s;}
  .aurora.a3{width:420px;height:420px;right:8%;top:20%;background:radial-gradient(circle,rgba(192,138,123,0.4) 0%,rgba(192,138,123,0) 70%);animation-duration:40s;animation-delay:-15s;}
  @keyframes auroraMove{
    0%,100%{transform:translate(0,0) scale(1);}
    33%{transform:translate(50px,-30px) scale(1.12);}
    66%{transform:translate(-35px,25px) scale(0.92);}
  }
  .cine-sheen{
    position:absolute;top:0;bottom:0;left:-40%;width:40%;
    background:linear-gradient(115deg,transparent 0%,rgba(255,255,255,0.05) 45%,transparent 90%);
    animation:sheen 9s linear infinite;
  }
  @keyframes sheen{0%{transform:translateX(0);}100%{transform:translateX(340%);}}
  .cine-inner{position:relative;z-index:2;max-width:820px;margin:0 auto;}
  .eyebrow-dark{
    display:inline-flex;align-items:center;gap:9px;
    font-size:11px;color:#DCEAE6;background:rgba(255,255,255,0.07);
    border:1px solid rgba(255,255,255,0.14);
    padding:8px 16px;border-radius:999px;margin-bottom:40px;
  }
  .eyebrow-dark .dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite;}
  .cine-title{color:#fff;line-height:0.9;letter-spacing:-0.02em;}
  .cine-title span{display:block;font-size:clamp(42px,7.4vw,94px);}
  .cine-title .l2{color:#AFC9C1;}
  .cine-cta{margin-top:44px;}
  .btn-cine{
    background:#fff;color:#17191C;font-weight:700;font-size:14px;
    padding:17px 36px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;
    box-shadow:0 16px 36px rgba(0,0,0,0.4);transition:transform .3s ease,box-shadow .3s ease;
  }
  .btn-cine:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 20px 44px rgba(0,0,0,0.46);}
  .cine-sub{margin-top:22px;font-size:13.5px;color:rgba(255,255,255,0.55);}

  /* floating preview cards */
  .float-cards{
    position:relative;z-index:3;margin-top:100px;
    display:flex;justify-content:space-between;align-items:flex-end;gap:24px;
  }
  .float-card{width:340px;filter:drop-shadow(0 30px 45px rgba(0,0,0,0.35));}
  .fc-left{animation:bobA 6.5s ease-in-out infinite;}
  .fc-right{width:360px;animation:bobB 7.5s ease-in-out infinite;}
  @keyframes bobA{0%,100%{transform:rotate(-5deg) translateY(38%);}50%{transform:rotate(-5deg) translateY(30%);}}
  @keyframes bobB{0%,100%{transform:rotate(4deg) translateY(52%);}50%{transform:rotate(4deg) translateY(44%);}}
  .mock-card{background:#fff;border-radius:18px;overflow:hidden;border:1px solid var(--line);text-align:left;}
  .mock-top{display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--paper-2);border-bottom:1px solid var(--line);}
  .mock-top .dot{width:8px;height:8px;border-radius:50%;}
  .mock-top .dot.r{background:#D9A0A0;}
  .mock-top .dot.y{background:#E3C98A;}
  .mock-top .dot.g{background:#9DBBA8;}
  .mock-url{margin-left:8px;font-size:10px;color:var(--ink-soft);}
  .mock-body{padding:20px;}
  .mock-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
  .mock-row span{font-size:13.5px;font-weight:600;}
  .mock-tag{font-size:10px;font-weight:700;letter-spacing:0.04em;padding:4px 10px;border-radius:999px;}
  .mock-tag.high{background:var(--coral-pale);color:#8A4A3B;}
  .mock-line{height:8px;border-radius:4px;background:var(--paper-2);margin-bottom:8px;}
  .mock-line.short{width:60%;}
  .mock-stat{display:flex;justify-content:space-between;align-items:center;margin:16px 0;padding:12px 14px;background:var(--paper-2);border-radius:10px;}
  .mock-stat span{font-size:12px;color:var(--ink-soft);}
  .mock-stat b{font-family:'Fraunces',serif;font-size:22px;color:var(--ink);}
  .mock-actions{display:flex;gap:8px;}
  .mock-pill{font-size:11px;background:var(--teal-pale);color:var(--teal-deep);padding:6px 12px;border-radius:999px;}
  @media (max-width:980px){
    .float-cards{flex-direction:column;align-items:center;}
    .fc-left,.fc-right{width:88%;transform:none !important;animation:none;margin:0 auto 24px;}
  }

  /* SVI GAUGE — signature element */
  .gauge-card{
    background:#fff;border:1px solid var(--line);border-radius:22px;
    padding:30px;box-shadow:var(--shadow);
    animation:rise 1s ease both;animation-delay:.2s;
  }
  @keyframes rise{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  .gauge-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
  .gauge-title{font-size:12px;color:var(--ink-soft);}
  .gauge-live{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--coral);}
  .gauge-live .d{width:6px;height:6px;border-radius:50%;background:var(--coral);animation:pulse 1.4s infinite;}
  .gauge-wrap{position:relative;display:flex;justify-content:center;padding:14px 0 6px;}
  .gauge-value{position:absolute;top:66%;left:50%;transform:translate(-50%,-50%);text-align:center;}
  .gauge-value .num{font-family:'Fraunces',serif;font-size:40px;font-weight:600;color:var(--ink);}
  .gauge-value .lbl{font-size:12px;color:var(--ink-soft);margin-top:2px;}
  #needle{transform-origin:150px 150px;transition:transform 1.4s cubic-bezier(.65,0,.35,1);}
  .risk-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:18px;}
  .risk-chip{
    text-align:center;padding:8px 4px;border-radius:10px;font-size:11px;font-weight:600;
    border:1.5px solid var(--line);color:var(--ink-soft);transition:all .3s ease;
  }
  .risk-chip.active{transform:translateY(-2px);}
  .risk-chip[data-r="low"].active{background:#EAF1EA;border-color:#9DBBA8;color:#4A6B4E;}
  .risk-chip[data-r="mod"].active{background:var(--amber-pale);border-color:#D3B579;color:#8C6E36;}
  .risk-chip[data-r="high"].active{background:#F6E7D4;border-color:#CB9868;color:#8F6234;}
  .risk-chip[data-r="crit"].active{background:var(--coral-pale);border-color:#C0897A;color:#8A4A3B;}
  .gauge-foot{margin-top:16px;font-size:12px;color:var(--ink-soft);border-top:1px dashed var(--line);padding-top:14px;}

  /* SECTIONS */
  section{position:relative;z-index:1;padding:100px 0;}
  .section-tag{
    font-size:12px;color:var(--teal-deep);margin-bottom:14px;display:flex;align-items:center;gap:10px;
  }
  .section-tag::before{content:'';width:24px;height:1.5px;background:var(--teal);}
  h2.h-lg{font-size:38px;line-height:1.15;max-width:720px;}
  p.h-sub{font-size:16.5px;color:var(--ink-soft);max-width:640px;margin-top:18px;line-height:1.7;}

  .fade-up{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease;}
  .fade-up.in{opacity:1;transform:translateY(0);}

  /* PROBLEM */
  .problem{background:var(--paper-2);}
  .problem-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;margin-top:48px;}
  .problem-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:18px;}
  .problem-list li{
    display:flex;gap:14px;padding:18px 20px;background:#fff;border-radius:14px;
    border:1px solid var(--line);font-size:14.5px;color:var(--ink-soft);
  }
  .problem-list li b{color:var(--ink);font-weight:600;}
  .problem-list .n{
    font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--teal);
    background:var(--teal-pale);width:26px;height:26px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
  }
  .stat-card{
    background:var(--ink);color:var(--paper);border-radius:20px;padding:34px;
    position:relative;overflow:hidden;
  }
  .stat-card::after{
    content:'';position:absolute;width:220px;height:220px;border-radius:50%;
    background:radial-gradient(circle,rgba(107,150,140,0.4),transparent 70%);
    top:-80px;right:-80px;
  }
  .stat-card h3{font-size:22px;font-weight:500;line-height:1.5;position:relative;}
  .stat-card .q{font-size:44px;font-family:'Fraunces',serif;color:var(--teal-pale);line-height:1;}

  /* CAPABILITIES */
  .cap-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px;}
  .cap-card{
    background:#fff;border:1px solid var(--line);border-radius:18px;padding:28px;
    transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease;
  }
  .cap-card:hover{transform:translateY(-6px);box-shadow:var(--shadow);border-color:var(--teal-pale);}
  .cap-icon{
    width:46px;height:46px;border-radius:12px;background:var(--teal-pale);
    display:flex;align-items:center;justify-content:center;margin-bottom:18px;
    transition:background .35s ease;
  }
  .cap-card:hover .cap-icon{background:var(--teal);}
  .cap-icon svg{width:22px;height:22px;stroke:var(--teal-deep);transition:stroke .35s ease;}
  .cap-card:hover .cap-icon svg{stroke:#fff;}
  .cap-card h3{font-size:18px;margin-bottom:8px;}
  .cap-card p{font-size:14px;color:var(--ink-soft);line-height:1.6;margin:0;}

  /* HOW IT WORKS */
  .how{background:var(--paper-2);}
  .how-track{position:relative;margin-top:60px;}
  .how-line{
    position:absolute;top:24px;left:24px;right:24px;height:2px;
    background:repeating-linear-gradient(90deg,var(--line) 0 8px,transparent 8px 14px);
  }
  .how-steps{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;position:relative;}
  .how-step{display:flex;flex-direction:column;gap:14px;}
  .how-num{
    width:48px;height:48px;border-radius:50%;background:#fff;border:2px solid var(--teal);
    display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;
    color:var(--teal-deep);font-size:14px;position:relative;z-index:2;
  }
  .how-step h4{font-size:14.5px;font-weight:600;margin:0;}
  .how-step p{font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5;}

  /* TECHNOLOGY */
  .tech-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:52px;}
  .tech-card{
    background:#fff;border:1px solid var(--line);border-radius:18px;padding:30px;
    position:relative;overflow:hidden;
  }
  .tech-card .tag{
    font-size:11px;color:var(--teal-deep);background:var(--teal-pale);
    padding:5px 12px;border-radius:999px;display:inline-block;margin-bottom:14px;
  }
  .tech-card h3{font-size:20px;margin-bottom:10px;}
  .tech-card p{font-size:14px;color:var(--ink-soft);line-height:1.65;margin:0 0 16px;}
  .pill-row{display:flex;gap:8px;flex-wrap:wrap;}
  .pill{
    font-family:'IBM Plex Mono',monospace;font-size:11px;padding:6px 12px;
    border-radius:8px;background:var(--paper-2);color:var(--ink-soft);border:1px solid var(--line);
  }
  .bar{height:6px;border-radius:4px;background:var(--paper-2);overflow:hidden;margin-top:14px;}
  .bar-fill{height:100%;background:var(--teal);width:0%;border-radius:4px;transition:width 1.4s ease;}

  /* TRUST */
  .trust{background:var(--ink);color:var(--paper);}
  .trust h2.h-lg{color:#fff;}
  .trust .h-sub{color:#B9C6C6;}
  .trust-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px;}
  .trust-card{
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);
    border-radius:18px;padding:30px;transition:background .3s ease,transform .3s ease;
  }
  .trust-card:hover{background:rgba(255,255,255,0.08);transform:translateY(-4px);}
  .trust-icon{
    width:44px;height:44px;border-radius:12px;background:rgba(107,150,140,0.35);
    display:flex;align-items:center;justify-content:center;margin-bottom:18px;
  }
  .trust-icon svg{width:20px;height:20px;stroke:#AECDC4;}
  .trust-card h3{font-size:17px;color:#fff;margin-bottom:8px;}
  .trust-card p{font-size:13.5px;color:#B9C6C6;line-height:1.6;margin:0;}

  /* STAKEHOLDERS */
  .stake-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:44px;}
  .stake-chip{
    padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:#fff;
    font-size:13px;color:var(--ink-soft);transition:all .3s ease;
  }
  .stake-chip:hover{border-color:var(--teal);color:var(--teal-deep);background:var(--teal-pale);}

  /* CTA */
  .cta{
    background:linear-gradient(135deg,var(--teal-deep),var(--teal));
    border-radius:28px;padding:70px 60px;color:#fff;position:relative;overflow:hidden;
    text-align:center;
  }
  .cta::before{
    content:'';position:absolute;inset:0;
    background:radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 45%);
  }
  .cta h2{font-size:38px;color:#fff;position:relative;}
  .cta p{color:#E7F0EC;font-size:15.5px;max-width:560px;margin:18px auto 34px;position:relative;}
  .cta-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative;}
  .cta .btn-ghost{border-color:rgba(255,255,255,0.5);color:#fff;}
  .cta .btn-ghost:hover{border-color:#fff;background:rgba(255,255,255,0.1);}
  .cta .btn-solid{background:#fff;color:var(--teal-deep);box-shadow:0 10px 24px rgba(0,0,0,0.2);}
  .cta .btn-solid:hover{background:var(--paper);}
  .helpline{margin-top:34px;font-size:13px;color:#E7F0EC;position:relative;}
  .helpline b{font-family:'IBM Plex Mono',monospace;letter-spacing:0.05em;color:#fff;}

  footer{padding:60px 0 34px;border-top:1px solid var(--line);position:relative;z-index:1;}
  .foot-grid{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:24px;}
  .foot-links{display:flex;gap:26px;flex-wrap:wrap;font-size:13px;color:var(--ink-soft);}
  .disclaimer{
    margin-top:30px;padding-top:24px;border-top:1px solid var(--line);
    font-size:12px;color:var(--ink-soft);display:flex;gap:10px;align-items:flex-start;
  }
  .disclaimer svg{width:16px;height:16px;stroke:var(--coral);flex-shrink:0;margin-top:1px;}

  @media (max-width:980px){
    .problem-grid,.cap-grid,.tech-grid,.trust-grid{grid-template-columns:1fr;}
    .how-steps{grid-template-columns:repeat(3,1fr);row-gap:30px;}
    .how-line{display:none;}
    .nav-links{display:none;}
    .hero-cine{padding:90px 0 400px;}
  }
`;

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SAHAYA AI — Real-Time Stress & Trauma Assessment | NHAA 14566";

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(fontLink);

    // scroll reveal
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => fadeObserver.observe(el));

    // animate technology bars when in view
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.w + "%";
            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll(".bar-fill").forEach((el) => barObserver.observe(el));

    // SVI gauge needle cycling demo
    const scenarios = [
      { angle: -70, val: 22, r: "low" },
      { angle: -25, val: 48, r: "mod" },
      { angle: 25, val: 71, r: "high" },
      { angle: 70, val: 91, r: "crit" },
    ];
    let idx = 0;
    const needle = document.getElementById("needle");
    const num = document.getElementById("sviNum");
    const chips = document.querySelectorAll(".risk-chip");

    function setScenario(s) {
      if (needle) needle.style.transform = `rotate(${s.angle}deg)`;
      if (num) num.textContent = String(s.val);
      chips.forEach((c) => c.classList.toggle("active", c.dataset.r === s.r));
    }
    setScenario(scenarios[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % scenarios.length;
      setScenario(scenarios[idx]);
    }, 3200);

    return () => {
      clearInterval(interval);
      fadeObserver.disconnect();
      barObserver.disconnect();
      if (fontLink.parentNode) fontLink.parentNode.removeChild(fontLink);
    };
  }, []);

  // Central place that decides where "Client" / "Officers" buttons go.
  // Login.jsx reads location.state.role to pre-select the right tab.
  const goToLogin = (role) => (e) => {
    e.preventDefault();
    navigate("/login", { state: { role } });
  };

  return (
    <>
      <style>{PAGE_CSS}</style>

      <div className="ambient">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>

      <header>
        <nav>
          <div className="brand">
            <div className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21c-4-2.5-7-6-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 7.5-7 10z" />
                <path d="M9 12h1.5l1-2 2 4 1-2H16" />
              </svg>
            </div>
            <div>
              <div className="brand-name">SAHAYA <span>AI</span></div>
              <div className="brand-sub mono">NHAA · 14566</div>
            </div>
          </div>
          <div className="nav-links">
            <a href="#problem">The Problem</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#how">How It Works</a>
            <a href="#technology">Technology</a>
            <a href="#trust">Privacy</a>
            <a href="#stakeholders">Stakeholders</a>
          </div>
          <div className="nav-actions">
            <a className="btn btn-ghost" href="#client" onClick={goToLogin("client")}>Client</a>
            <a className="btn btn-solid" href="#officers" onClick={goToLogin("officer")}>
              Officers
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </nav>
      </header>

      <section className="hero-cine">
        <div className="cine-bg">
          <div className="aurora a1"></div>
          <div className="aurora a2"></div>
          <div className="aurora a3"></div>
          <div className="cine-sheen"></div>
        </div>

        <div className="cine-inner wrap">
          <div className="eyebrow-dark">
            <span className="dot"></span> REAL-TIME STRESS &amp; TRAUMA ASSESSMENT
          </div>
          <h1 className="cine-title">
            <span className="l1">A voice heard</span>
            <span className="l2">is a life protected</span>
          </h1>
          <div className="cine-cta">
            <a className="btn-cine" href="#officers" onClick={goToLogin("officer")}>
              Officers Portal
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
          <p className="cine-sub">Free for victims. Confidential. No case number required to begin.</p>
        </div>

        <div className="float-cards wrap">
          <div className="float-card fc-left">
            <div className="gauge-card">
              <div className="gauge-head">
                <div className="gauge-title mono">Stress Vulnerability Index</div>
                <div className="gauge-live"><span className="d"></span> LIVE SAMPLE</div>
              </div>
              <div className="gauge-wrap">
                <svg width="300" height="180" viewBox="0 0 300 180">
                  <path d="M30 150 A120 120 0 0 1 270 150" fill="none" stroke="#E9E3D6" strokeWidth="18" strokeLinecap="round" />
                  <path d="M30 150 A120 120 0 0 1 96 43" fill="none" stroke="#9DBBA8" strokeWidth="18" strokeLinecap="round" />
                  <path d="M96 43 A120 120 0 0 1 176 33" fill="none" stroke="#D3B579" strokeWidth="18" strokeLinecap="round" />
                  <path d="M176 33 A120 120 0 0 1 240 76" fill="none" stroke="#CB9868" strokeWidth="18" strokeLinecap="round" />
                  <path d="M240 76 A120 120 0 0 1 270 150" fill="none" stroke="#C0897A" strokeWidth="18" strokeLinecap="round" />
                  <g id="needle">
                    <line x1="150" y1="150" x2="150" y2="48" stroke="#2B2E33" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="150" cy="150" r="7" fill="#2B2E33" />
                  </g>
                </svg>
                <div className="gauge-value">
                  <div className="num" id="sviNum">—</div>
                  <div className="lbl">SVI Score / 100</div>
                </div>
              </div>
              <div className="risk-row">
                <div className="risk-chip" data-r="low">LOW</div>
                <div className="risk-chip" data-r="mod">MODERATE</div>
                <div className="risk-chip" data-r="high">HIGH</div>
                <div className="risk-chip" data-r="crit">CRITICAL</div>
              </div>
            </div>
          </div>

          <div className="float-card fc-right">
            <div className="mock-card">
              <div className="mock-top">
                <span className="dot r"></span>
                <span className="dot y"></span>
                <span className="dot g"></span>
                <span className="mock-url mono">officer.sahaya.ai/cases/4821</span>
              </div>
              <div className="mock-body">
                <div className="mock-row">
                  <span>Case #4821</span>
                  <span className="mock-tag high">HIGH RISK</span>
                </div>
                <div className="mock-line"></div>
                <div className="mock-line short"></div>
                <div className="mock-stat">
                  <span>SVI Score</span>
                  <b>71</b>
                </div>
                <div className="mock-actions">
                  <span className="mock-pill">Counselling</span>
                  <span className="mock-pill">Legal Aid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problem" id="problem">
        <div className="wrap">
          <div className="section-tag mono">The Problem</div>
          <h2 className="h-lg fade-up">Trauma doesn&apos;t announce itself in a call log.</h2>
          <p className="h-sub fade-up">
            Victims and complainants approaching NHAA (14566), the Integrated Portal, chatbot, IVRS or mobile app
            often carry the weight of caste-based discrimination, violence, sexual assault, the loss of family
            members, social boycott, displacement and ongoing threats. Today, there is no standardised way to gauge
            their psychological state at first contact.
          </p>
          <div className="problem-grid">
            <ul className="problem-list fade-up">
              <li>
                <span className="n">01</span>
                <span><b>No baseline assessment</b> exists for psychological condition at the moment a victim first reaches out.</span>
              </li>
              <li>
                <span className="n">02</span>
                <span><b>Distress signals are missed</b> — fear, intimidation, isolation and suicidal ideation can go unnoticed in a short call.</span>
              </li>
              <li>
                <span className="n">03</span>
                <span><b>Support is generic</b> rather than prioritised for those in the most acute crisis.</span>
              </li>
              <li>
                <span className="n">04</span>
                <span><b>Language is a barrier</b> — dialects and regional speech patterns are hard to triage manually at scale.</span>
              </li>
            </ul>
            <div className="stat-card fade-up">
              <div className="q">&ldquo;</div>
              <h3>
                A victim&apos;s tone, pauses and choice of words often carry more truth than the words themselves —
                technology should help us listen better, not replace the listener.
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="capabilities" id="capabilities">
        <div className="wrap">
          <div className="section-tag mono">Capabilities</div>
          <h2 className="h-lg fade-up">Six signals, one clearer picture.</h2>
          <p className="h-sub fade-up">
            SAHAYA AI combines speech analytics, natural language processing and emotion AI to understand distress the
            way a trained counsellor would — consistently, and at the scale a national helpline demands.
          </p>
          <div className="cap-grid">
            <div className="cap-card fade-up">
              <div className="cap-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </div>
              <h3>Voice &amp; Speech Analytics</h3>
              <p>Reads pace, pauses, pitch variation and vocal strain across every call and voice note.</p>
            </div>
            <div className="cap-card fade-up">
              <div className="cap-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>NLP &amp; Emotion AI</h3>
              <p>Interprets textual and spoken narratives for fear, grief, anger and trauma indicators.</p>
            </div>
            <div className="cap-card fade-up">
              <div className="cap-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18M7 15l4-6 3 4 5-8" />
                </svg>
              </div>
              <h3>Stress Vulnerability Index</h3>
              <p>Fuses every signal into a single, explainable SVI score on a consistent scale.</p>
            </div>
            <div className="cap-card fade-up">
              <div className="cap-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
              </div>
              <h3>Risk Categorisation</h3>
              <p>Groups victims into Low, Moderate, High and Critical bands the moment contact begins.</p>
            </div>
            <div className="cap-card fade-up">
              <div className="cap-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                </svg>
              </div>
              <h3>Multilingual Understanding</h3>
              <p>Trained across major Indian languages and regional dialects, not translated after the fact.</p>
            </div>
            <div className="cap-card fade-up">
              <div className="cap-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                </svg>
              </div>
              <h3>Consent-First Routing</h3>
              <p>Recommends counselling, legal aid, medical help, police intervention or protection — always to a person, never in place of one.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap">
          <div className="section-tag mono">How It Works</div>
          <h2 className="h-lg fade-up">From first contact to the right support, in one flow.</h2>
          <div className="how-track">
            <div className="how-line"></div>
            <div className="how-steps">
              <div className="how-step fade-up">
                <div className="how-num">01</div>
                <h4>Contact</h4>
                <p>Victim reaches NHAA 14566, the portal, chatbot, IVRS or app.</p>
              </div>
              <div className="how-step fade-up">
                <div className="how-num">02</div>
                <h4>Capture</h4>
                <p>Voice and text are processed live, with informed consent.</p>
              </div>
              <div className="how-step fade-up">
                <div className="how-num">03</div>
                <h4>Analyse</h4>
                <p>NLP, speech analytics and emotion AI read distress signals.</p>
              </div>
              <div className="how-step fade-up">
                <div className="how-num">04</div>
                <h4>Score</h4>
                <p>A Stress Vulnerability Index is generated on a defined scale.</p>
              </div>
              <div className="how-step fade-up">
                <div className="how-num">05</div>
                <h4>Categorise</h4>
                <p>Victim is placed into Low, Moderate, High or Critical risk.</p>
              </div>
              <div className="how-step fade-up">
                <div className="how-num">06</div>
                <h4>Support</h4>
                <p>Counselling, legal, medical or emergency routing is triggered.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="technology" id="technology">
        <div className="wrap">
          <div className="section-tag mono">Under The Hood</div>
          <h2 className="h-lg fade-up">Built to be explainable, not a black box.</h2>
          <p className="h-sub fade-up">Every score a counsellor sees can be traced back to the signals that produced it.</p>
          <div className="tech-grid">
            <div className="tech-card fade-up">
              <span className="tag mono">Speech Analytics</span>
              <h3>Voice &amp; Prosody Engine</h3>
              <p>Extracts pitch, pace, pauses and vocal tension to flag acute distress and fear in real time.</p>
              <div className="pill-row">
                <span className="pill">MFCC</span>
                <span className="pill">Pitch Tracking</span>
                <span className="pill">Prosody</span>
              </div>
              <div className="bar"><div className="bar-fill" data-w="92"></div></div>
            </div>
            <div className="tech-card fade-up">
              <span className="tag mono">Emotion AI</span>
              <h3>Language &amp; Sentiment Engine</h3>
              <p>Identifies fear, grief, anger and hopelessness across text and transcribed speech.</p>
              <div className="pill-row">
                <span className="pill">NLP</span>
                <span className="pill">Transformer</span>
                <span className="pill">Sentiment</span>
              </div>
              <div className="bar"><div className="bar-fill" data-w="88"></div></div>
            </div>
            <div className="tech-card fade-up">
              <span className="tag mono">Multilingual Layer</span>
              <h3>Indian Language Models</h3>
              <p>Handles code-switching and regional dialects across the languages NHAA callers actually speak.</p>
              <div className="pill-row">
                <span className="pill">Hindi</span>
                <span className="pill">Telugu</span>
                <span className="pill">Tamil</span>
                <span className="pill">+18 more</span>
              </div>
              <div className="bar"><div className="bar-fill" data-w="80"></div></div>
            </div>
            <div className="tech-card fade-up">
              <span className="tag mono">Fusion Layer</span>
              <h3>Weighted SVI Engine</h3>
              <p>Combines every modality into one clinically-informed score, weighted by confidence per signal.</p>
              <div className="pill-row">
                <span className="pill">Weighted Fusion</span>
                <span className="pill">Risk Scoring</span>
              </div>
              <div className="bar"><div className="bar-fill" data-w="95"></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust" id="trust">
        <div className="wrap">
          <div className="section-tag mono" style={{ color: "#AECDC4" }}>Trust &amp; Ethics</div>
          <h2 className="h-lg fade-up">Their story is never our data.</h2>
          <p className="h-sub fade-up">
            Mental health and trauma are deeply personal. SAHAYA AI is designed around informed consent,
            confidentiality and ethical AI standards at every step.
          </p>
          <div className="trust-grid">
            <div className="trust-card fade-up">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>End-to-End Encryption</h3>
              <p>All voice, text and assessment data is encrypted in transit and at rest.</p>
            </div>
            <div className="trust-card fade-up">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3>Informed Consent</h3>
              <p>Victims are told what is analysed and why, before any signal is processed.</p>
            </div>
            <div className="trust-card fade-up">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <path d="M8 4v16M4 9h16" />
                </svg>
              </div>
              <h3>Isolated, Auditable Access</h3>
              <p>Role-based access for counsellors, officers and administrators, fully logged.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="stakeholders">
        <div className="wrap">
          <div className="section-tag mono">Working Together</div>
          <h2 className="h-lg fade-up">One system, many hands.</h2>
          <p className="h-sub fade-up">SAHAYA AI is built to serve the full ecosystem around a victim — from first call to rehabilitation.</p>
          <div className="stake-row fade-up">
            <div className="stake-chip">Dept. of Social Justice &amp; Empowerment</div>
            <div className="stake-chip">National Helpline Against Atrocities (14566)</div>
            <div className="stake-chip">State Governments &amp; UTs</div>
            <div className="stake-chip">District Administrations</div>
            <div className="stake-chip">Counsellors &amp; Mental Health Professionals</div>
            <div className="stake-chip">Law Enforcement Agencies</div>
            <div className="stake-chip">Rehabilitation &amp; Welfare Authorities</div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cta fade-up">
            <h2>Support that recognises distress the moment it&apos;s spoken.</h2>
            <p>Officers can access the case dashboard, review SVI scores and manage routing. Clients can reach support privately and securely.</p>
            <div className="cta-ctas">
              <a className="btn btn-solid" id="officers" href="#" onClick={goToLogin("officer")}>
                Officers Portal
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a className="btn btn-ghost" id="client" href="#" onClick={goToLogin("client")}>Client Access</a>
            </div>
            <div className="helpline">
              In an emergency, call the National Helpline Against Atrocities — <b>14566</b>, toll-free, 24×7.
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="brand" style={{ marginBottom: "8px" }}>
                <div className="brand-mark" style={{ width: "32px", height: "32px" }}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M12 21c-4-2.5-7-6-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 7.5-7 10z" />
                  </svg>
                </div>
                <div>
                  <div className="brand-name" style={{ fontSize: "16px" }}>SAHAYA <span>AI</span></div>
                  <div className="brand-sub mono">Real-Time Stress &amp; Trauma Assessment Module</div>
                </div>
              </div>
            </div>
            <div className="foot-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#client" onClick={goToLogin("client")}>Client</a>
              <a href="#officers" onClick={goToLogin("officer")}>Officers</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div className="disclaimer">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            <span>
              SAHAYA AI is a decision-support tool for NHAA 14566 case workers. It assists, and does not replace,
              professional psychological, medical and legal assessment. If you or someone you know is in immediate
              danger, call 14566 or your local emergency services now.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}