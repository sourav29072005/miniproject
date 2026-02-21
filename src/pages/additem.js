import { useState } from "react";
import "../styles/additem.css";

function AddItem() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [preview, setPreview] = useState("");
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    if (!preview) {
      alert("Please upload an image!");
      return;
    }

    const newItem = {
      id: Date.now(),
      title,
      description,
      price: Number(price),
      category,
      image: preview,
      seller: user.email,
      status: "available"   // 🔥 VERY IMPORTANT
    };

    const existingItems =
      JSON.parse(localStorage.getItem("items")) || [];

    const updatedItems = [...existingItems, newItem];

    localStorage.setItem("items", JSON.stringify(updatedItems));

    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 2000);

    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setPreview("");
  };

  return (

    <div className="additem-wrapper">

      <div className="additem-container">

        <h2 className="page-title">Add New Item</h2>

        {success && (
          <div className="success-message">
            Item added successfully!
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="additem-form"
        >

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
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
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
          >
            Submit Item
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddItem;