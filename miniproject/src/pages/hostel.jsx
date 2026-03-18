import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/hostel.css";

function Hostel() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadHostels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("hostels");
      setHostels(response.data);
    } catch (err) {
      console.error("Failed to load hostels:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHostels();
  }, [loadHostels]);

  const viewHostel = (hostel) => {
    localStorage.setItem("selectedHostelId", hostel._id);
    navigate("/hostel-details");
  };

  return (
    <div className="hostel-container">
      {loading ? (
        <p className="no-items">Loading hostels...</p>
      ) : hostels.length === 0 ? (
        <p className="no-items">No hostels added yet.</p>
      ) : (
        <div className="hostel-grid">
          {hostels.map((hostel) => {
            const thumbnail = hostel.images?.[0] || "";
            const isAvailable = hostel.status !== "full";

            return (
              <div
                key={hostel._id}
                className="hostel-card"
                onClick={() => viewHostel(hostel)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") viewHostel(hostel);
                }}
              >
                {/* Image Section */}
                <div className="hostel-image-wrapper">
                  {/* Status Badge */}
                  <div
                    className={`hostel-status-badge ${
                      isAvailable ? "available" : "full"
                    }`}
                  >
                    <span>
                      {isAvailable ? "📍 Available" : "❌ Full"}
                    </span>
                  </div>

                  {/* Main Image */}
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={hostel.name}
                      className="hostel-thumb"
                    />
                  ) : (
                    <div className="hostel-thumb placeholder">
                      📷 No Image Available
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="hostel-card-content">
                  {/* Name */}
                  <h3>{hostel.name}</h3>

                  {/* Location */}
                  <div className="hostel-location">
                    📍 {hostel.location || "Location not specified"}
                  </div>

                  {/* Rent Section */}
                  <div className="rent-section">
                    <span className="rent">₹{hostel.rent || "N/A"}</span>
                    <span className="rent-label">/ month</span>
                  </div>

                  {/* Quick Info */}
                  <div className="quick-info">
                    {hostel.roomType && (
                      <div className="quick-info-item">
                        <span className="quick-info-item-icon">🛏️</span>
                        <span>{hostel.roomType}</span>
                      </div>
                    )}
                    {hostel.capacity && (
                      <div className="quick-info-item">
                        <span className="quick-info-item-icon">👥</span>
                        <span>{hostel.capacity} capacity</span>
                      </div>
                    )}
                    {hostel.availableRooms && (
                      <div className="quick-info-item">
                        <span className="quick-info-item-icon">🔑</span>
                        <span>{hostel.availableRooms} available</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button className="view-details-btn">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}

export default Hostel;