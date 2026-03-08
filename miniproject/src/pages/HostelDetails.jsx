import { useEffect, useState } from "react";
import api, { BASE_URL } from "../api";
import "../styles/hosteldetails.css";

function HostelDetails() {
  const [hostel, setHostel] = useState(null);
  const [activeImage, setActiveImage] = useState("");
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
          const firstImg = found.images?.[0] || "";
          setActiveImage(firstImg.startsWith("data:") ? firstImg : `${BASE_URL}/uploads/${firstImg}`);
        }
      } catch (err) {
        console.error("Failed to fetch hostel details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHostelDetails();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading hostel details...</p>;
  }

  if (!hostel) {
    return <p className="loading-text">Hostel not found.</p>;
  }

  return (
    <div className="hd-container">
      <div className="hd-card">
        {/* ✅ MAIN IMAGE */}
        {activeImage ? (
          <img src={activeImage} alt={hostel.name} className="hd-main-img" />
        ) : (
          <div className="hd-main-img hd-placeholder">No Image</div>
        )}

        {/* ✅ THUMBNAIL GALLERY */}
        {hostel.images?.length > 1 && (
          <div className="hd-gallery">
            {hostel.images.map((img, idx) => {
              const imgSrc = img.startsWith("data:") ? img : `${BASE_URL}/uploads/${img}`;
              return (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={`hostel-${idx}`}
                  className={imgSrc === activeImage ? "hd-thumb active" : "hd-thumb"}
                  onClick={() => setActiveImage(imgSrc)}
                />
              );
            })}
          </div>
        )}

        <div className="hd-info">
          <div className="hd-title-row">
            <h2>{hostel.name}</h2>

            <span
              className={
                hostel.status === "full"
                  ? "hd-badge full"
                  : "hd-badge available"
              }
            >
              {hostel.status === "full" ? "FULL" : "AVAILABLE"}
            </span>
          </div>

          <p className="hd-location">📍 {hostel.location}</p>

          <p className="hd-rent">₹ {hostel.rent} / month</p>

          {/* ✅ NEW FIELDS */}
          <p className="hd-line">
            <strong>Address:</strong> {hostel.address}
          </p>

          <p className="hd-line">
            <strong>Contact:</strong> {hostel.contact}
          </p>

          <p className="hd-line">
            <strong>Room Type:</strong> {hostel.roomType}
          </p>

          <p className="hd-line">
            <strong>Capacity:</strong> {hostel.capacity}
          </p>

          <div className="hd-section">
            <h4>Description</h4>
            <p className="hd-desc">{hostel.description}</p>
          </div>

          <div className="hd-section">
            <h4>Facilities</h4>

            {hostel.facilities && hostel.facilities.length > 0 ? (
              <div className="hd-facilities">
                {hostel.facilities.map((f, i) => (
                  <span key={i} className="hd-chip">
                    {f}
                  </span>
                ))}
              </div>
            ) : (
              <p className="hd-muted">No facilities listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostelDetails;