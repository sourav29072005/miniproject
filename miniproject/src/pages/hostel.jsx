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
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={hostel.name}
                    className="hostel-thumb"
                  />
                ) : (
                  <div className="hostel-thumb placeholder">No Image</div>
                )}

                <h3>{hostel.name}</h3>

                <p className="rent">₹ {hostel.rent} / month</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Hostel;