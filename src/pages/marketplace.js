import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/marketplace.css";
import { FaFilter, FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Marketplace() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const loadItems = () => {
    const storedItems = JSON.parse(localStorage.getItem("items")) || [];
    setItems(storedItems);
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

  const viewItem = (item) => {
    if (item.status === "sold") return; // safety
    localStorage.setItem("selectedItemId", item.id);
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
      .filter((item) => item.status !== "sold") // ✅ hide sold items
      .filter((item) => {
        const title = (item.title || "").toLowerCase();

        const matchesSearch = q === "" || title.includes(q);
        const matchesCategory = category === "" || item.category === category;

        const priceNum = Number(item.price || 0);
        const matchesMin = minPrice === "" || priceNum >= Number(minPrice);
        const matchesMax = maxPrice === "" || priceNum <= Number(maxPrice);

        const matchesWishlist =
          !showWishlistOnly || wishlistIds.includes(item.id);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesMin &&
          matchesMax &&
          matchesWishlist
        );
      });
  }, [items, searchTerm, category, minPrice, maxPrice, showWishlistOnly, wishlistIds]);

  return (
    <div className="marketplace-container">
      <h2 className="page-title">Marketplace</h2>

      {/* SEARCH BAR (unchanged) + FILTER + WISHLIST ICON */}
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

        {/* ✅ Wishlist after filter icon */}
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
      {filteredItems.length === 0 ? (
        <p className="no-items">
          {showWishlistOnly ? "Your wishlist is empty." : "No matching items found."}
        </p>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              {/* Card heart */}
              <button
                className={isWishlisted(item.id) ? "wish-btn active" : "wish-btn"}
                onClick={() => toggleWishlist(item.id)}
                title={isWishlisted(item.id) ? "Remove from wishlist" : "Add to wishlist"}
                type="button"
              >
                {isWishlisted(item.id) ? <FaHeart /> : <FaRegHeart />}
              </button>

              {item.image && <img src={item.image} alt={item.title} />}

              <h3>{item.title}</h3>
              <p className="price">₹ {item.price}</p>

              <button className="buy-btn" onClick={() => viewItem(item)}>
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Marketplace;