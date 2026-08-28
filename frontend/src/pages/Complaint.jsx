import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { submitAssessment } from "../services/api";

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
    --crimson:#B83A2E;
    --crimson-pale:#FBEBE8;
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

  .csd-app{
    min-height:100vh;
    display:flex;
    flex-direction:column;
    background:var(--paper);
  }

  /* HEADER */
  .csd-header{
    position:sticky;
    top:0;
    z-index:50;
    background:rgba(24,26,29,0.92);
    backdrop-filter:blur(14px);
    border-bottom:1px solid rgba(255,255,255,0.08);
  }

  .csd-header-inner{
    max-width:1280px;
    margin:0 auto;
    padding:12px 24px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
  }

  .csd-brand{
    display:flex;
    align-items:center;
    gap:12px;
  }

  .csd-brand-mark{
    width:36px;
    height:36px;
    border-radius:10px;
    background:linear-gradient(145deg,var(--teal),var(--teal-deep));
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
  }

  .csd-brand-mark svg{
    width:19px;
    height:19px;
    stroke:#fff;
  }

  .csd-brand-name{
    font-family:'Fraunces',serif;
    font-weight:600;
    font-size:17.5px;
    color:#fff;
  }

  .csd-brand-name span{
    color:var(--teal);
  }

  .csd-brand-sub{
    font-size:10px;
    color:rgba(255,255,255,0.55);
  }

  .csd-header-right{
    display:flex;
    align-items:center;
    gap:8px;
    flex-wrap:wrap;
    justify-content:flex-end;
  }

  .csd-privacy-badge{
    display:flex;
    align-items:center;
    gap:7px;
    font-size:11.5px;
    color:#DCEAE6;
    background:rgba(255,255,255,0.07);
    border:1px solid rgba(255,255,255,0.14);
    padding:6px 12px;
    border-radius:999px;
  }

  .csd-privacy-badge svg{
    width:13px;
    height:13px;
    stroke:#AECDC4;
  }

  .csd-exit{
    font-size:12.5px;
    font-weight:600;
    color:rgba(255,255,255,0.8);
    border:1.5px solid rgba(255,255,255,0.22);
    padding:6px 12px;
    border-radius:999px;
    background:transparent;
    cursor:pointer;
    transition:all .2s ease;
    display:flex;
    align-items:center;
    gap:5px;
  }

  .csd-exit:hover{
    border-color:#fff;
    color:#fff;
    background:rgba(255,255,255,0.12);
  }

  .csd-exit svg{
    width:14px;
    height:14px;
  }

  /* SHELL */
  .csd-shell{
    flex:1;
    max-width:1280px;
    margin:0 auto;
    width:100%;
    padding:20px 24px 0;
    display:grid;
    grid-template-columns:320px 1fr;
    gap:20px;
    align-items:start;
  }

  /* SIDEBAR */
  .csd-sidebar{
    display:flex;
    flex-direction:column;
    gap:14px;
    position:sticky;
    top:74px;
    max-height:calc(100vh - 90px);
    overflow-y:auto;
    padding-right:4px;
  }

  .csd-sidebar::-webkit-scrollbar{
    width:4px;
  }
  .csd-sidebar::-webkit-scrollbar-thumb{
    background:var(--line);
    border-radius:4px;
  }

  .csd-card{
    background:#fff;
    border:1px solid var(--line);
    border-radius:18px;
    padding:18px;
    box-shadow:var(--shadow);
  }

  .csd-card-title{
    font-size:11px;
    color:var(--ink-soft);
    margin-bottom:12px;
    display:flex;
    align-items:center;
    justify-content:space-between;
  }

  .csd-live{
    display:flex;
    align-items:center;
    gap:6px;
    font-size:10.5px;
    color:var(--teal-deep);
  }

  .csd-live .d{
    width:6px;
    height:6px;
    border-radius:50%;
    background:var(--teal);
    animation:pulse 2s infinite;
  }

  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}

  .csd-gauge-wrap{
    position:relative;
    display:flex;
    justify-content:center;
    padding:4px 0 0;
  }

  .csd-gauge-value{
    position:absolute;
    top:64%;
    left:50%;
    transform:translate(-50%,-50%);
    text-align:center;
  }

  .csd-gauge-value .num{
    font-family:'Fraunces',serif;
    font-size:32px;
    font-weight:600;
    color:var(--ink);
    line-height:1;
  }

  .csd-gauge-value .lbl{
    font-size:10px;
    color:var(--ink-soft);
    margin-top:3px;
    font-weight:600;
  }

  .csd-risk-row{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:6px;
    margin-top:14px;
  }

  .csd-risk-chip{
    text-align:center;
    padding:6px 2px;
    border-radius:9px;
    font-size:9.5px;
    font-weight:700;
    border:1.5px solid var(--line);
    color:var(--ink-soft);
    transition:all .2s ease;
  }

  .csd-risk-chip[data-r="low"].active{
    background:#EAF1EA;
    border-color:#9DBBA8;
    color:#4A6B4E;
  }

  .csd-risk-chip[data-r="mod"].active{
    background:var(--amber-pale);
    border-color:#D3B579;
    color:#8C6E36;
  }

  .csd-risk-chip[data-r="high"].active{
    background:#F6E7D4;
    border-color:#CB9868;
    color:#8F6234;
  }

  .csd-risk-chip[data-r="crit"].active{
    background:var(--coral-pale);
    border-color:#C0897A;
    color:#8A4A3B;
  }

  /* EMOTION CARD STYLING */
  .csd-emotion-hero{
    display:flex;
    align-items:center;
    gap:10px;
    background:var(--paper-2);
    border:1.5px solid var(--line);
    border-radius:14px;
    padding:12px 14px;
    margin-bottom:12px;
    transition:all .3s ease;
  }

  .csd-emotion-hero.fear{
    background:var(--crimson-pale);
    border-color:#E2ABA3;
  }

  .csd-emotion-hero.distress{
    background:var(--coral-pale);
    border-color:#D9A594;
  }

  .csd-emotion-hero.sadness{
    background:var(--amber-pale);
    border-color:#D3B579;
  }

  .csd-emotion-hero.neutral{
    background:var(--teal-pale);
    border-color:#BFDBD1;
  }

  .csd-emotion-icon{
    width:34px;
    height:34px;
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:18px;
    flex-shrink:0;
    background:#fff;
  }

  .csd-emotion-text{
    flex:1;
  }

  .csd-emotion-title{
    font-size:13px;
    font-weight:700;
    color:var(--ink);
  }

  .csd-emotion-sub{
    font-size:10.5px;
    color:var(--ink-soft);
    margin-top:2px;
  }

  .csd-emotion-bars{
    display:flex;
    flex-direction:column;
    gap:7px;
    margin-top:10px;
  }

  .csd-emotion-bar-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    font-size:11px;
    gap:8px;
  }

  .csd-emotion-bar-label{
    width:70px;
    color:var(--ink-soft);
    font-weight:600;
  }

  .csd-emotion-bar-track{
    flex:1;
    height:6px;
    background:var(--paper-2);
    border-radius:999px;
    overflow:hidden;
  }

  .csd-emotion-bar-fill{
    height:100%;
    border-radius:999px;
    transition:width 0.4s ease;
  }

  .csd-emotion-bar-pct{
    width:32px;
    text-align:right;
    font-size:10px;
    color:var(--ink);
    font-weight:700;
  }

  .csd-prosody-tag{
    margin-top:10px;
    padding:6px 10px;
    background:var(--paper-2);
    border-radius:8px;
    font-size:10px;
    color:var(--ink-soft);
    display:flex;
    align-items:center;
    gap:6px;
  }

  .csd-prosody-tag span{
    font-weight:700;
    color:var(--ink);
  }

  .csd-lang-row{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
  }

  .csd-lang-chip{
    font-size:11.5px;
    padding:5px 12px;
    border-radius:999px;
    border:1.5px solid var(--line);
    color:var(--ink-soft);
    cursor:pointer;
    background:#fff;
    transition:all .2s ease;
  }

  .csd-lang-chip:hover{
    border-color:var(--teal);
  }

  .csd-lang-chip.active{
    background:var(--teal-deep);
    border-color:var(--teal-deep);
    color:#fff;
    font-weight:600;
  }

  .csd-quick-list{
    display:flex;
    flex-direction:column;
    gap:7px;
  }

  .csd-quick-btn{
    display:flex;
    align-items:center;
    gap:10px;
    text-align:left;
    font-size:12px;
    color:var(--ink);
    background:var(--paper-2);
    border:1px solid var(--line);
    border-radius:12px;
    padding:9px 12px;
    cursor:pointer;
    transition:all .2s ease;
  }

  .csd-quick-btn:hover:not(:disabled){
    background:#fff;
    border-color:var(--teal);
    transform:translateX(2px);
  }

  .csd-quick-btn svg{
    width:15px;
    height:15px;
    stroke:var(--teal-deep);
    flex-shrink:0;
  }

  .csd-helpline-card{
    background:radial-gradient(120% 120% at 0% 0%, #2A2E33 0%, #181A1D 100%);
    color:#fff;
    border:none;
  }

  .csd-helpline-card .csd-card-title{
    color:#B9C6C6;
  }

  .csd-helpline-num{
    font-family:'IBM Plex Mono',monospace;
    font-size:26px;
    font-weight:600;
    margin:2px 0 10px;
    color:#fff;
  }

  .csd-helpline-call{
    width:100%;
    background:#fff;
    color:var(--ink);
    font-weight:700;
    font-size:13px;
    padding:10px;
    border-radius:999px;
    border:none;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:7px;
    transition:all .2s ease;
  }

  .csd-helpline-call:hover{
    background:var(--teal-pale);
    color:var(--teal-deep);
  }

  .csd-helpline-note{
    font-size:11px;
    color:rgba(255,255,255,0.6);
    margin-top:8px;
    line-height:1.45;
  }

  .csd-reco-list{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
  }

  .csd-reco-pill{
    font-size:10.5px;
    background:var(--teal-pale);
    color:var(--teal-deep);
    padding:4px 10px;
    border-radius:999px;
    font-weight:600;
    border:1px solid #BFDBD1;
  }

  .csd-reco-empty{
    font-size:11.5px;
    color:var(--ink-soft);
    line-height:1.5;
    margin:0;
  }

  /* MAIN CHAT AREA */
  .csd-main{
    display:flex;
    flex-direction:column;
    height:calc(100vh - 100px);
    background:#fff;
    border:1px solid var(--line);
    border-radius:20px;
    box-shadow:var(--shadow);
    overflow:hidden;
  }

  .csd-chat-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:14px 20px;
    border-bottom:1px solid var(--line);
    background:var(--paper-2);
  }

  .csd-chat-head-left{
    display:flex;
    align-items:center;
    gap:12px;
  }

  .csd-bot-avatar{
    width:36px;
    height:36px;
    border-radius:10px;
    background:linear-gradient(145deg,var(--teal),var(--teal-deep));
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .csd-bot-avatar svg{
    width:18px;
    height:18px;
    stroke:#fff;
  }

  .csd-chat-head h3{
    font-size:15px;
    margin:0;
  }

  .csd-chat-head p{
    font-size:11.5px;
    color:var(--ink-soft);
    margin:2px 0 0;
  }

  .csd-consent-pill{
    font-size:10.5px;
    display:flex;
    align-items:center;
    gap:5px;
    color:var(--teal-deep);
    background:var(--teal-pale);
    padding:5px 11px;
    border-radius:999px;
    border:1px solid #BFDBD1;
  }

  .csd-consent-pill svg{
    width:12px;
    height:12px;
    stroke:var(--teal-deep);
  }

  .csd-chat-scroll{
    flex:1;
    overflow-y:auto;
    padding:20px;
    display:flex;
    flex-direction:column;
    gap:14px;
  }

  .csd-msg-row{
    display:flex;
    gap:10px;
    max-width:82%;
  }

  .csd-msg-row.bot{
    align-self:flex-start;
  }

  .csd-msg-row.user{
    align-self:flex-end;
    flex-direction:row-reverse;
  }

  .csd-msg-avatar{
    width:30px;
    height:30px;
    border-radius:8px;
    flex-shrink:0;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:11px;
    font-weight:700;
  }

  .csd-msg-row.bot .csd-msg-avatar{
    background:var(--teal-pale);
    color:var(--teal-deep);
  }

  .csd-msg-row.user .csd-msg-avatar{
    background:var(--ink);
    color:#fff;
  }

  .csd-msg-bubble{
    border-radius:16px;
    padding:11px 15px;
    font-size:13.5px;
    line-height:1.6;
    word-break:break-word;
  }

  .csd-msg-row.bot .csd-msg-bubble{
    background:var(--paper-2);
    color:var(--ink);
    border-top-left-radius:4px;
    border:1px solid var(--line);
  }

  .csd-msg-row.user .csd-msg-bubble{
    background:var(--teal-deep);
    color:#fff;
    border-top-right-radius:4px;
  }

  .csd-msg-meta{
    display:flex;
    align-items:center;
    gap:8px;
    margin-top:4px;
  }

  .csd-msg-time{
    font-size:10px;
    color:var(--ink-soft);
  }

  .csd-msg-emotion-tag{
    font-size:9.5px;
    padding:2px 8px;
    border-radius:999px;
    background:var(--paper-2);
    border:1px solid var(--line);
    color:var(--ink-soft);
    font-weight:600;
  }

  .csd-speak-btn{
    background:none;
    border:none;
    cursor:pointer;
    padding:2px;
    color:var(--ink-soft);
    display:flex;
    align-items:center;
  }

  .csd-speak-btn:hover{
    color:var(--ink);
  }

  .csd-typing{
    display:flex;
    gap:4px;
    align-items:center;
    padding:11px 15px;
    background:var(--paper-2);
    border-radius:16px;
    border:1px solid var(--line);
  }

  .csd-typing span{
    width:6px;
    height:6px;
    border-radius:50%;
    background:var(--teal-deep);
    animation:pulse 1s infinite alternate;
  }

  .csd-crisis-card{
    background:var(--coral-pale);
    border:1.5px solid #D9A594;
    border-radius:16px;
    padding:15px 18px;
    margin:6px 0;
  }

  .csd-crisis-title{
    font-size:14px;
    font-weight:700;
    color:#8A4A3B;
    display:flex;
    align-items:center;
    gap:8px;
    margin-bottom:6px;
  }

  .csd-crisis-title svg{
    width:16px;
    height:16px;
    stroke:#8A4A3B;
  }

  .csd-crisis-text{
    font-size:12.5px;
    color:#6E3529;
    line-height:1.5;
    margin-bottom:12px;
  }

  .csd-crisis-actions{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
  }

  .csd-crisis-call{
    background:#8A4A3B;
    color:#fff;
    border:none;
    padding:8px 16px;
    border-radius:999px;
    font-weight:700;
    font-size:12px;
    cursor:pointer;
    display:flex;
    align-items:center;
    gap:6px;
  }

  .csd-crisis-secondary{
    background:#fff;
    color:#8A4A3B;
    border:1px solid #C0897A;
    padding:8px 14px;
    border-radius:999px;
    font-size:12px;
    font-weight:600;
    cursor:pointer;
  }

  .csd-quick-chips{
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    padding:0 20px 12px;
  }

  .csd-chip-btn{
    font-size:12px;
    color:var(--teal-deep);
    background:var(--teal-pale);
    border:1px solid #BFDBD1;
    padding:6px 14px;
    border-radius:999px;
    cursor:pointer;
    transition:all .2s ease;
  }

  .csd-chip-btn:hover{
    background:#fff;
    border-color:var(--teal-deep);
  }

  .csd-composer{
    border-top:1px solid var(--line);
    padding:12px 18px;
    display:flex;
    align-items:center;
    gap:10px;
    background:#fff;
  }

  .csd-input-wrap{
    flex:1;
    display:flex;
    align-items:center;
    background:var(--paper-2);
    border:1.5px solid var(--line);
    border-radius:14px;
    padding:4px 8px 4px 14px;
    transition:border-color .2s ease;
  }

  .csd-input-wrap:focus-within{
    border-color:var(--teal);
  }

  .csd-input{
    flex:1;
    border:none;
    background:transparent;
    outline:none;
    font-family:'Inter',sans-serif;
    font-size:13.5px;
    color:var(--ink);
    padding:6px 0;
  }

  .csd-waveform{
    display:flex;
    align-items:center;
    gap:2px;
    margin-right:8px;
  }

  .csd-waveform span{
    width:3px;
    height:14px;
    background:var(--coral);
    border-radius:2px;
    animation:pulse 0.6s infinite alternate;
  }

  .csd-mic-btn{
    width:34px;
    height:34px;
    border-radius:10px;
    border:none;
    background:transparent;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    color:var(--ink-soft);
    transition:all .2s ease;
  }

  .csd-mic-btn:hover:not(:disabled){
    background:var(--paper);
    color:var(--ink);
  }

  .csd-mic-btn.listening{
    background:#F3E4DE;
    color:#C08A7B;
    animation:pulse 1s infinite;
  }

  .csd-send-btn{
    width:40px;
    height:40px;
    border-radius:12px;
    border:none;
    background:var(--teal);
    color:#fff;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:all .2s ease;
  }

  .csd-send-btn:hover:not(:disabled){
    background:var(--teal-deep);
    transform:translateY(-1px);
  }

  .csd-send-btn:disabled{
    opacity:0.45;
    cursor:not-allowed;
  }

  .csd-consent-gate{
    align-self:center;
    max-width:500px;
    background:var(--paper-2);
    border:1px solid var(--line);
    border-radius:16px;
    padding:20px 22px;
    text-align:center;
    margin:20px auto;
  }

  .csd-consent-gate h4{
    margin:0 0 8px;
    font-size:16px;
  }

  .csd-consent-gate p{
    font-size:12.5px;
    color:var(--ink-soft);
    line-height:1.6;
    margin:0 0 16px;
  }

  .csd-consent-accept{
    background:var(--teal);
    color:#fff;
    font-weight:700;
    font-size:12.5px;
    padding:9px 20px;
    border-radius:999px;
    border:none;
    cursor:pointer;
    transition:all .2s ease;
  }

  .csd-consent-accept:hover{
    background:var(--teal-deep);
  }

  @media (max-width:960px){
    .csd-shell{
      grid-template-columns:1fr;
      padding:14px 16px 0;
    }
    .csd-sidebar{
      position:static;
      flex-direction:row;
      flex-wrap:wrap;
    }
    .csd-sidebar .csd-card{
      flex:1 1 220px;
    }
    .csd-main{
      height:calc(100vh - 220px);
    }
    .csd-msg-row{
      max-width:92%;
    }
  }
`;

const LANGUAGES = ["English", "हिन्दी", "తెలుగు", "தமிழ்", "मराठी", "ಕನ್ನಡ"];

const I18N = {
  English: {
    welcome: "I'm Sahaya. I'm here to listen, at whatever pace works for you. You can type, or press the microphone to speak instead — nothing is shared beyond this conversation without your say-so.",
    quick_actions: [
      { key: "counsellor", label: "Talk to a counsellor", icon: "chat" },
      { key: "legal", label: "Understand my legal options", icon: "scale" },
      { key: "unsafe", label: "I don't feel safe right now", icon: "shield" },
      { key: "unsure", label: "I'm not sure where to start", icon: "compass" },
    ],
    templates: {
      counsellor: "I can arrange a callback from a counsellor who works with cases like yours. Would you prefer a call today, or would you rather write to me a bit more first?",
      legal: "I can walk you through what usually happens next — filing a complaint, what protection is available under the SC/ST PoA Act, and what to expect. Would you like that in simple steps?",
      unsafe: "Thank you for telling me that directly. Your safety comes first. Can you tell me, in a word or two, whether you're safe at this exact moment?",
      unsure: "That's alright — most people who reach out feel this way at first. We can go one small step at a time. Would it help if I asked a few gentle questions to understand your situation?",
    },
    crisis_reply: "I'm really glad you told me. What you're feeling matters, and you don't have to carry it alone. I'd like to connect you with someone right now — is that okay?",
    high_reply: "I hear how hard this has been for you. What you've shared sounds serious, and I want to make sure you get real support quickly — I'm noting this as higher priority for a counsellor to reach out.",
    mod_reply: "Thank you for sharing that with me. It sounds like this has been weighing on you. Would you like me to note this for a counsellor to follow up, or would you like to talk a bit more first?",
    low_reply: "I'm here, and I'm listening. Take whatever time you need — there's no wrong way to say this.",
    greeting_reply: "Hello! I'm here and listening. Please tell me what happened or how I can support you today.",
    banner_title: "You don't have to face this alone",
    banner_desc: "What you've shared matters, and immediate, real support is available right now — the helpline is staffed 24×7 by people trained for exactly this.",
    banner_call: "Call 14566 now",
    banner_callback: "Request a callback instead",
    placeholder: "Type here, or use the microphone...",
    sidebar_svi: "Stress Vulnerability Index",
    sidebar_emotion: "Emotion AI & Sentiment",
    sidebar_support: "Recommended support",
    sidebar_lang: "Language",
    sidebar_quick: "Quick start",
    sidebar_helpline: "National helpline",
    sidebar_helpline_note: "Toll-free, 24×7. Available any time, even if you never send another message here.",
    reco_empty: "Nothing to flag yet — this updates as we talk.",
  },
  "తెలుగు": {
    welcome: "నేను సహాయాని. మీ బాధను వినడానికి నేను ఇక్కడ ఉన్నాను. మీరు ఇక్కడ టైప్ చేయవచ్చు లేదా మాట్లాడటానికి మైక్రోఫోన్ ఉపయోగించవచ్చు — మీ అనుమతి లేకుండా ఏదీ బయటకు వెల్లడించబడదు.",
    quick_actions: [
      { key: "counsellor", label: "కౌన్సెలర్‌తో మాట్లాడండి", icon: "chat" },
      { key: "legal", label: "నా న్యాయపరమైన హక్కులు తెలుసుకోండి", icon: "scale" },
      { key: "unsafe", label: "ప్రస్తుతం నాకు రక్షణ లేదు / భయంగా ఉంది", icon: "shield" },
      { key: "unsure", label: "ఎక్కడ ప్రారంభించాలో అర్థం కావడం లేదు", icon: "compass" },
    ],
    templates: {
      counsellor: "మీలాంటి బాధితులకు సహాయం చేసే మానసిక నిపుణుడితో నేను మాట్లాడించగలను. మీకు ఈరోజే కాల్ కావాలా లేక ఇక్కడ మరింత సమాచారం పంచుకుంటారా?",
      legal: "ఫిర్యాదు దాఖలు చేయడం, రక్షణ కల్పించడం మరియు SC/ST చట్టం కింద లభించే పరిహారం గురించి నేను మీకు సులభంగా వివరిస్తాను. తెలుసుకోవాలనుకుంటున్నారా?",
      unsafe: "నాకు నేరుగా చెప్పినందుకు ధన్యవాదాలు. మీ భద్రతే మా మొదటి ప్రాధాన్యత. ప్రస్తుతం మీరు సురక్షిత ప్రదేశంలో ఉన్నారా?",
      unsure: "పర్వాలేదు — చాలామందికి మొదట అలాగే అనిపిస్తుంది. మీ పరిస్థితిని అర్థం చేసుకోవడానికి నేను కొన్ని సాధారణ ప్రశ్నలు అడగవచ్చా?",
    },
    crisis_reply: "మీ బాధను నాతో పంచుకున్నందుకు ధన్యవాదాలు. మీరు ఒంటరిగా ఈ కష్టాన్ని భరించాల్సిన అవసరం లేదు. తక్షణ సహాయం కోసం మిమ్మల్ని హెల్ప్‌లైన్ అధికారితో కనెక్ట్ చేయనా?",
    high_reply: "మీరు చెప్పింది చాలా తీవ్రమైనది. మీకు తక్షణ సహాయం అందించడానికి నేను దీన్ని అధిక ప్రాధాన్యతగా నమోదు చేస్తున్నాను.",
    mod_reply: "మీరు చెప్పినదానికి ధన్యవాదాలు. ఈ విషయం మీపై చాలా ఒత్తిడి తెస్తున్నట్లుంది. కౌన్సెలర్ సంప్రదించేలా నమోదు చేయనా?",
    low_reply: "నేను మీ మాటలను శ్రద్ధగా వింటున్నాను. నిదానంగా మీ వివరాలను తెలపండి.",
    greeting_reply: "నమస్కారం! నేను వింటున్నాను. మీకు ఏ విధంగా సహాయం చేయగలను? మీ పరిస్థితిని లేదా వివరాలను ఇక్కడ చెప్పవచ్చు.",
    banner_title: "మీరు ఒంటరిగా బాధపడాల్సిన అవసరం లేదు",
    banner_desc: "మీ సమస్య చాలా ముఖ్యమైనది. తక్షణ మానసిక & న్యాయ సహాయం కోసం జాతీయ అట్రాసిటీ హెల్ప్‌లైన్ 14566 ఎల్లప్పుడూ 24×7 సిద్ధంగా ఉంది.",
    banner_call: "ఇప్పుడే 14566 కి కాల్ చేయండి",
    banner_callback: "కాల్‌బ్యాక్ అభ్యర్థించండి",
    placeholder: "ఇక్కడ టైప్ చేయండి లేదా మాట్లాడటానికి మైక్ నొక్కండి...",
    sidebar_svi: "ఒత్తిడి & దుర్బలత్వ సూచిక (SVI)",
    sidebar_emotion: "ఎమోషన్ AI & మనోభావాలు",
    sidebar_support: "సిఫార్సు చేయబడిన సహాయం",
    sidebar_lang: "భాష (Language)",
    sidebar_quick: "త్వరిత ప్రారంభం",
    sidebar_helpline: "జాతీయ హెల్ప్‌లైన్",
    sidebar_helpline_note: "ఉచితం, 24×7. ఎప్పుడైనా సంప్రదించవచ్చు.",
    reco_empty: "ఇంకా ఏమీ గుర్తించలేదు — సంభాషణ సాగుతున్న కొద్దీ ఇది అప్‌డేట్ అవుతుంది.",
  },
  "हिन्दी": {
    welcome: "मैं सहाय हूँ। मैं आपकी बात सुनने के लिए यहाँ हूँ। आप लिख सकते हैं या बोलने के लिए माइक दबा सकते हैं — आपकी सहमति के बिना कुछ भी साझा नहीं किया जाएगा।",
    quick_actions: [
      { key: "counsellor", label: "परामर्शदाता (Counsellor) से बात करें", icon: "chat" },
      { key: "legal", label: "कानूनी विकल्प व सहायता समझें", icon: "scale" },
      { key: "unsafe", label: "मुझे अभी सुरक्षित महसूस नहीं हो रहा", icon: "shield" },
      { key: "unsure", label: "कहाँ से शुरू करूँ, समझ नहीं आ रहा", icon: "compass" },
    ],
    templates: {
      counsellor: "मैं एक परामर्शदाता से आपकी बात करवा सकता हूँ। क्या आप आज ही बात करना चाहेंगे या पहले यहाँ कुछ और बताना चाहेंगे?",
      legal: "शिकायत दर्ज करना, सुरक्षा प्राप्त करना और SC/ST अत्याचार निवारण अधिनियम के तहत कानूनी अधिकारों की प्रक्रिया मैं आपको सरलता से समझा सकता हूँ।",
      unsafe: "सीधे बताने के लिए धन्यवाद। आपकी सुरक्षा सबसे महत्वपूर्ण है। क्या आप अभी सुरक्षित स्थान पर हैं?",
      unsure: "कोई बात नहीं — कई लोगों को शुरू में ऐसा ही लगता है। क्या स्थिति समझने के लिए मैं आपसे कुछ सरल सवाल पूछ सकता हूँ?",
    },
    crisis_reply: "अपनी बात साझा करने के लिए धन्यवाद। आपको अकेले यह सब सहने की जरूरत नहीं है। क्या मैं तुरंत आपको राष्ट्रीय सहायता टीम से जोड़ूँ?",
    high_reply: "आपने जो बताया वह गंभीर है। हम आपको त्वरित सहायता प्रदान करने के लिए इसे उच्च प्राथमिकता में दर्ज कर रहे हैं।",
    mod_reply: "जानकारी साझा करने के लिए धन्यवाद। ऐसा लगता है कि यह आप पर भारी पड़ रहा है। क्या आप परामर्शदाता से संपर्क चाहते हैं?",
    low_reply: "मैं आपकी बात ध्यान से सुन रहा हूँ। आप अपनी गति से बात साझा कर सकते हैं।",
    greeting_reply: "नमस्ते! मैं आपकी बात सुनने के लिए तैयार हूँ। आप अपनी समस्या, घटना या सवाल यहाँ साझा कर सकते हैं।",
    banner_title: "आपको अकेले इसका सामना करने की जरूरत नहीं है",
    banner_desc: "आपकी सुरक्षा और बात हमारे लिए महत्वपूर्ण है। राष्ट्रीय अत्याचार निवारण हेल्पलाइन 14566 पर 24×7 प्रशिक्षित परामर्शदाता उपलब्ध हैं।",
    banner_call: "अभी 14566 पर कॉल करें",
    banner_callback: "कॉलबैक का अनुरोध करें",
    placeholder: "यहाँ लिखें या बोलने के लिए माइक का उपयोग करें...",
    sidebar_svi: "तनाव व आघात सूचकांक (SVI)",
    sidebar_emotion: "इमोशन AI और मनोभाव",
    sidebar_support: "अनुशंसित सहायता",
    sidebar_lang: "भाषा (Language)",
    sidebar_quick: "त्वरित सहायता",
    sidebar_helpline: "राष्ट्रीय हेल्पलाइन",
    sidebar_helpline_note: "टोल-फ्री, 24×7। किसी भी समय उपलब्ध।",
    reco_empty: "अभी कोई विशेष संकेत नहीं — बातचीत के साथ यह अपडेट होगा।",
  },
  "தமிழ்": {
    welcome: "நான் சகாயா. உங்கள் துயரத்தைக் கேட்க நான் இங்கு இருக்கிறேன். நீங்கள் தட்டச்சு செய்யலாம் அல்லது பேச மைக்ரோஃபோனை அழுத்தலாம்.",
    quick_actions: [
      { key: "counsellor", label: "ஆலோசகருடன் பேசுங்கள்", icon: "chat" },
      { key: "legal", label: "சட்ட உரிமைகளைப் புரிந்து கொள்ளுங்கள்", icon: "scale" },
      { key: "unsafe", label: "எனக்கு இப்போது பாதுகாப்பு இல்லை", icon: "shield" },
      { key: "unsure", label: "எங்கு தொடங்குவது என்று தெரியவில்லை", icon: "compass" },
    ],
    templates: {
      counsellor: "உங்களுக்கு உதவ ஒரு ஆலோசகரை ஏற்பாடு செய்ய முடியும். நீங்கள் இப்போது பேச விரும்புகிறீர்களா?",
      legal: "புகார் அளிப்பது, பாதுகாப்பு மற்றும் சட்ட உரிமைகள் பற்றி நான் எளிதாக விளக்குகிறேன்.",
      unsafe: "உங்கள் பாதுகாப்புதான் முதன்மையானது. தற்போது நீங்கள் பாதுகாப்பான இடத்தில் இருக்கிறீர்களா?",
      unsure: "பரவாயில்லை — உங்கள் நிலையைப் புரிந்து கொள்ள சில எளிய கேள்விகளைக் கேட்கலாமா?",
    },
    crisis_reply: "உங்களின் பகிர்வுக்கு நன்றி. நீங்கள் தனியாக கஷ்டப்பட வேண்டியதில்லை. உடனடி உதவிக்கு உங்களை இணைக்கவா?",
    high_reply: "நீங்கள் பகிர்ந்தது தீவிரமானது. உடனடி உதவிக்காக இதை உயர் முன்னுரிமையில் பதிவு செய்கிறேன்.",
    mod_reply: "பகிர்ந்தமைக்கு நன்றி. ஒரு ஆலோசகர் தொடர்பு கொள்ள பதிவு செய்யவா?",
    low_reply: "நான் உங்கள் பேச்சைக் கவனமாகக் கேட்கிறேன். நிதானமாகப் பகிருங்கள்.",
    greeting_reply: "வணக்கம்! நான் கேட்கிறேன். உங்களுக்கு எப்படி உதவ வேண்டும் அல்லது என்ன நடந்தது என்று தயங்காமல் கூறுங்கள்.",
    banner_title: "நீங்கள் இதை தனியாக எதிர்கொள்ள வேண்டியதில்லை",
    banner_desc: "தேசிய உதவி எண் 14566 மூலம் உடனடி உதவி 24×7 இலவசமாக கிடைக்கிறது.",
    banner_call: "14566 ஐ அழைக்கவும்",
    banner_callback: "திரும்ப அழைக்கக் கோருங்கள்",
    placeholder: "இங்கே தட்டச்சு செய்யவும் அல்லது மைக்ரோஃபோனைப் பயன்படுத்தவும்...",
    sidebar_svi: "மன அழுத்தக் குறியீடு (SVI)",
    sidebar_emotion: "உணர்ச்சி AI (Emotion AI)",
    sidebar_support: "பரிந்துரைக்கப்பட்ட ஆதரவு",
    sidebar_lang: "மொழி (Language)",
    sidebar_quick: "விரைவுத் தொடக்கம்",
    sidebar_helpline: "தேசிய உதவி எண்",
    sidebar_helpline_note: "இலவசம், 24×7.",
    reco_empty: "இன்னும் எதுவும் கொடியிடப்படவில்லை — பேசும்போது புதுப்பிக்கப்படும்.",
  },
  "मराठी": {
    welcome: "मी सहाय आहे. तुमचे म्हणणे ऐकण्यासाठी मी येथे आहे. तुम्ही लिहू शकता किंवा बोलण्यासाठी माइक वापरू शकता.",
    quick_actions: [
      { key: "counsellor", label: "सल्लागाराशी बोला", icon: "chat" },
      { key: "legal", label: "कायदेशीर पर्याय जाणून घ्या", icon: "scale" },
      { key: "unsafe", label: "मला सध्या सुरक्षित वाटत नाही", icon: "shield" },
      { key: "unsure", label: "कुठून सुरुवात करावी ते समजत नाही", icon: "compass" },
    ],
    templates: {
      counsellor: "मी सल्लागाराशी तुमचे बोलणे करून देऊ शकतो. तुम्हाला आजच बोलायचे आहे का?",
      legal: "तक्रार दाखल करणे, संरक्षण आणि कायदेशीर अधिकारांची माहिती मी सोप्या भाषेत देऊ शकतो.",
      unsafe: "तुमची सुरक्षा महत्त्वाची आहे. तुम्ही सध्या सुरक्षित आहात का?",
      unsure: "काही हरकत नाही — परिस्थिती समजून घेण्यासाठी मी काही सोपे प्रश्न विचारू का?",
    },
    crisis_reply: "सांगितल्याबद्दल धन्यवाद. तुम्हाला एकट्याने सहन करण्याची गरज नाही. तात्काळ मदतीसाठी संपर्क जोडू का?",
    high_reply: "हे गंभीर आहे. आम्ही त्वरित मदतीसाठी उच्च प्राधान्य नोंदवत आहोत.",
    mod_reply: "सांगितल्याबद्दल धन्यवाद. सल्लागाराचा संपर्क हवा आहे का?",
    low_reply: "मी तुमचे म्हणणे लक्षपूर्वक ऐकत आहे.",
    greeting_reply: "नमस्कार! मी तुमचे म्हणणे ऐकत आहे. काय घडले किंवा मी तुम्हाला कशी मदत करू शकतो, कृपया सांगा.",
    banner_title: "तुम्हाला एकट्याने याचा सामना करण्याची गरज नाही",
    banner_desc: "राष्ट्रीय अत्याचार प्रतिबंधक हेल्पलाइन 14566 वर 24×7 प्रशिक्षित मदत उपलब्ध आहे.",
    banner_call: "14566 वर कॉल करा",
    banner_callback: "कॉल परत मागवा",
    placeholder: "येथे टाइप करा किंवा माइक वापरा...",
    sidebar_svi: "तणाव व असुरक्षितता निर्देशांक (SVI)",
    sidebar_emotion: "इमोशन AI (भावना विश्लेषण)",
    sidebar_support: "शिफारस केलेली मदत",
    sidebar_lang: "भाषा (Language)",
    sidebar_quick: "त्वरित सुरुवात",
    sidebar_helpline: "राष्ट्रीय हेल्पलाइन",
    sidebar_helpline_note: "टोल-फ्री, 24×7.",
    reco_empty: "अजून काहीही नाही — संभाषणासह अपडेट होईल.",
  },
  "ಕನ್ನಡ": {
    welcome: "ನಾನು ಸಹಾಯ. ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಕೇಳಲು ನಾನಿಲ್ಲಿದ್ದೇನೆ. ನೀವು ಟೈಪ್ ಮಾಡಬಹುದು ಅಥವಾ ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಬಳಸಬಹುದು.",
    quick_actions: [
      { key: "counsellor", label: "ಪ್ತಮಾಲೋಚಕರೊಂದಿಗೆ ಮಾತನಾಡಿ", icon: "chat" },
      { key: "legal", label: "ಕಾನೂನು ಆಯ್ಕೆಗಳನ್ನು ತಿಳಿಯಿರಿ", icon: "scale" },
      { key: "unsafe", label: "ನನಗೆ ಸುರಕ್ಷಿತ ಅನಿಸುತ್ತಿಲ್ಲ", icon: "shield" },
      { key: "unsure", label: "ಎಲ್ಲಿಂದ ಪ್ರಾರಂಭಿಸಬೇಕೆಂದು ತಿಳಿಯುತ್ತಿಲ್ಲ", icon: "compass" },
    ],
    templates: {
      counsellor: "ನಾನು ಸಮಾಲೋಚಕರೊಂದಿಗೆ ನಿಮ್ಮ ಮಾತನ್ನು ಏರ್ಪಡಿಸಬಹುದು. ನೀವು ಇಂದೇ ಮಾತನಾಡಲು ಬಯಸುವಿರಾ?",
      legal: "ದೂರು ದಾಖಲಿಸುವುದು, ರಕ್ಷಣೆ ಮತ್ತು ಕಾನೂನು ಹಕ್ಕುಗಳ ಬಗ್ಗೆ ನಾನು ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ.",
      unsafe: "ನಿಮ್ಮ ಸುರಕ್ಷತೆ ಮುಖ್ಯ. ಪ್ರಸ್ತುತ ನೀವು ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿದ್ದೀರಾ?",
      unsure: "ಪರವಾಗಿಲ್ಲ — ಪರಿಸ್ಥಿತಿ ತಿಳಿಯಲು ಕೆಲವು ಸರಳ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಲೇ?",
    },
    crisis_reply: "ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ತಕ್ಷಣದ ಸಹಾಯಕ್ಕಾಗಿ ಹೆಲ್ಪ್‌ಲೈನ್ ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಬೇಕೇ?",
    high_reply: "ಇದು ಗಂಭೀರವಾಗಿದೆ. ತಕ್ಷಣದ ಸಹಾಯಕ್ಕಾಗಿ ನಾವು ಇದನ್ನು ಹೆಚ್ಚಿನ ಆದ್ಯತೆಯಲ್ಲಿ ದಾಖಲಿಸುತ್ತಿದ್ದೇವೆ.",
    mod_reply: "ಧನ್ಯವಾದಗಳು. ಸಮಾಲೋಚಕರು ಸಂಪರ್ಕಿಸಲು ಬಯಸುವಿರಾ?",
    low_reply: "ನಾನು ನಿಮ್ಮ ಮಾತನ್ನು ಗಮನವಿಟ್ಟು ಕೇಳುತ್ತಿದ್ದೇನೆ.",
    greeting_reply: "ನಮಸ್ಕಾರ! ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬೇಕೆಂದು ಅಥವಾ ಏನು ನಡೆಯಿತು ಎಂದು ತಿಳಿಸಿ.",
    banner_title: "ನೀವು ಒಂಟಿಯಾಗಿ ಎದುರಿಸಬೇಕಾಗಿಲ್ಲ",
    banner_desc: "ರಾಷ್ಟ್ರೀಯ ದೌರ್ಜನ್ಯ ತಡೆ ಹೆಲ್ಪ್‌ಲೈನ್ 14566 ನಲ್ಲಿ 24×7 ಸಹಾಯ ಲಭ್ಯವಿದೆ.",
    banner_call: "14566 ಗೆ ಕರೆ ಮಾಡಿ",
    banner_callback: "ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿಸಿ",
    placeholder: "ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ...",
    sidebar_svi: "ಒತ್ತಡ ಮತ್ತು ದೌರ್ಬಲ್ಯ ಸೂಚ್ಯಂಕ (SVI)",
    sidebar_emotion: "ಭಾವನೆ AI (Emotion AI)",
    sidebar_support: "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಂಬಲ",
    sidebar_lang: "ಭಾಷೆ (Language)",
    sidebar_quick: "ತ್ವರಿತ ಆರಂಭ",
    sidebar_helpline: "ರಾಷ್ಟ್ರೀಯ ಹೆಲ್ಪ್‌ಲೈನ್",
    sidebar_helpline_note: "ಉಚಿತ, 24×7.",
    reco_empty: "ಇನ್ನೂ ಏನೂ ಇಲ್ಲ — ಮಾತನಾಡುತ್ತಾ ಅಪ್ಡೇಟ್ ಆಗುತ್ತದೆ.",
  },
};

const LEVEL_ANGLE = {
  low: -55,
  mod: -10,
  high: 35,
  crit: 68,
};

function botReplyFor(actionKeyOrText, level, isCrisis, lang = "English") {
  const langDict = I18N[lang] || I18N.English;
  const raw = (actionKeyOrText || "").trim().toLowerCase();

  const greetingPatterns = [
    "hello", "hi", "hey", "hello hello", "hello, hello", "hello.", "good morning",
    "good afternoon", "good evening", "namaste", "vanakkam", "namaskaram", "hai",
    "నమస్కారం", "నమస్తే", "नमस्ते", "வணக்கம்", "नमस्कार", "ನಮಸ್ಕಾರ"
  ];
  if (greetingPatterns.includes(raw) || (raw.length < 15 && (raw.includes("hello") || raw.includes("namaste") || raw.includes("hi")))) {
    return langDict.greeting_reply || "Hello! I'm here and listening. Please tell me what happened or how I can support you today.";
  }

  if (isCrisis) {
    return langDict.crisis_reply;
  }
  if (langDict.templates && langDict.templates[actionKeyOrText]) {
    return langDict.templates[actionKeyOrText];
  }
  if (level === "crit" || level === "high") {
    return langDict.high_reply;
  }
  if (level === "mod") {
    return langDict.mod_reply;
  }
  return langDict.low_reply;
}

function recommendationsFor(level) {
  if (level === "crit") {
    return ["Emergency support", "Police intervention", "Witness protection", "Counselling"];
  }
  if (level === "high") {
    return ["Priority counselling", "Legal aid referral", "Medical assistance"];
  }
  if (level === "mod") {
    return ["Counselling", "Legal information"];
  }
  return ["Routine information", "24/7 Helpline available"];
}

const Icon = {
  back: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  heartHands: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" {...p}>
      <path d="M12 21c-4-2.5-7-6-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 7.5-7 10z" />
      <path d="M9 12h1.5l1-2 2 4 1-2H16" />
    </svg>
  ),
  send: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  mic: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7" />
    </svg>
  ),
  chat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  scale: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M12 3v18M5 8l-3 6a4 4 0 0 0 8 0zM19 8l-3 6a4 4 0 0 0 8 0zM5 8h14M8 3h8" />
    </svg>
  ),
  shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
    </svg>
  ),
  compass: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2 6-6 2 2-6z" />
    </svg>
  ),
  warn: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  ),
  speaker: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  ),
  pulse: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
};

const ICON_MAP = {
  chat: Icon.chat,
  scale: Icon.scale,
  shield: Icon.shield,
  compass: Icon.compass,
};

export default function Complaint() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  const [consentGiven, setConsentGiven] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [language, setLanguage] = useState("English");
  const [sviScore, setSviScore] = useState(12);
  const [riskLevel, setRiskLevel] = useState("low");
  const [recommendations, setRecommendations] = useState([]);
  const [crisisActive, setCrisisActive] = useState(false);
  const [emotionData, setEmotionData] = useState({
    primary: "Calm / Neutral",
    primary_local: "Calm / Neutral Inquiry",
    confidence: 0.85,
    arousal: 0.15,
    valence: 0.10,
    scores: { fear: 0.05, distress: 0.05, sadness: 0.05, anger: 0.05, neutral: 0.80 },
  });
  const [voiceProsody, setVoiceProsody] = useState(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const mediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setSpeechSupported(!!SR || mediaSupported);

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // seed or update the welcome message
  useEffect(() => {
    if (consentGiven && messages.length === 0) {
      const langDict = I18N[language] || I18N.English;
      pushBotMessage(langDict.welcome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentGiven]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const langDict = I18N[newLang] || I18N.English;
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{ id: "welcome-init", sender: "bot", text: langDict.welcome, time: timeNow() }];
      }
      return prev;
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const timeNow = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const pushBotMessage = (text) => {
    setMessages((m) => [
      ...m,
      {
        id: `${Date.now()}-b`,
        sender: "bot",
        text,
        time: timeNow(),
      },
    ]);
  };

  const pushUserMessage = (text, emotionLabel = null) => {
    setMessages((m) => [
      ...m,
      {
        id: `${Date.now()}-u`,
        sender: "user",
        text,
        time: timeNow(),
        emotionTag: emotionLabel,
      },
    ]);
  };

  const mapRiskLevel = (backendRisk) => {
    const r = (backendRisk || "").toLowerCase();
    if (r === "critical") return "crit";
    if (r === "high") return "high";
    if (r === "moderate" || r === "medium") return "mod";
    return "low";
  };

  const sendMessage = useCallback(
    async (rawText, actionKey, audioBlob = null) => {
      const text = (rawText || "").trim() || (audioBlob ? "[Voice recording statement]" : "");
      if (!text && !audioBlob) return;

      pushUserMessage(text);
      setInput("");
      setIsTyping(true);

      try {
        // Call live backend AI assessment
        const result = await submitAssessment({
          text,
          audio: audioBlob,
          channel: audioBlob ? "helpline_14566" : "chatbot",
          consent_given: consentGiven,
        });

        const rawScore = Number(result.svi_score) || 0;
        const roundedScore = Math.round(rawScore);
        const mappedLevel = mapRiskLevel(result.risk_level);
        const isCrisis = mappedLevel === "crit" || mappedLevel === "high";

        setSviScore(roundedScore);
        setRiskLevel(mappedLevel);

        if (result.recommendations && result.recommendations.length > 0) {
          setRecommendations(result.recommendations);
        } else {
          setRecommendations(recommendationsFor(mappedLevel));
        }

        if (result.emotion) {
          setEmotionData(result.emotion);
        }

        if (result.speech_features) {
          setVoiceProsody(result.speech_features);
        }

        if (isCrisis) {
          setCrisisActive(true);
        } else {
          setCrisisActive(false);
        }

        setIsTyping(false);
        const replyMessage = result.bot_reply || botReplyFor(actionKey || text, mappedLevel, isCrisis, language);
        pushBotMessage(replyMessage);
      } catch (err) {
        console.warn("[Complaint] Backend assessment error:", err);
        setIsTyping(false);
        pushBotMessage(botReplyFor(actionKey || text, "low", false, language));
      }
    },
    [consentGiven, language]
  );

  const handleQuickAction = (key, label) => sendMessage(label, key);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    audioChunksRef.current = [];
    let localTranscript = "";

    // 1. Browser microphone capture via MediaRecorder
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          const textToSend = localTranscript.trim() || input.trim();
          sendMessage(textToSend, null, audioBlob);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(250);
      }
    } catch (err) {
      console.warn("[MediaRecorder] Microphone permission denied or unavailable:", err);
    }

    // 2. Web Speech API live visual transcription
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      const langCodeMap = {
        "English": "en-IN",
        "हिन्दी": "hi-IN",
        "తెలుగు": "te-IN",
        "தமிழ்": "ta-IN",
        "मराठी": "mr-IN",
        "ಕನ್ನಡ": "kn-IN",
      };
      recognition.lang = langCodeMap[language] || "en-IN";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        localTranscript = transcript;
        setInput(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {}
    }

    setIsListening(true);
  };

  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langCodeMap = {
      "English": "en-IN",
      "हिन्दी": "hi-IN",
      "తెలుగు": "te-IN",
      "தமிழ்": "ta-IN",
      "मराठी": "mr-IN",
      "ಕನ್ನಡ": "kn-IN",
    };
    utter.lang = langCodeMap[language] || "en-IN";
    utter.rate = 0.96;
    window.speechSynthesis.speak(utter);
  };

  const callHelpline = () => {
    window.location.href = "tel:14566";
  };

  const getEmotionTheme = () => {
    const p = (emotionData?.primary || "").toLowerCase();
    if (p.includes("fear")) return { cls: "fear", icon: "🚨", color: "#B83A2E" };
    if (p.includes("distress")) return { cls: "distress", icon: "⚠️", color: "#C08A7B" };
    if (p.includes("sadness")) return { cls: "sadness", icon: "🌧️", color: "#C9A468" };
    if (p.includes("anger")) return { cls: "fear", icon: "⚡", color: "#B83A2E" };
    return { cls: "neutral", icon: "🌿", color: "#6B968C" };
  };

  const emotionTheme = getEmotionTheme();

  return (
    <>
      <style>{PAGE_CSS}</style>

      <div className="csd-app">
        <header className="csd-header">
          <div className="csd-header-inner">
            <div className="csd-brand">
              <div className="csd-brand-mark">
                <Icon.heartHands />
              </div>
              <div>
                <div className="csd-brand-name">
                  SAHAYA <span>AI</span>
                </div>
                <div className="csd-brand-sub mono">
                  Client Support · NHAA 14566
                </div>
              </div>
            </div>

            <div className="csd-header-right">
              <div className="csd-privacy-badge">
                <Icon.lock />
                Confidential &amp; encrypted
              </div>
              <button className="csd-exit" onClick={() => navigate("/support")}>
                Support
              </button>
              <button className="csd-exit" onClick={() => navigate("/status")}>
                Status
              </button>
              <button className="csd-exit" onClick={() => navigate("/")}>
                <Icon.back />
                Back home
              </button>
            </div>
          </div>
        </header>

        <div className="csd-shell">
          <aside className="csd-sidebar">
            {/* 1. SVI GAUGE CARD */}
            <div className="csd-card">
              <div className="csd-card-title mono">
                {(I18N[language] || I18N.English).sidebar_svi}
                <span className="csd-live">
                  <span className="d" />
                  LIVE
                </span>
              </div>

              <div className="csd-gauge-wrap">
                <svg width="220" height="132" viewBox="0 0 220 132">
                  <path d="M22 110 A88 88 0 0 1 198 110" fill="none" stroke="#E9E3D6" strokeWidth="14" strokeLinecap="round" />
                  <path d="M22 110 A88 88 0 0 1 72 32" fill="none" stroke="#9DBBA8" strokeWidth="14" strokeLinecap="round" />
                  <path d="M72 32 A88 88 0 0 1 130 24" fill="none" stroke="#D3B579" strokeWidth="14" strokeLinecap="round" />
                  <path d="M130 24 A88 88 0 0 1 177 56" fill="none" stroke="#CB9868" strokeWidth="14" strokeLinecap="round" />
                  <path d="M177 56 A88 88 0 0 1 198 110" fill="none" stroke="#C0897A" strokeWidth="14" strokeLinecap="round" />
                  <g style={{ transformOrigin: "110px 110px", transform: `rotate(${LEVEL_ANGLE[riskLevel]}deg)`, transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                    <line x1="110" y1="110" x2="110" y2="34" stroke="#2B2E33" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="110" cy="110" r="6" fill="#2B2E33" />
                  </g>
                </svg>

                <div className="csd-gauge-value">
                  <div className="num">{sviScore}</div>
                  <div className="lbl">SVI / 100</div>
                </div>
              </div>

              <div className="csd-risk-row">
                <div className={`csd-risk-chip${riskLevel === "low" ? " active" : ""}`} data-r="low">LOW</div>
                <div className={`csd-risk-chip${riskLevel === "mod" ? " active" : ""}`} data-r="mod">MOD</div>
                <div className={`csd-risk-chip${riskLevel === "high" ? " active" : ""}`} data-r="high">HIGH</div>
                <div className={`csd-risk-chip${riskLevel === "crit" ? " active" : ""}`} data-r="crit">CRIT</div>
              </div>
            </div>

            {/* 2. DEDICATED EMOTION AI & SENTIMENT CARD */}
            <div className="csd-card">
              <div className="csd-card-title mono">
                {(I18N[language] || I18N.English).sidebar_emotion}
                <span className="csd-live">
                  <Icon.pulse style={{ width: 12, height: 12, stroke: emotionTheme.color }} />
                  {Math.round((emotionData?.confidence || 0.8) * 100)}% Conf
                </span>
              </div>

              <div className={`csd-emotion-hero ${emotionTheme.cls}`}>
                <div className="csd-emotion-icon">{emotionTheme.icon}</div>
                <div className="csd-emotion-text">
                  <div className="csd-emotion-title">
                    {emotionData?.primary_local || emotionData?.primary || "Calm / Neutral"}
                  </div>
                  <div className="csd-emotion-sub">
                    Intensity: {Math.round((emotionData?.arousal || 0.2) * 100)}% · Valence: {emotionData?.valence || 0.0 > 0 ? "Positive" : "Distress"}
                  </div>
                </div>
              </div>

              <div className="csd-emotion-bars">
                <div className="csd-emotion-bar-row">
                  <span className="csd-emotion-bar-label">Fear / భయం</span>
                  <div className="csd-emotion-bar-track">
                    <div className="csd-emotion-bar-fill" style={{ width: `${Math.round((emotionData?.scores?.fear || 0.05) * 100)}%`, background: "#B83A2E" }} />
                  </div>
                  <span className="csd-emotion-bar-pct">{Math.round((emotionData?.scores?.fear || 0.05) * 100)}%</span>
                </div>

                <div className="csd-emotion-bar-row">
                  <span className="csd-emotion-bar-label">Distress / ఆపద</span>
                  <div className="csd-emotion-bar-track">
                    <div className="csd-emotion-bar-fill" style={{ width: `${Math.round((emotionData?.scores?.distress || 0.05) * 100)}%`, background: "#C08A7B" }} />
                  </div>
                  <span className="csd-emotion-bar-pct">{Math.round((emotionData?.scores?.distress || 0.05) * 100)}%</span>
                </div>

                <div className="csd-emotion-bar-row">
                  <span className="csd-emotion-bar-label">Sadness / బాధ</span>
                  <div className="csd-emotion-bar-track">
                    <div className="csd-emotion-bar-fill" style={{ width: `${Math.round((emotionData?.scores?.sadness || 0.05) * 100)}%`, background: "#C9A468" }} />
                  </div>
                  <span className="csd-emotion-bar-pct">{Math.round((emotionData?.scores?.sadness || 0.05) * 100)}%</span>
                </div>

                <div className="csd-emotion-bar-row">
                  <span className="csd-emotion-bar-label">Neutral / శాంతం</span>
                  <div className="csd-emotion-bar-track">
                    <div className="csd-emotion-bar-fill" style={{ width: `${Math.round((emotionData?.scores?.neutral || 0.1) * 100)}%`, background: "#6B968C" }} />
                  </div>
                  <span className="csd-emotion-bar-pct">{Math.round((emotionData?.scores?.neutral || 0.1) * 100)}%</span>
                </div>
              </div>

              {voiceProsody && (
                <div className="csd-prosody-tag">
                  🎙️ Voice Prosody: <span>{voiceProsody.pitch_variation > 30 ? "Vocal Tremor Detected" : "Voice Pitch Stable"}</span> · Jitter: {voiceProsody.pitch_variation}Hz
                </div>
              )}
            </div>

            {/* 3. RECOMMENDED SUPPORT */}
            <div className="csd-card">
              <div className="csd-card-title mono">{(I18N[language] || I18N.English).sidebar_support}</div>
              {recommendations.length ? (
                <div className="csd-reco-list">
                  {recommendations.map((r) => (
                    <span className="csd-reco-pill" key={r}>{r}</span>
                  ))}
                </div>
              ) : (
                <p className="csd-reco-empty">{(I18N[language] || I18N.English).reco_empty}</p>
              )}
            </div>

            {/* 4. LANGUAGE SELECTOR */}
            <div className="csd-card">
              <div className="csd-card-title mono">{(I18N[language] || I18N.English).sidebar_lang}</div>
              <div className="csd-lang-row">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    className={`csd-lang-chip${language === l ? " active" : ""}`}
                    onClick={() => handleLanguageChange(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. QUICK ACTIONS */}
            <div className="csd-card">
              <div className="csd-card-title mono">{(I18N[language] || I18N.English).sidebar_quick}</div>
              <div className="csd-quick-list">
                {(I18N[language] || I18N.English).quick_actions.map((a) => {
                  const ActionIcon = ICON_MAP[a.icon] || Icon.chat;
                  return (
                    <button
                      key={a.key}
                      className="csd-quick-btn"
                      disabled={!consentGiven}
                      onClick={() => handleQuickAction(a.key, a.label)}
                    >
                      <ActionIcon />
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. NATIONAL HELPLINE */}
            <div className="csd-card csd-helpline-card">
              <div className="csd-card-title mono">{(I18N[language] || I18N.English).sidebar_helpline}</div>
              <div className="csd-helpline-num">14566</div>
              <button className="csd-helpline-call" onClick={callHelpline}>
                <Icon.phone />
                Call now
              </button>
              <div className="csd-helpline-note">{(I18N[language] || I18N.English).sidebar_helpline_note}</div>
            </div>
          </aside>

          <main className="csd-main">
            <div className="csd-chat-head">
              <div className="csd-chat-head-left">
                <div className="csd-bot-avatar">
                  <Icon.heartHands />
                </div>
                <div>
                  <h3>Sahaya</h3>
                  <p>Usually replies in a few seconds</p>
                </div>
              </div>
              <div className="csd-consent-pill">
                <Icon.lock />
                Consent-based
              </div>
            </div>

            <div className="csd-chat-scroll" ref={scrollRef}>
              {!consentGiven && (
                <div className="csd-consent-gate">
                  <h4>Before we begin</h4>
                  <p>
                    Anything you type or say here is used only to understand how you're doing right now,
                    so we can connect you with the right kind of support — counselling, legal aid, medical help,
                    or emergency assistance based on what you choose.
                  </p>
                  <button className="csd-consent-accept" onClick={() => setConsentGiven(true)}>
                    I understand — continue
                  </button>
                </div>
              )}

              {messages.map((m) => (
                <div className={`csd-msg-row ${m.sender}`} key={m.id}>
                  <div className="csd-msg-avatar">
                    {m.sender === "bot" ? <Icon.heartHands stroke="#48685F" /> : "You"}
                  </div>
                  <div>
                    <div className="csd-msg-bubble">{m.text}</div>
                    <div className="csd-msg-meta">
                      <span className="csd-msg-time">{m.time}</span>
                      {m.emotionTag && (
                        <span className="csd-msg-emotion-tag">{m.emotionTag}</span>
                      )}
                      {m.sender === "bot" && (
                        <button className="csd-speak-btn" onClick={() => speakMessage(m.text)} title="Hear this message aloud">
                          <Icon.speaker />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="csd-msg-row bot">
                  <div className="csd-msg-avatar">
                    <Icon.heartHands stroke="#48685F" />
                  </div>
                  <div className="csd-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {crisisActive && (
                <div className="csd-crisis-card">
                  <div className="csd-crisis-title">
                    <Icon.warn /> {(I18N[language] || I18N.English).banner_title}
                  </div>
                  <div className="csd-crisis-text">
                    {(I18N[language] || I18N.English).banner_desc}
                  </div>
                  <div className="csd-crisis-actions">
                    <button className="csd-crisis-call" onClick={callHelpline}>
                      <Icon.phone /> {(I18N[language] || I18N.English).banner_call}
                    </button>
                    <button className="csd-crisis-secondary" onClick={() => handleQuickAction("counsellor", "Please connect me with a counsellor")}>
                      {(I18N[language] || I18N.English).banner_callback}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {consentGiven && (
              <div className="csd-quick-chips">
                {(I18N[language] || I18N.English).quick_actions.map((a) => (
                  <button key={a.key} className="csd-chip-btn" onClick={() => handleQuickAction(a.key, a.label)}>
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            <form className="csd-composer" onSubmit={handleFormSubmit}>
              <div className="csd-input-wrap">
                <input
                  className="csd-input"
                  placeholder={consentGiven ? (I18N[language] || I18N.English).placeholder : "Please confirm consent above to begin"}
                  value={input}
                  disabled={!consentGiven}
                  onChange={(e) => setInput(e.target.value)}
                />
                {isListening && (
                  <div className="csd-waveform" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={`csd-mic-btn${isListening ? " listening" : ""}`}
                  disabled={!consentGiven || !speechSupported}
                  title={speechSupported ? "Speak instead of typing" : "Voice input isn't supported in this browser"}
                  onClick={toggleListening}
                >
                  <Icon.mic />
                </button>
              </div>
              <button type="submit" className="csd-send-btn" disabled={!consentGiven || !input.trim()}>
                <Icon.send />
              </button>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}
