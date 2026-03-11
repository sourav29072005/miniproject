import { useCallback, useEffect, useState } from "react";
import api, { BASE_URL } from "../api";
import "../styles/messages.css";

function Messages({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("messages");
      setMessages(response.data);

      // Count unread
      const unread = response.data.filter((m) => !m.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, loadMessages]);

  const markAsRead = async (messageId) => {
    try {
      await api.put(`messages/${messageId}/read`);
      loadMessages();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`messages/${messageId}`);
      loadMessages();
      setSelectedMessage(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("messages/read-all/all");
      loadMessages();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <>
      {/* Message Icon Count */}
      <div className="msg-badge-container">
        {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}
      </div>

      {/* Messages Panel */}
      <div className={`messages-panel ${isOpen ? "active" : ""}`}>
        <div className="messages-header">
          <h3>Messages</h3>
          {unreadCount > 0 && (
            <button className="msg-mark-all" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
          <button className="msg-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="messages-content">
          {loading ? (
            <div className="msg-loading">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="msg-empty">
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-item ${!msg.isRead ? "unread" : ""}`}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) {
                      markAsRead(msg._id);
                    }
                  }}
                >
                  <div className="msg-avatar">
                    {msg.sender?.profilePic ? (
                      <img src={`${BASE_URL}/uploads/${msg.sender.profilePic}`} alt={msg.sender.name} />
                    ) : (
                      <div className="msg-avatar-placeholder">
                        {msg.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {msg.type === "warning" && <span className="msg-type-badge warning">⚠</span>}
                    {msg.type === "alert" && <span className="msg-type-badge alert">🔔</span>}
                    {msg.type === "info" && <span className="msg-type-badge info">ℹ</span>}
                  </div>
                  <div className="msg-info">
                    <h4 className="msg-subject">{msg.subject}</h4>
                    <p className="msg-preview">{msg.message.substring(0, 50)}...</p>
                    <span className="msg-time">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!msg.isRead && <span className="msg-dot"></span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="msg-overlay">
          <div className="msg-modal">
            <div className="msg-modal-header">
              <h3>{selectedMessage.subject}</h3>
              <button
                className="msg-modal-close"
                onClick={() => setSelectedMessage(null)}
              >
                ✕
              </button>
            </div>

            <div className="msg-modal-sender">
              <div className="msg-sender-info">
                <div className="msg-sender-avatar">
                  {selectedMessage.sender?.profilePic ? (
                    <img
                      src={`${BASE_URL}/uploads/${selectedMessage.sender.profilePic}`}
                      alt={selectedMessage.sender.name}
                    />
                  ) : (
                    <div className="msg-sender-placeholder">
                      {selectedMessage.sender?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="msg-sender-name">{selectedMessage.sender?.name}</p>
                  <p className="msg-sender-email">{selectedMessage.sender?.email}</p>
                </div>
              </div>
              <div className="msg-meta">
                <span className="msg-type-label">
                  {selectedMessage.type === "warning" && "⚠ Warning"}
                  {selectedMessage.type === "alert" && "🔔 Alert"}
                  {selectedMessage.type === "info" && "ℹ Info"}
                </span>
                <span className="msg-date">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="msg-modal-body">
              <p>{selectedMessage.message}</p>
            </div>

            <div className="msg-modal-actions">
              <button
                className="msg-delete-btn"
                onClick={() => deleteMessage(selectedMessage._id)}
              >
                Delete
              </button>
              <button 
                className="msg-close-modal"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Messages;
