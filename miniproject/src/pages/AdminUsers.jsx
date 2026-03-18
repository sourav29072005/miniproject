import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";
import "../styles/adminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [banModal, setBanModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    type: "info",
  });
  const [banForm, setBanForm] = useState({
    reason: "Violating community guidelines",
  });
  const [sending, setSending] = useState(false);
  const [banning, setBanning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load all users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("auth/admin/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products for a specific user
  const loadUserProducts = useCallback(async (userId) => {
    try {
      const response = await api.get(`items`);
      // Filter items for the selected user
      const filtered = response.data.filter(item => item.user?._id === userId);
      setUserProducts(filtered);
    } catch (err) {
      console.error("Failed to load user products:", err);
      setUserProducts([]);
    }
  }, []);

  useEffect(() => {
    // 🔐 protect admin route
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadUsers();

    window.addEventListener("focus", loadUsers);
    return () => window.removeEventListener("focus", loadUsers);
  }, [navigate, loadUsers]);

  // When a user is selected, load their products
  useEffect(() => {
    if (selectedUser) {
      loadUserProducts(selectedUser._id);
    }
  }, [selectedUser, loadUserProducts]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return q === "" || name.includes(q) || email.includes(q);
    });
  }, [users, search]);

  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserProducts([]);
  };

  const handleOpenMessageModal = (user) => {
    setSelectedUser(user);
    setMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject.trim() || !messageForm.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSending(true);
      await api.post("messages/send", {
        recipientId: selectedUser._id,
        subject: messageForm.subject,
        message: messageForm.message,
        type: messageForm.type,
      });

      alert("Message sent successfully!");
      setMessageModal(false);
      setMessageForm({ subject: "", message: "", type: "info" });
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleBanUser = async () => {
    try {
      setBanning(true);
      await api.put("auth/admin/ban", {
        userId: selectedUser._id,
        banReason: banForm.reason,
      });

      alert("User banned successfully!");
      setBanModal(false);
      setBanForm({ reason: "Violating community guidelines" });
      loadUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to ban user:", err);
      alert(err.response?.data?.error || "Failed to ban user");
    } finally {
      setBanning(false);
    }
  };

  const handleUnbanUser = async () => {
    try {
      setBanning(true);
      await api.put("auth/admin/unban", {
        userId: selectedUser._id,
      });

      alert("User unbanned successfully!");
      loadUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to unban user:", err);
      alert(err.response?.data?.error || "Failed to unban user");
    } finally {
      setBanning(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleting(true);
      await api.delete(`auth/admin/user/${selectedUser._id}`);

      alert("User deleted successfully!");
      setDeleteConfirmModal(false);
      loadUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err.response?.data?.error || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="au-container">
      {/* Header */}
      <div className="au-header">
        <div>
          <h2 className="au-title">Manage Users</h2>
          <p className="au-subtitle">
            View user profiles and their marketplace products.
          </p>
        </div>

        <button className="au-back" onClick={() => navigate("/admin")}>
          Back to Admin
        </button>
      </div>

      {/* Stats */}
      <div className="au-stats">
        <div className="au-stat-card">
          <p className="au-stat-label">Total Users</p>
          <h3 className="au-stat-value">{users.length}</h3>
        </div>
      </div>

      {/* Search */}
      <div className="au-filters">
        <input
          className="au-search"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="au-ghost" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      {/* Users List */}
      <div className="au-list">
        <div className="au-count">
          Showing <b>{filteredUsers.length}</b> of <b>{users.length}</b> users
        </div>

        {loading ? (
          <div className="au-loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="au-empty-card">
            <h3>No users found</h3>
            <p>Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="au-grid">
            {filteredUsers.map((user) => (
              <div key={user._id} className="au-card">
                <div className="au-profile-section">
                  <div className="au-avatar">
                    {user.profilePic ? (
                      <img
                        src={`${BASE_URL}/uploads/${user.profilePic}`}
                        alt={user.name}
                      />
                    ) : (
                      <div className="au-avatar-placeholder">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="au-info">
                    <h3 className="au-name">{user.name}</h3>
                    <p className="au-email">{user.email}</p>
                    {user.department && (
                      <p className="au-dept">📚 {user.department}</p>
                    )}
                    {user.graduationYear && (
                      <p className="au-year">🎓 {user.graduationYear}</p>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <p className="au-bio">{user.bio}</p>
                )}

                <div className="au-meta">
                  <span className="au-role-badge">
                    {user.role === "admin" ? "👑 Admin" : "👤 User"}
                  </span>
                  {user.isBanned && (
                    <span className="au-ban-badge">🚫 BANNED</span>
                  )}
                  <span className="au-joined">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  className="au-view-btn"
                  onClick={() => handleViewProfile(user)}
                >
                  View Profile & Products
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <div className="au-overlay">
          <div className="au-modal">
            <div className="au-modal-header">
              <div className="au-modal-title">
                <div className="au-modal-avatar">
                  {selectedUser.profilePic ? (
                    <img
                      src={`${BASE_URL}/uploads/${selectedUser.profilePic}`}
                      alt={selectedUser.name}
                    />
                  ) : (
                    <div className="au-modal-avatar-placeholder">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2>{selectedUser.name}</h2>
                  <p className="au-modal-email">{selectedUser.email}</p>
                </div>
              </div>
              <div className="au-modal-header-actions">
                <button 
                  className="au-message-btn"
                  onClick={() => handleOpenMessageModal(selectedUser)}
                >
                  💬 Message
                </button>
                {selectedUser.role !== "admin" && (
                  <>
                    {!selectedUser.isBanned ? (
                      <button 
                        className="au-ban-btn"
                        onClick={() => setBanModal(true)}
                      >
                        🚫 Ban
                      </button>
                    ) : (
                      <button 
                        className="au-unban-btn"
                        onClick={handleUnbanUser}
                      >
                        ✅ Unban
                      </button>
                    )}
                    <button 
                      className="au-delete-btn"
                      onClick={() => setDeleteConfirmModal(true)}
                    >
                      🗑 Delete
                    </button>
                  </>
                )}
                <button className="au-close-btn" onClick={handleCloseModal}>
                  ✕
                </button>
              </div>
            </div>

            <div className="au-modal-content">
              {/* User Details */}
              <div className="au-modal-section">
                <h3>Profile Information</h3>
                <div className="au-info-grid">
                  <div className="au-info-item">
                    <label>Name</label>
                    <p>{selectedUser.name}</p>
                  </div>
                  <div className="au-info-item">
                    <label>Email</label>
                    <p>{selectedUser.email}</p>
                  </div>
                  {selectedUser.department && (
                    <div className="au-info-item">
                      <label>Department</label>
                      <p>{selectedUser.department}</p>
                    </div>
                  )}
                  {selectedUser.graduationYear && (
                    <div className="au-info-item">
                      <label>Graduation Year</label>
                      <p>{selectedUser.graduationYear}</p>
                    </div>
                  )}
                  <div className="au-info-item">
                    <label>Account Type</label>
                    <p>{selectedUser.role === "admin" ? "Admin" : "User"}</p>
                  </div>
                  <div className="au-info-item">
                    <label>Joined</label>
                    <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div className="au-bio-section">
                    <label>Bio</label>
                    <p>{selectedUser.bio}</p>
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div className="au-modal-section">
                <h3>Products Listed ({userProducts.length})</h3>
                
                {userProducts.length === 0 ? (
                  <div className="au-no-products">
                    <p>This user has not listed any products yet.</p>
                  </div>
                ) : (
                  <div className="au-products-grid">
                    {userProducts.map((product) => (
                      <div key={product._id} className="au-product-card">
                        <div className="au-product-img">
                          {product.image || (product.images && product.images.length > 0) ? (
                            <img
                              src={`${BASE_URL}/uploads/${product.image || product.images[0]}`}
                              alt={product.title}
                            />
                          ) : (
                            <div className="au-product-placeholder">No Image</div>
                          )}
                          <span
                            className={
                              product.status === "sold"
                                ? "au-status-badge sold"
                                : "au-status-badge available"
                            }
                          >
                            {product.status === "sold" ? "SOLD" : "AVAILABLE"}
                          </span>
                        </div>
                        <div className="au-product-info">
                          <h4 className="au-product-title">{product.title}</h4>
                          <p className="au-product-price">₹ {product.price}</p>
                          <span className="au-product-category">{product.category}</span>
                          {!product.approved && (
                            <span className="au-product-badge pending">Pending Approval</span>
                          )}
                          {product.approved && (
                            <span className="au-product-badge approved">Approved</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModal && selectedUser && (
        <div className="au-overlay">
          <div className="au-message-modal">
            <div className="au-message-header">
              <h3>Send Message to {selectedUser.name}</h3>
              <button 
                className="au-close-btn"
                onClick={() => setMessageModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="au-message-form">
              <div className="au-form-group">
                <label>Message Type</label>
                <select
                  className="au-form-select"
                  value={messageForm.type}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, type: e.target.value })
                  }
                >
                  <option value="info">ℹ Info</option>
                  <option value="warning">⚠ Warning</option>
                  <option value="alert">🔔 Alert</option>
                </select>
              </div>

              <div className="au-form-group">
                <label>Subject</label>
                <input
                  className="au-form-input"
                  type="text"
                  placeholder="e.g., Account Review Required"
                  value={messageForm.subject}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, subject: e.target.value })
                  }
                />
              </div>

              <div className="au-form-group">
                <label>Message</label>
                <textarea
                  className="au-form-textarea"
                  placeholder="Enter your message here..."
                  rows="6"
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, message: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="au-message-actions">
              <button
                className="au-cancel-btn"
                onClick={() => setMessageModal(false)}
              >
                Cancel
              </button>
              <button
                className="au-send-btn"
                onClick={handleSendMessage}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {banModal && selectedUser && (
        <div className="au-overlay">
          <div className="au-message-modal">
            <div className="au-message-header">
              <h3>Ban User - {selectedUser.name}</h3>
              <button 
                className="au-close-btn"
                onClick={() => setBanModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="au-message-form">
              <div className="au-warning-alert">
                ⚠ This user will not be able to login or access the platform
              </div>

              <div className="au-form-group">
                <label>Ban Reason</label>
                <textarea
                  className="au-form-textarea"
                  placeholder="e.g., Violating community guidelines, Suspicious activity, etc."
                  rows="4"
                  value={banForm.reason}
                  onChange={(e) =>
                    setBanForm({ ...banForm, reason: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="au-message-actions">
              <button
                className="au-cancel-btn"
                onClick={() => setBanModal(false)}
              >
                Cancel
              </button>
              <button
                className="au-ban-confirm-btn"
                onClick={handleBanUser}
                disabled={banning}
              >
                {banning ? "Banning..." : "Confirm Ban"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && selectedUser && (
        <div className="au-overlay">
          <div className="au-confirm-modal">
            <div className="au-confirm-header">
              <h3>Delete User</h3>
              <button 
                className="au-close-btn"
                onClick={() => setDeleteConfirmModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="au-confirm-body">
              <p className="au-confirm-text">
                Are you sure you want to permanently delete <strong>{selectedUser.name}</strong>?
              </p>
              <p className="au-confirm-warning">
                ⚠ This action cannot be undone. All user data and products will be removed.
              </p>
            </div>

            <div className="au-confirm-actions">
              <button
                className="au-cancel-btn"
                onClick={() => setDeleteConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="au-delete-confirm-btn"
                onClick={handleDeleteUser}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
