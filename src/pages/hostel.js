import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/hostel.css";

function Hostel() {

  const [hostels, setHostels] = useState([]);
  const navigate = useNavigate();

  const loadHostels = useCallback(() => {

    const storedHostels =
      JSON.parse(localStorage.getItem("hostels")) || [];

    setHostels(storedHostels);

  }, []);

  useEffect(() => {

    loadHostels();

    // reload after admin updates / returning to tab
    window.addEventListener("focus", loadHostels);
    return () =>
      window.removeEventListener("focus", loadHostels);

  }, [loadHostels]);

  const viewHostel = (hostel) => {

    localStorage.setItem(
      "selectedHostelId",
      hostel.id
    );

    navigate("/hostel-details");
  };

  return (
    <div className="hostel-container">

      <h2 className="page-title">
        Nearby Hostels & PGs
      </h2>

      {hostels.length === 0 ? (
        <p className="no-items">
          No hostels added yet.
        </p>
      ) : (
        <div className="hostel-grid">

          {hostels.map((hostel) => {

            const thumbnail =
              hostel.images?.[0] || "";

            return (
              <div
                key={hostel.id}
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
                  <div className="hostel-thumb placeholder">
                    No Image
                  </div>
                )}

                <h3>{hostel.name}</h3>

                <p className="rent">
                  ₹ {hostel.rent} / month
                </p>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Hostel;