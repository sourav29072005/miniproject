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
  <div className="flex justify-center py-10 bg-background">

    <div className="w-full max-w-xl bg-white p-8 rounded-xl2 shadow-card">

      <h2 className="text-2xl font-semibold text-secondary mb-6">
        Add New Item
      </h2>

      {success && (
        <div className="mb-4 bg-green-100 text-green-700 p-3 rounded-lg text-sm">
          Item added successfully!
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

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
          className="border border-gray-300 rounded-lg p-2"
        />

        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="rounded-lg w-full h-48 object-cover"
            />
          </div>
        )}

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