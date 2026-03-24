import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Inbox, SendHorizonal, Search, X, ArrowLeft, Circle } from "lucide-react";

const TYPE_COLORS = {
  warning: { bg: "bg-orange-100", text: "text-orange-600" },
  alert:   { bg: "bg-red-100",    text: "text-red-600"    },
  info:    { bg: "bg-indigo-100", text: "text-indigo-600" },
};

function typeBadge(type) {
  const t = (type || "info").toLowerCase();
  const c = TYPE_COLORS[t] || TYPE_COLORS.info;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${c.bg} ${c.text}`}>
      {t}
    </span>
  );
}

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox"); // inbox | outbox
  const navigate = useNavigate();

  // Get admin ID from token for inbox/outbox split
  const adminUser = JSON.parse(localStorage.getItem("user"));
  const adminId = adminUser?._id || adminUser?.id;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/messages/admin/all");
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const openMessage = async (msg) => {
    setSelectedMessage(msg);
    // If it's an unread inbox message, mark it as read
    if (!msg.isRead && (msg.recipient?._id === adminId || msg.recipient === adminId)) {
      try {
        await api.put(`/messages/${msg._id}/read`);
        // Update local state so UI reflects it immediately
        setMessages(prev =>
          prev.map(m => m._id === msg._id ? { ...m, isRead: true, readAt: new Date().toISOString() } : m)
        );
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  // Split by direction relative to admin
  const inboxMessages  = messages.filter(m => m.recipient?._id === adminId || m.recipient === adminId);
  const outboxMessages = messages.filter(m => m.sender?._id    === adminId || m.sender    === adminId);

  const activeMessages = activeTab === "inbox" ? inboxMessages : outboxMessages;

  const filtered = activeMessages.filter(msg => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      msg.sender?.name?.toLowerCase().includes(q)    ||
      msg.sender?.email?.toLowerCase().includes(q)   ||
      msg.recipient?.name?.toLowerCase().includes(q) ||
      msg.recipient?.email?.toLowerCase().includes(q)||
      msg.subject?.toLowerCase().includes(q)         ||
      msg.message?.toLowerCase().includes(q)
    );
  });

  const tabs = [
    { key: "inbox",  label: "Inbox",   icon: Inbox,         count: inboxMessages.length,  unread: inboxMessages.filter(m => !m.isRead).length },
    { key: "outbox", label: "Outbox",  icon: SendHorizonal, count: outboxMessages.length, unread: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-gray-800 transition mb-3"
          >
            <ArrowLeft size={16} /> Back to Admin
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Manage Messages</h1>
          <p className="text-gray-500 font-medium mt-1">{messages.length} total messages on the platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-200">
        {tabs.map(({ key, label, icon: Icon, count, unread }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearchTerm(""); }}
            className={`relative flex items-center gap-2 px-6 py-3.5 font-extrabold text-sm transition-all border-b-2 -mb-[2px] ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon size={17} />
            {label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeTab === key ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {count}
            </span>
            {unread > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" title={`${unread} unread`} />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all font-medium text-sm"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-semibold">Loading messages...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <Inbox size={48} className="text-gray-200 mb-4" />
          <p className="font-extrabold text-gray-600 text-xl mb-1">
            {activeTab === "inbox" ? "No support requests yet." : "No sent messages yet."}
          </p>
          <p className="font-medium text-sm">{searchTerm ? "Try a different search term." : "They'll appear here when they arrive."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider w-36">Date</th>
                <th className="text-left px-5 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                  {activeTab === "inbox" ? "From" : "To"}
                </th>
                <th className="text-left px-5 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Subject &amp; Message</th>
                <th className="text-left px-5 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider w-24">Type</th>
                <th className="text-left px-5 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((msg) => {
                const isUnread = !msg.isRead && activeTab === "inbox";
                const contact = activeTab === "inbox" ? msg.sender : msg.recipient;
                return (
                  <tr
                    key={msg._id}
                    onClick={() => openMessage(msg)}
                    className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${isUnread ? "bg-blue-50/30" : ""}`}
                  >
                    <td className="px-5 py-4 text-gray-500 font-semibold whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isUnread && <Circle size={8} className="text-blue-500 fill-blue-500 flex-shrink-0" />}
                        <div>
                          <div className={`font-bold text-gray-900 ${isUnread ? "font-extrabold" : ""}`}>{contact?.name || "System"}</div>
                          <div className="text-gray-400 text-xs">{contact?.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className={`text-gray-900 mb-0.5 ${isUnread ? "font-extrabold" : "font-semibold"}`}>{msg.subject}</div>
                      <div className="text-gray-400 text-xs truncate max-w-[280px]">{msg.message}</div>
                    </td>
                    <td className="px-5 py-4">{typeBadge(msg.type)}</td>
                    <td className="px-5 py-4">
                      {msg.isRead ? (
                        <span className="text-green-600 font-bold text-xs">✓ Read</span>
                      ) : (
                        <span className="text-red-500 font-bold text-xs">● Unread</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primaryDark p-5 text-white flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Message Details</h2>
              <button onClick={() => setSelectedMessage(null)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* From / To */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1">From</p>
                  <p className="font-bold text-gray-900">{selectedMessage.sender?.name || "System"}</p>
                  <p className="text-xs text-gray-500">{selectedMessage.sender?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1">To</p>
                  <p className="font-bold text-gray-900">{selectedMessage.recipient?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{selectedMessage.recipient?.email}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-gray-400 uppercase">Type:</span>
                  {typeBadge(selectedMessage.type)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-gray-400 uppercase">Status:</span>
                  {selectedMessage.isRead
                    ? <span className="text-green-600 font-bold text-xs">✓ Read</span>
                    : <span className="text-red-500 font-bold text-xs">● Unread</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-gray-400 uppercase">Date:</span>
                  <span className="text-xs text-gray-600 font-semibold">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                <h3 className="text-lg font-extrabold text-gray-900">{selectedMessage.subject}</h3>
              </div>

              {/* Message body */}
              <div>
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-extrabold hover:bg-primaryDark transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessages;
