import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminItems.css";

function AdminItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | available | sold
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadItems = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem("items")) || [];
    setItems(stored);
  }, []);

  useEffect(() => {
    // 🔐 protect admin route
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadItems();

    window.addEventListener("focus", loadItems);
    return () => window.removeEventListener("focus", loadItems);
  }, [navigate, loadItems]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const sold = items.filter((i) => i.status === "sold").length;
    const available = total - sold;
    return { total, available, sold };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const seller = (item.seller || "").toLowerCase();
      const q = search.trim().toLowerCase();

      const matchesSearch =
        q === "" ||
        title.includes(q) ||
        seller.includes(q) ||
        String(item.price ?? "").includes(q);

      const status = item.status === "sold" ? "sold" : "available";
      const matchesStatus = statusFilter === "all" || statusFilter === status;

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, search, statusFilter, categoryFilter]);

  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === deleteId) || null;
  }, [items, deleteId]);

  const confirmDelete = () => {
    if (!deleteId) return;

    const stored = JSON.parse(localStorage.getItem("items")) || [];
    const updated = stored.filter((i) => i.id !== deleteId);

    localStorage.setItem("items", JSON.stringify(updated));
    setDeleteId(null);
    loadItems();
  };

  const openItem = (item) => {
    // ✅ admin view route (make sure App.js has /admin/item-details route)
    localStorage.setItem("selectedItemId", item.id);
    navigate("/admin/item-details");
  };

  return (
    <div className="ai-container">
      {/* Header */}
      <div className="ai-header">
        <div>
          <h2 className="ai-title">Manage Items</h2>
          <p className="ai-subtitle">
            Monitor marketplace listings, sold status and remove items when needed.
          </p>
        </div>

        <button className="ai-back" onClick={() => navigate("/admin")}>
          Back to Admin
        </button>
      </div>

      {/* Stats */}
      <div className="ai-stats">
        <div className="ai-stat-card">
          <p className="ai-stat-label">Total Items</p>
          <h3 className="ai-stat-value">{stats.total}</h3>
        </div>

        <div className="ai-stat-card">
          <p className="ai-stat-label">Available</p>
          <h3 className="ai-stat-value">{stats.available}</h3>
        </div>

        <div className="ai-stat-card">
          <p className="ai-stat-label">Sold</p>
          <h3 className="ai-stat-value">{stats.sold}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="ai-filters">
        <input
          className="ai-search"
          type="text"
          placeholder="Search by title / seller / price..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="ai-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>

        <select
          className="ai-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>

        <button
          className="ai-ghost"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setCategoryFilter("all");
          }}
        >
          Clear
        </button>
      </div>

      {/* List */}
      <div className="ai-list">
        <div className="ai-count">
          Showing <b>{filteredItems.length}</b> of <b>{items.length}</b> items
        </div>

        {filteredItems.length === 0 ? (
          <div className="ai-empty-card">
            <h3>No items found</h3>
            <p>Try changing filters or search keywords.</p>
          </div>
        ) : (
          <div className="ai-grid">
            {filteredItems.map((item) => {
              const isSold = item.status === "sold";

              return (
                <div key={item.id} className="ai-card">
                  <div className="ai-imgwrap">
                    {item.image ? (
                      <img className="ai-img" src={item.image} alt={item.title} />
                    ) : (
                      <div className="ai-img ai-placeholder">No Image</div>
                    )}

                    <span className={isSold ? "ai-badge sold" : "ai-badge avail"}>
                      {isSold ? "SOLD" : "AVAILABLE"}
                    </span>
                  </div>

                  <div className="ai-info">
                    <div className="ai-title-row">
                      <h3 className="ai-name" title={item.title}>
                        {item.title}
                      </h3>
                      <p className="ai-price">₹ {item.price}</p>
                    </div>

                    <div className="ai-meta-row">
                      <span className="ai-pill">Category: {item.category || "-"}</span>
                      <span className="ai-pill">Seller: {item.seller || "-"}</span>
                    </div>

                    {item.description && <p className="ai-desc">{item.description}</p>}
                  </div>

                  <div className="ai-actions">
                    <button className="ai-view" onClick={() => openItem(item)}>
                      View
                    </button>

                    <button className="ai-danger" onClick={() => setDeleteId(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="ai-overlay">
          <div className="ai-modal">
            <h3>Delete Listing?</h3>
            <p className="ai-modal-text">
              You are about to delete: <b>{selectedItem?.title || "this item"}</b>. This cannot be undone.
            </p>

            <div className="ai-modal-actions">
              <button className="ai-ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="ai-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminItems;