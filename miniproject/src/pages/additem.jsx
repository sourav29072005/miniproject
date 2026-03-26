import { useState } from "react";
import api from "../api";
import "../styles/additem.css";

function AddItem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images.");
      return;
    }
    setError("");
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    if (!title.trim() || !description.trim() || !price || !category) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    images.forEach((img) => formData.append("images", img));

    try {
      await api.post("items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setPreviews([]);
      setImages([]);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.details || err.response?.data?.error || "Failed to add item. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="additem-wrapper">
      <div className="additem-container">
        {/* Header Section */}
        <div className="additem-header">
          <h2>Sell Your Item</h2>
          <p className="additem-header-subtitle">
            Create a listing to sell your items to other campus members. Maximum 5 photos allowed.
          </p>
        </div>

        {/* Messages Section */}
        <div className="message-container">
          {success && (
            <div className="success-message">
              Item submitted successfully! Your item is pending admin approval.
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="additem-form">
          
          {/* Category Field */}
          <div className="form-group">
            <label htmlFor="category">
              <span className="icon">📂</span>
              Category
              <span className="required">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Books">📚 Books & Notes</option>
              <option value="Electronics">💻 Electronics</option>
              <option value="Furniture">🪑 Furniture</option>
              <option value="Hostel Essentials">🛏️ Hostel Essentials</option>
              <option value="Others">📦 Others</option>
            </select>
          </div>

          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="title">
              <span className="icon">✏️</span>
              Item Title
              <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Vintage Wooden Chair"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="100"
              required
            />
            <div className="char-count">{title.length}/100 characters</div>
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="description">
              <span className="icon">📝</span>
              Description
              <span className="required">*</span>
            </label>
            <textarea
              id="description"
              placeholder="Describe your item in detail (condition, features, why you're selling, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength="500"
              required
            />
            <div className="char-count">{description.length}/500 characters</div>
          </div>

          {/* Price Field */}
          <div className="form-group">
            <label htmlFor="price">
              <span className="icon">💵</span>
              Price (₹)
              <span className="required">*</span>
            </label>
            <input
              id="price"
              type="number"
              placeholder="Enter price in rupees"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="1"
              min="0"
              max="999999"
            />
          </div>

          {/* Image Upload Field */}
          <div className="upload-section">
            <label className="upload-label" htmlFor="file-input">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              {images.length < 5 && (
                <>
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">
                    <div className="main-text">Click to upload photos</div>
                    <div className="sub-text">Drag and drop or select from your device</div>
                  </div>
                  <div className="upload-counter">{images.length} / 5 Images</div>
                </>
              )}
              {images.length >= 5 && (
                <div className="upload-text" style={{ color: '#0b4db7' }}>
                  <div className="main-text">✓ Maximum images uploaded</div>
                  <div className="sub-text">Click to replace an image</div>
                </div>
              )}
            </label>
          </div>

          {/* Image Preview Section */}
          {previews.length > 0 && (
            <div className="image-preview-container">
              <div className="image-preview-title">
                <span>🖼️</span> Your Photos ({previews.length}/5)
              </div>
              <div className="image-preview">
                {previews.map((src, i) => (
                  <div 
                    key={i} 
                    className={`image-preview-item ${i === 0 ? 'cover-image' : ''}`}
                  >
                    <img src={src} alt={`preview-${i}`} />
                    {i === 0 && (
                      <div className="image-cover-badge">
                        <span>📌</span> Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="remove-image-btn"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {previews.length > 0 && (
                <div className="image-reorder-hint">
                  💡 First image will be shown as cover. Delete and re-upload to reorder.
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Publishing..." : "List Item for Sale"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;