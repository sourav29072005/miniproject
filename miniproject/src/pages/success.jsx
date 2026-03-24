import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/success.css";

function Success() {
  const navigate = useNavigate();
  const location = useLocation();

  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  const paymentMethod = useMemo(() => {
    return localStorage.getItem("paymentMethod") || "";
  }, []);

  const isCOD = paymentMethod === "cod";

  useEffect(() => {
    const idFromState = Number(location.state?.paymentItemId);
    const idFromStorage = Number(localStorage.getItem("paymentItemId"));
    const paymentId = idFromState || idFromStorage;

    if (!paymentId) {
      setMsg("No recent payment was found. (You may have refreshed the page.)");
      setVerified(true);
      setTimeout(() => setAnimateIn(true), 50);
      return;
    }

    localStorage.removeItem("paymentItemId");
    localStorage.removeItem("selectedItemId");
    localStorage.removeItem("paymentDone");

    setMsg(
      isCOD
        ? "Your order has been placed. Please pay cash on delivery."
        : "Your payment has been completed successfully."
    );
    setVerified(true);
    setTimeout(() => setAnimateIn(true), 50);
    setTimeout(() => localStorage.removeItem("paymentMethod"), 500);
  }, [location.state, navigate, isCOD]);

  if (!verified) return null;

  const goHome = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "admin") navigate("/admin");
    else navigate("/");
  };

  return (
    <div className="success-page">
      {/* Background blobs */}
      <div className="success-blob success-blob-1" />
      <div className="success-blob success-blob-2" />

      <div className={`success-card${animateIn ? " success-card--visible" : ""}`}>
        {/* Icon */}
        <div className={`success-icon-ring${animateIn ? " success-icon-ring--pop" : ""}`}>
          <svg viewBox="0 0 52 52" className="success-checkmark-svg" fill="none">
            <circle cx="26" cy="26" r="25" className="success-circle-bg" />
            <path
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
              className="success-checkmark-path"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Badge */}
        <span className="success-badge">
          {isCOD ? "Order Confirmed" : "Payment Verified"}
        </span>

        {/* Title */}
        <h1 className="success-title">
          {isCOD ? "Order Placed!" : "Payment Successful!"}
        </h1>

        {/* Message */}
        <p className="success-message">{msg}</p>

        {/* Divider */}
        <div className="success-divider" />

        {/* Next steps hint */}
        <p className="success-hint">
          You can track your order in <strong>My Orders</strong>.
        </p>

        {/* Actions */}
        <div className="success-actions">
          <button className="success-btn success-btn-primary" onClick={() => navigate("/marketplace")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Explore Marketplace
          </button>
          <button className="success-btn success-btn-outline" onClick={goHome}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;