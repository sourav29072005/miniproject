import React, { useState } from "react";
import api from "../api";
import "../styles/reportmodal.css"; // We will create this CSS file next

function ReportModal({ isOpen, onClose, entityId, entityModel }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/reports", {
        reportedEntity: entityId,
        entityModel,
        reason,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state for next time
        setSuccess(false);
        setReason("");
        setDescription("");
      }, 2000);
    } catch (err) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="report-modal-close" onClick={onClose}>&times;</button>
        
        {success ? (
          <div className="report-success-state">
            <div className="success-icon">✓</div>
            <h3>Report Submitted</h3>
            <p>Thank you for helping keep our community safe. Our team will review this shortly.</p>
          </div>
        ) : (
          <>
            <h3>Report this {entityModel}</h3>
            <p className="report-subtitle">
              Your report is anonymous. Please provide accurate information.
            </p>
            
            {error && <div className="report-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Reason for reporting</label>
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="report-select"
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="Fake Item">Fake or Misleading Item</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Scam">Suspected Scam</option>
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment or Abuse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Additional details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional context to help us understand the issue..."
                  rows="4"
                  className="report-textarea"
                />
              </div>
              
              <div className="report-modal-actions">
                <button type="button" className="report-btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="report-btn-submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportModal;
