import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

function Admin() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-grid">
        <div className="admin-card" onClick={() => navigate("/admin/hostels")}>
          <h2>Manage Hostels</h2>
          <p>Add, Edit or Remove Hostel Listings</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/items")}>
          <h2>Manage Items</h2>
          <p>Remove or Control Marketplace Listings</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/users")}>
          <h2>Manage Users</h2>
          <p>View User Profiles and Products</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/reports")}>
          <h2>Manage Reports</h2>
          <p>Review User and Item Flags</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/messages")}>
          <h2>Manage Messages</h2>
          <p>View and Search System Messages</p>
        </div>
      </div>
    </div>
  );
}

export default Admin;