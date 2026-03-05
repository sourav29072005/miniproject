import { useEffect, useState } from "react";
import "../styles/myitems.css";

function MyItems() {

  const [myItems, setMyItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [updateConfirmItem, setUpdateConfirmItem] = useState(null);

  const loadMyItems = () => {

    const user = JSON.parse(localStorage.getItem("user"));
    const items = JSON.parse(localStorage.getItem("items")) || [];

    if (!user) return;

    const filteredItems = items.filter(
      (item) => item.seller === user.email
    );

    setMyItems(filteredItems);
  };

  useEffect(() => {
    loadMyItems();
  }, []);

  // ✅ DELETE / REMOVE
  const confirmDelete = () => {

    const items = JSON.parse(localStorage.getItem("items")) || [];

    const updatedItems = items.filter(
      (item) => item.id !== deleteId
    );

    localStorage.setItem("items", JSON.stringify(updatedItems));

    setDeleteId(null);
    loadMyItems();
  };

  // ✅ UPDATE
  const confirmUpdate = () => {

    const items = JSON.parse(localStorage.getItem("items")) || [];

    const updatedItems = items.map((item) =>
      item.id === updateConfirmItem.id
        ? { ...updateConfirmItem }
        : item
    );

    localStorage.setItem("items", JSON.stringify(updatedItems));

    setEditingItem(null);
    setUpdateConfirmItem(null);
    loadMyItems();
  };

  return (
    <div className="myitems-container">

      

      {/* EDIT FORM */}
      {editingItem && (
        <div className="edit-card">

          <h3>Edit Item</h3>

          <input
            type="text"
            value={editingItem.title}
            onChange={(e) =>
              setEditingItem({
                ...editingItem,
                title: e.target.value
              })
            }
          />

          <input
            type="text"
            value={editingItem.description}
            onChange={(e) =>
              setEditingItem({
                ...editingItem,
                description: e.target.value
              })
            }
          />

          <input
            type="number"
            value={editingItem.price}
            onChange={(e) =>
              setEditingItem({
                ...editingItem,
                price: e.target.value
              })
            }
          />

          <div className="edit-buttons">

            <button
              className="update-btn"
              onClick={() => setUpdateConfirmItem(editingItem)}
            >
              Update
            </button>

            <button
              className="cancel-btn"
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* ITEMS */}
      {myItems.length === 0 ? (
        <p className="no-items">No items added yet.</p>
      ) : (
        <div className="items-grid">

          {myItems.map((item) => (

            <div key={item.id} className="item-card">

              <div className="image-wrapper">

                <img src={item.image} alt={item.title} />

                {item.status === "sold" && (
                  <span className="sold-badge">
                    SOLD
                  </span>
                )}

              </div>

              <h3>{item.title}</h3>

              <p className="description">
                {item.description}
              </p>

              <p className="price">
                ₹ {item.price}
              </p>

              <p className={
                item.status === "sold"
                  ? "status-sold"
                  : "status-available"
              }>
                {item.status === "sold"
                  ? "Status: Unavailable"
                  : "Status: Available"}
              </p>

              <div className="item-actions">

                {item.status !== "sold" && (
                  <button
                    className="edit-btn"
                    onClick={() =>
                      setEditingItem({ ...item }) // 🔥 CLONE
                    }
                  >
                    Edit
                  </button>
                )}

                <button
                  className={
                    item.status === "sold"
                      ? "remove-btn"
                      : "delete-btn"
                  }
                  onClick={() => setDeleteId(item.id)}
                >
                  {item.status === "sold"
                    ? "Remove Listing"
                    : "Delete"}
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="delete-overlay">

          <div className="delete-modal">

            <h3>
              {myItems.find(i => i.id === deleteId)?.status === "sold"
                ? "Remove Sold Listing?"
                : "Delete Item?"}
            </h3>

            <div className="delete-actions">

              <button
                className="confirm-delete"
                onClick={confirmDelete}
              >
                Yes
              </button>

              <button
                className="cancel-delete"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* UPDATE CONFIRM */}
      {updateConfirmItem && (
        <div className="delete-overlay">

          <div className="delete-modal">

            <h3>Confirm Update?</h3>

            <div className="delete-actions">

              <button
                className="confirm-update"
                onClick={confirmUpdate}
              >
                Yes
              </button>

              <button
                className="cancel-delete"
                onClick={() => setUpdateConfirmItem(null)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default MyItems;