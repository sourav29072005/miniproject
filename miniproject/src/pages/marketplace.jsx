import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";
import { getImageUrl } from "../utils/urlHelper";
import "../styles/marketplace.css";
import { FaFilter, FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Marketplace() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Wishlist
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  const filterRef = useRef(null);
  const navigate = useNavigate();

  const userEmail = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.email || "guest";
  }, []);

  const wishlistKey = useMemo(() => `wishlist_${userEmail}`, [userEmail]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("items");
      setItems(response.data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    const storedWishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    setWishlistIds(storedWishlist);
  };

  useEffect(() => {
    loadItems();
    loadWishlist();

    // reload when user returns from payment/success
    window.addEventListener("focus", loadItems);
    return () => window.removeEventListener("focus", loadItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistKey]);

  // Close filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  const { addToCart } = useCart();
  const [addingIds, setAddingIds] = useState({});

  const handleAddToCart = async (e, itemId) => {
    e.stopPropagation();
    setAddingIds(prev => ({ ...prev, [itemId]: true }));
    const res = await addToCart(itemId);
    setAddingIds(prev => ({ ...prev, [itemId]: false }));
    if (!res.success) {
      alert(res.error);
    }
  };

  const viewItem = (item) => {
    if (item.status === "sold") return; // safety
    localStorage.setItem("selectedItemId", item._id);
    navigate("/item-details");
  };

  const isWishlisted = (id) => wishlistIds.includes(id);

  const toggleWishlist = (itemId) => {
    setWishlistIds((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [itemId, ...prev];

      localStorage.setItem(wishlistKey, JSON.stringify(next));
      return next;
    });
  };

  // ✅ Filter + auto-hide sold items
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return items
      .filter((item) => item.status !== "sold" && item.status !== "delivered") // ✅ hide sold and delivered items
      .filter((item) => {
        const title = (item.title || "").toLowerCase();

        const matchesSearch = q === "" || title.includes(q);
        const matchesCategory = category === "" || item.category === category;

        const priceNum = Number(item.price || 0);
        const matchesMin = minPrice === "" || priceNum >= Number(minPrice);
        const matchesMax = maxPrice === "" || priceNum <= Number(maxPrice);

        const matchesWishlist =
          !showWishlistOnly || wishlistIds.includes(item._id);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesMin &&
          matchesMax &&
          matchesWishlist
        );
      });
  }, [items, searchTerm, category, minPrice, maxPrice, showWishlistOnly, wishlistIds]);

  const CATEGORIES = [
    { label: "All", value: "", icon: "🛍️" },
    { label: "Books", value: "Books", icon: "📚" },
    { label: "Electronics", value: "Electronics", icon: "💻" },
    { label: "Furniture", value: "Furniture", icon: "🪑" },
    { label: "Hostel Essentials", value: "Hostel Essentials", icon: "🏠" },
    { label: "Others", value: "Others", icon: "📦" },
  ];

  return (
    <div className="marketplace-container">

      {/* SEARCH BAR + FILTER + WISHLIST ICON */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
          title="Filters"
        >
          <FaFilter />
        </button>

        {/* Wishlist after filter icon */}
        <button
          className={showWishlistOnly ? "wishlist-icon-btn active" : "wishlist-icon-btn"}
          onClick={() => setShowWishlistOnly((v) => !v)}
          title={showWishlistOnly ? "Showing wishlist" : "Show wishlist"}
          type="button"
        >
          <FaHeart />
          {wishlistIds.length > 0 && (
            <span className="wishlist-badge">{wishlistIds.length}</span>
          )}
        </button>
      </div>

      {/* CATEGORY PILL BAR */}
      <div className="category-pill-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`category-pill${category === cat.value ? " active" : ""}`}
            onClick={() => setCategory(cat.value)}
            type="button"
          >
            <span className="category-pill-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* FILTER POPUP */}
      {showFilters && (
        <div className="filter-popup" ref={filterRef}>
          <h4>Filters</h4>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Hostel Essentials">Hostel Essentials</option>
            <option value="Others">Others</option>
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <button className="clear-filter-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Wishlist helper text */}
      {showWishlistOnly && (
        <p className="wishlist-hint">
          Showing your wishlist items only.{" "}
          <button
            className="wishlist-clearview"
            onClick={() => setShowWishlistOnly(false)}
            type="button"
          >
            Show all
          </button>
        </p>
      )}

      {/* ITEMS GRID */}
      {loading ? (
        <p className="no-items">Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="no-items">
          {showWishlistOnly ? "Your wishlist is empty." : "No matching items found."}
        </p>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div key={item._id} className="item-card">
              {/* Card heart */}
              <button
                className={isWishlisted(item._id) ? "wish-btn active" : "wish-btn"}
                onClick={() => toggleWishlist(item._id)}
                title={isWishlisted(item._id) ? "Remove from wishlist" : "Add to wishlist"}
                type="button"
              >
                {isWishlisted(item._id) ? <FaHeart /> : <FaRegHeart />}
              </button>

              {item.image && (
                <div className="item-image-container">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                  />
                </div>
              )}

              <div className="item-content-wrapper">
                <div className="item-header-row">
                  <h3 className="item-title-text">{item.title}</h3>
                  <p className="item-price-text">₹ {item.price}</p>
                </div>

                <div
                  className="seller-badge-container cursor-pointer hover:bg-blue-50 transition border-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/seller/${item.user?._id || item.user}`);
                  }}
                  title="View Seller Profile"
                >
                  <div className="seller-avatar-small">
                    {item.user?.profilePic ? (
                      <img
                        src={getImageUrl(item.user.profilePic)}
                        alt={item.user.name}
                      />
                    ) : (
                      <div className="avatar-placeholder-char">
                        {item.user?.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="seller-name-label" style={{ fontWeight: 600 }}>{item.user?.name || "Seller"}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>★ {item.user?.averageRating || 0}</span> • {item.user?.sellerLevel || "New Seller"}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="buy-btn-small" style={{ flex: 1, backgroundColor: "#f3f4f6", color: "#ffffffff" }} onClick={(e) => handleAddToCart(e, item._id)} disabled={addingIds[item._id]}>
                    {addingIds[item._id] ? "Adding..." : "🛒 Cart"}
                  </button>
                  <button className="buy-btn-small" style={{ flex: 1 }} onClick={() => viewItem(item)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Marketplace;