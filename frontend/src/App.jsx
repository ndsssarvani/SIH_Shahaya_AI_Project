import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Consent from "./pages/Consent";
import Complaint from "./pages/Complaint";
import Support from "./pages/Support";
import Status from "./pages/Status";

// Officer pages
import Dashboard from "./pages/officer/Dashboard";
import Cases from "./pages/officer/Cases";
import CaseDetails from "./pages/officer/CaseDetails";
import Alerts from "./pages/officer/Alerts";
import Reports from "./pages/officer/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Victim Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/assessment" element={<Complaint />} />
        <Route path="/chat" element={<Complaint />} />
        <Route path="/support" element={<Support />} />
        <Route path="/resources" element={<Support />} />
        <Route path="/status" element={<Status />} />
        <Route path="/track" element={<Status />} />

        {/* Officer & Response Team Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/officer/dashboard" element={<Dashboard />} />
        <Route path="/officer/cases" element={<Cases />} />
        <Route path="/officer/cases/:id" element={<CaseDetails />} />
        <Route path="/officer/alerts" element={<Alerts />} />
        <Route path="/officer/reports" element={<Reports />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
