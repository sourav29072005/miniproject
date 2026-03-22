import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";
import "../styles/adminHostels.css";

const FACILITY_OPTIONS = [
  "WiFi",
  "Food",
  "Laundry",
  "Parking",
  "Study Table",
  "AC",
  "Hot Water",
  "Power Backup",
  "24/7 Security",
];

function AdminHostels() {
  const navigate = useNavigate();

  const [hostels, setHostels] = useState([]);

  // form state
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [rent, setRent] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [roomType, setRoomType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [availableRooms, setAvailableRooms] = useState("");
  const [distanceFromCollege, setDistanceFromCollege] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("available");

  // multiple images
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // modals
  const [deleteId, setDeleteId] = useState(null);
  const [saveConfirm, setSaveConfirm] = useState(false);

  const loadHostels = async () => {
    try {
      const response = await api.get("hostels");
      setHostels(response.data);
    } catch (err) {
      console.error("Failed to load hostels:", err);
    }
  };

  useEffect(() => {
    // protect route so only admin can access
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadHostels();
  }, [navigate]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setRent("");
    setLocation("");
    setAddress("");
    setContact("");
    setRoomType("");
    setCapacity("");
    setAvailableRooms("");
    setDistanceFromCollege("");
    setLocationLink("");
    setFacilities([]);
    setDescription("");
    setStatus("available");
    setImages([]);
    setImagePreviews([]);
    setSaveConfirm(false);
  };

  const toggleFacility = (facility) => {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  // ✅ APPEND images (so selecting again adds more, doesn't replace)
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    ).then((base64List) => {
      setImages((prev) => [...prev, ...base64List]);
      setImagePreviews((prev) => [...prev, ...base64List]);

      // ✅ allow selecting same file again later
      e.target.value = "";
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImages([]);
    setImagePreviews([]);
  };

  const startEdit = (hostel) => {
    setEditingId(hostel._id);
    setName(hostel.name || "");
    setRent(hostel.rent ?? "");
    setLocation(hostel.location || "");
    setAddress(hostel.address || "");
    setContact(hostel.contact || "");
    setRoomType(hostel.roomType || "");
    setCapacity(hostel.capacity || "");
    setAvailableRooms(hostel.availableRooms || "");
    setDistanceFromCollege(hostel.distanceFromCollege || "");
    setLocationLink(hostel.locationLink || "");
    setFacilities(hostel.facilities || []);
    setDescription(hostel.description || "");
    setStatus(hostel.status || "available");

    const imgs = hostel.images || [];
    setImages(imgs);
    setImagePreviews(imgs);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    if (!name.trim()) return "Please enter hostel name.";
    if (!rent || Number(rent) <= 0) return "Please enter a valid rent.";
    if (!location.trim()) return "Please enter location.";
    if (!address.trim()) return "Please enter address.";
    if (!contact.trim()) return "Please enter contact number.";
    if (!roomType.trim()) return "Please enter room type.";
    if (!capacity.trim()) return "Please enter capacity.";
    if (!description.trim()) return "Please enter description.";
    if (!images || images.length === 0) return "Please upload at least one image.";
    return null;
  };

  const openSaveConfirm = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    setSaveConfirm(true);
  };

  const saveHostel = async () => {
    const hostelData = {
      name: name.trim(),
      rent: Number(rent),
      location: location.trim(),
      address: address.trim(),
      contact: contact.trim(),
      roomType: roomType.trim(),
      capacity: capacity.trim(),
      availableRooms: availableRooms.trim(),
      distanceFromCollege: distanceFromCollege.trim(),
      locationLink: locationLink.trim(),
      facilities,
      description: description.trim(),
      images,
      status,
    };

    try {
      if (editingId) {
        await api.put(`hostels/${editingId}`, hostelData);
      } else {
        await api.post("hostels", hostelData);
      }
      setSaveConfirm(false);
      resetForm();
      loadHostels();
    } catch (err) {
      console.error("Failed to save hostel:", err);
      alert("Failed to save hostel.");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`hostels/${deleteId}`);
      setDeleteId(null);
      loadHostels();
    } catch (err) {
      console.error("Failed to delete hostel:", err);
      alert("Failed to delete hostel.");
    }
  };

  return (
    <div className="ah-container">
      <div className="ah-header">
        <h2 className="ah-title">Manage Hostels</h2>
        <button className="ah-back" onClick={() => navigate("/admin")}>
          Back to Admin
        </button>
      </div>

      {/* FORM */}
      <div className="ah-card">
        <h3 className="ah-subtitle">
          {editingId ? "Edit Hostel" : "Add New Hostel"}
        </h3>

        <form className="ah-form" onSubmit={openSaveConfirm}>
          <div className="ah-grid">
            <div className="ah-field">
              <label>Hostel Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="ah-field">
              <label>Rent (per month)</label>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
              />
            </div>

            <div className="ah-field">
              <label>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="ah-field">
              <label>Contact Number</label>
              <input value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>

            <div className="ah-field ah-span2">
              <label>Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="ah-field">
              <label>Room Type</label>
              <input
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="Single / Double / Shared"
              />
            </div>

            <div className="ah-field">
              <label>Capacity</label>
              <input
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g., 4 per room"
              />
            </div>

            <div className="ah-field">
              <label>Available Rooms</label>
              <input
                value={availableRooms}
                onChange={(e) => setAvailableRooms(e.target.value)}
                placeholder="e.g., 2 rooms (4 beds)"
              />
            </div>

            <div className="ah-field">
              <label>Distance from College</label>
              <input
                value={distanceFromCollege}
                onChange={(e) => setDistanceFromCollege(e.target.value)}
                placeholder="e.g., 2.5 km"
              />
            </div>

            <div className="ah-field">
              <label>Location Link (Google Maps)</label>
              <input
                value={locationLink}
                onChange={(e) => setLocationLink(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="ah-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="available">Available</option>
                <option value="full">Full</option>
              </select>
            </div>

            <div className="ah-field ah-span2">
              <label>Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="ah-field ah-span2">
              <label>Facilities</label>
              <div className="ah-facilities">
                {FACILITY_OPTIONS.map((f) => (
                  <button
                    type="button"
                    key={f}
                    className={facilities.includes(f) ? "chip chip-on" : "chip"}
                    onClick={() => toggleFacility(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="ah-field ah-span2">
              <label>Upload Images (multiple)</label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />

              {imagePreviews.length > 0 && (
                <>
                  <div className="ah-previews">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="ah-preview-wrap">
                        <img src={src} alt={`preview-${idx}`} />
                        <button
                          type="button"
                          className="ah-remove-img"
                          onClick={() => removeImage(idx)}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={clearImages}
                    >
                      Clear Images
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="ah-actions">
            <button className="btn-primary" type="submit">
              {editingId ? "Save Changes" : "Add Hostel"}
            </button>
            <button className="btn-ghost" type="button" onClick={resetForm}>
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="ah-list">
        <h3 className="ah-subtitle">All Hostels</h3>

        {hostels.length === 0 ? (
          <p className="ah-empty">No hostels added yet.</p>
        ) : (
          <div className="ah-grid-list">
            {hostels.map((h) => (
              <div key={h._id} className="ah-hostel">
                <div className="ah-thumb">
                  {/* Since backend schema for hostels might be different, 
                      let's assume images are base64 if they start with data:, otherwise use uploads */}
                  <img
                    src={h.images && h.images[0] ? (h.images[0].startsWith("data:") ? h.images[0] : `${BASE_URL}/uploads/${h.images[0]}`) : ""}
                    alt={h.name}
                  />
                  <span className={h.status === "full" ? "badge badge-full" : "badge badge-avail"}>
                    {h.status === "full" ? "FULL" : "AVAILABLE"}
                  </span>
                </div>

                <div className="ah-info">
                  <h4 className="ah-name">{h.name}</h4>
                  <p className="ah-meta">₹ {h.rent} / month</p>
                  <p className="ah-meta">📍 {h.location}</p>
                </div>

                <div className="ah-row-actions">
                  <button className="btn-small" onClick={() => startEdit(h)}>
                    Edit
                  </button>
                  <button className="btn-small danger" onClick={() => setDeleteId(h._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SAVE CONFIRM MODAL */}
      {saveConfirm && (
        <div className="ah-overlay">
          <div className="ah-modal">
            <h3>{editingId ? "Confirm Save Changes?" : "Confirm Add Hostel?"}</h3>
            <p>This will update the hostel directory.</p>

            <div className="ah-modal-actions">
              <button className="btn-small" onClick={() => setSaveConfirm(false)}>
                Cancel
              </button>
              <button className="btn-small primary" onClick={saveHostel}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="ah-overlay">
          <div className="ah-modal">
            <h3>Delete Hostel?</h3>
            <p>This hostel will be permanently removed.</p>

            <div className="ah-modal-actions">
              <button className="btn-small" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn-small danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHostels;