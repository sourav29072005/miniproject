import { useEffect, useState } from "react";
import "../styles/hosteldetails.css";

function HostelDetails() {

  const [hostel, setHostel] = useState(null);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {

    const selectedId =
      Number(localStorage.getItem("selectedHostelId"));

    const hostels =
      JSON.parse(localStorage.getItem("hostels")) || [];

    const found = hostels.find(
      (h) => h.id === selectedId
    );

    if (found) {
      setHostel(found);
      setActiveImage(found.images?.[0] || "");
    } else {
      setHostel(null);
    }

  }, []);

  if (!hostel) {
    return <p>Loading...</p>;
  }

  return (
    <div className="hd-container">

      <div className="hd-card">

        {/* ✅ MAIN IMAGE */}
        {activeImage ? (
          <img
            src={activeImage}
            alt={hostel.name}
            className="hd-main-img"
          />
        ) : (
          <div className="hd-main-img hd-placeholder">
            No Image
          </div>
        )}

        {/* ✅ THUMBNAIL GALLERY */}
        {hostel.images?.length > 1 && (
          <div className="hd-gallery">
            {hostel.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`hostel-${idx}`}
                className={
                  img === activeImage
                    ? "hd-thumb active"
                    : "hd-thumb"
                }
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
        )}

        <div className="hd-info">

          <div className="hd-title-row">
            <h2>{hostel.name}</h2>

            <span className={
              hostel.status === "full"
                ? "hd-badge full"
                : "hd-badge available"
            }>
              {hostel.status === "full" ? "FULL" : "AVAILABLE"}
            </span>
          </div>

          <p className="hd-location">
            📍 {hostel.location}
          </p>

          <p className="hd-rent">
            ₹ {hostel.rent} / month
          </p>

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
            <p className="hd-desc">
              {hostel.description}
            </p>
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