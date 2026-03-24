import { useState, useEffect } from "react";
import { X, Send, MessageSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "../../api";

const ISSUE_TYPES = [
  "Account Issue",
  "Order Problem",
  "Hostel Inquiry",
  "Bug Report",
  "Payment Issue",
  "Other",
];

function SupportModal({ isOpen, onClose }) {
  const [subject, setSubject] = useState("");
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    if (isOpen && !adminId) {
      api.get("auth/admin-id")
        .then(res => setAdminId(res.data._id))
        .catch(() => setErrorMsg("Could not connect to support. Please try again later."));
    }
  }, [isOpen, adminId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const fullSubject = issueType ? `[${issueType}] ${subject}` : subject;
      await api.post("messages/user-send", {
        recipientId: adminId,
        subject: fullSubject,
        message,
      });
      setStatus("success");
      setSubject("");
      setIssueType("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.error || "Failed to send. Please try again.");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setErrorMsg("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primaryDark p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Contact Support</h2>
                <p className="text-blue-100/80 text-sm font-medium">We'll respond as soon as possible</p>
              </div>
            </div>
            <button onClick={handleClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {status === "success" ? (
            <div className="py-10 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 font-medium max-w-xs">Your support request has been submitted. An admin will review it shortly.</p>
              </div>
              <button onClick={handleClose} className="mt-4 px-8 py-3 bg-primary text-white rounded-xl font-extrabold hover:bg-primaryDark transition">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all"
                >
                  <option value="">Select a category...</option>
                  {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Subject</label>
                <input
                  type="text"
                  placeholder="Briefly describe your issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all placeholder-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Message</label>
                <textarea
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  maxLength={1000}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all placeholder-gray-400 resize-none"
                />
                <p className="text-right text-xs text-gray-400 font-medium">{message.length}/1000</p>
              </div>

              {(status === "error" || errorMsg) && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-semibold">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !adminId}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-extrabold text-base hover:bg-primaryDark transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={18} /> Send to Support</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupportModal;
