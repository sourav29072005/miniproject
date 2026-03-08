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
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add item. Please try again.");
    }
  };

  return (
    <div className="flex justify-center py-10 bg-background">
      <div className="w-full max-w-xl bg-white p-8 rounded-xl2 shadow-card">

        <h2 className="text-2xl font-semibold text-secondary mb-6">
          Add New Item
        </h2>

        {success && (
          <div className="mb-4 bg-blue-100 text-blue-700 p-3 rounded-lg text-sm">
            ✅ Item submitted successfully! Your item is pending admin approval. It will appear in the marketplace once approved.
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Category</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Hostel Essentials">Hostel Essentials</option>
            <option value="Others">Others</option>
          </select>

          <input
            type="text"
            placeholder="Item Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Multi-image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Photos ({images.length}/5) — up to 5 images
            </label>

            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-blue-50 transition">
                <span className="text-3xl mb-1">📷</span>
                <span className="text-sm text-gray-500">Click to add photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border">
                    <img src={src} alt={`preview-${i}`} className="w-full h-24 object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primaryDark transition"
          >
            Submit Item
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddItem;