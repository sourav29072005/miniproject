import { useEffect, useState } from "react";
import api, { BASE_URL } from "../api";
import { getImageUrl } from "../utils/urlHelper";
import "../styles/hosteldetails.css";

function HostelDetails() {
  const [hostel, setHostel] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostelDetails = async () => {
      const selectedId = localStorage.getItem("selectedHostelId");

      if (!selectedId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`hostels/${selectedId}`);
        const found = response.data;

        if (found) {
          setHostel(found);
        }
      } catch (err) {
        console.error("Failed to fetch hostel details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHostelDetails();
  }, []);

  // Handle body overflow when lightbox opens/closes
  useEffect(() => {
    if (lightboxImg) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("lightbox-open");
    } else {
      document.body.style.overflow = "auto";
      document.body.classList.remove("lightbox-open");
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.classList.remove("lightbox-open");
    };
  }, [lightboxImg]);

  if (loading) {
    return <p className="loading-text">Loading hostel details</p>;
  }

  if (!hostel) {
    return <p className="loading-text">Hostel not found</p>;
  }

  const lightboxIndex = lightboxImg ? hostel.images.findIndex(img => {
    const imgSrc = getImageUrl(img);
    return imgSrc === lightboxImg;
  }) : -1;

  const handleLightboxNext = () => {
    if (hostel.images && hostel.images.length > 0) {
      const nextIdx = (lightboxIndex + 1) % hostel.images.length;
      const img = hostel.images[nextIdx];
      const imgSrc = getImageUrl(img);
      setLightboxImg(imgSrc);
    }
  };

  const handleLightboxPrev = () => {
    if (hostel.images && hostel.images.length > 0) {
      const prevIdx = (lightboxIndex - 1 + hostel.images.length) % hostel.images.length;
      const img = hostel.images[prevIdx];
      const imgSrc = getImageUrl(img);
      setLightboxImg(imgSrc);
    }
  };

  return (
    <div className="hd-container">
      <div className="hd-card">
        {/* ✅ IMAGE GALLERY SECTION */}
        <div className="hd-image-section">
          {/* Cover Image */}
          {hostel.images && hostel.images.length > 0 ? (
            <div className="hd-cover-container">
              <img
                src={getImageUrl(hostel.images[0])}
                alt={hostel.name}
                className="hd-cover-img"
                onClick={() => setLightboxImg(getImageUrl(hostel.images[0]))}
                title="Click to view full size"
              />
            </div>
          ) : (
            <div className="hd-placeholder-full">📷 No Images Available</div>
          )}

          {/* Thumbnail Gallery - Only if more than 1 image */}
          {hostel.images?.length > 1 && (
            <div className="hd-gallery-full">
              {hostel.images.map((img, idx) => {
                const imgSrc = getImageUrl(img);
                return (
                  <img
                    key={idx}
                    src={imgSrc}
                    alt={`hostel-${idx}`}
                    className={idx === 0 ? "hd-thumb-clickable cover-badge" : "hd-thumb-clickable"}
                    onClick={() => setLightboxImg(imgSrc)}
                    style={{ cursor: "pointer" }}
                    title="Click to view full size"
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ✅ INFO SECTION */}
        <div className="hd-info">
          {/* Title and Status */}
          <div className="hd-title-row">
            <div>
              <h2>{hostel.name}</h2>
              <p className="hd-location">📍 {hostel.location}</p>
              {hostel.locationLink && (
                <a
                  href={hostel.locationLink.startsWith('http') ? hostel.locationLink : `https://${hostel.locationLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '5px', fontSize: '0.9rem', color: '#0066cc', textDecoration: 'none', fontWeight: '500' }}
                >
                  🗺️ View on Google Maps
                </a>
              )}
            </div>
            <span
              className={
                hostel.status === "full"
                  ? "hd-badge full"
                  : "hd-badge available"
              }
            >
              {hostel.status === "full" ? "🚫 Full" : "✓ Available"}
            </span>
          </div>

          {/* Price Highlight */}
          <div className="hd-rent">
            <span className="hd-rent-label">Monthly Rent</span>
            <span>₹{hostel.rent}</span>
          </div>

          {/* Quick Info Cards */}
          <div className="hd-quick-info">
            {hostel.availableRooms && (
              <div className="hd-quick-item">
                <div className="hd-quick-item-icon">🔑</div>
                <div className="hd-quick-item-content">
                  <div className="hd-quick-item-label">Available</div>
                  <div className="hd-quick-item-value">{hostel.availableRooms}</div>
                </div>
              </div>
            )}
            <div className="hd-quick-item">
              <div className="hd-quick-item-icon">🚪</div>
              <div className="hd-quick-item-content">
                <div className="hd-quick-item-label">Room Type</div>
                <div className="hd-quick-item-value">{hostel.roomType}</div>
              </div>
            </div>

            <div className="hd-quick-item">
              <div className="hd-quick-item-icon">👥</div>
              <div className="hd-quick-item-content">
                <div className="hd-quick-item-label">Capacity</div>
                <div className="hd-quick-item-value">{hostel.capacity} persons</div>
              </div>
            </div>

            <div className="hd-quick-item">
              <div className="hd-quick-item-icon">🚻</div>
              <div className="hd-quick-item-content">
                <div className="hd-quick-item-label">Hostel Type</div>
                <div className="hd-quick-item-value">{hostel.type || "Common"}</div>
              </div>
            </div>

            <div className="hd-quick-item">
              <div className="hd-quick-item-icon">📞</div>
              <div className="hd-quick-item-content">
                <div className="hd-quick-item-label">Contact</div>
                <div className="hd-quick-item-value">{hostel.contact}</div>
              </div>
            </div>

            {hostel.distanceFromCollege && (
              <div className="hd-quick-item">
                <div className="hd-quick-item-icon">🎓</div>
                <div className="hd-quick-item-content">
                  <div className="hd-quick-item-label">Dist. to College</div>
                  <div className="hd-quick-item-value">{hostel.distanceFromCollege}</div>
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          <p className="hd-line">
            <strong>📮 Full Address:</strong> {hostel.address}
          </p>

          {/* Description Section */}
          <div className="hd-section">
            <h4>📋 Description</h4>
            <p className="hd-desc">{hostel.description}</p>
          </div>

          {/* Facilities Section */}
          <div className="hd-section">
            <h4>⭐ Facilities & Amenities</h4>
            {hostel.facilities && hostel.facilities.length > 0 ? (
              <div className="hd-facilities">
                {hostel.facilities.map((f, i) => (
                  <span key={i} className="hd-chip">
                    ✓ {f}
                  </span>
                ))}
              </div>
            ) : (
              <p className="hd-muted">No specific facilities listed.</p>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div className="hd-lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button
            className="hd-lightbox-close"
            onClick={() => setLightboxImg(null)}
            aria-label="Close lightbox"
          >
            ✕
          </button>
          <div className="hd-lightbox-nav" onClick={(e) => e.stopPropagation()}>
            {hostel.images && hostel.images.length > 1 && (
              <button
                className="hd-lightbox-arrow hd-lightbox-prev"
                onClick={handleLightboxPrev}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            <img src={lightboxImg} alt="Full view" className="hd-lightbox-img" />
            {hostel.images && hostel.images.length > 1 && (
              <button
                className="hd-lightbox-arrow hd-lightbox-next"
                onClick={handleLightboxNext}
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>
          {hostel.images && hostel.images.length > 1 && (
            <div className="hd-lightbox-counter">{lightboxIndex + 1} / {hostel.images.length}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default HostelDetails;