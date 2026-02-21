import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2 className="logo">CEV CONNECT</h2>

      <nav className="nav-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>

        <Link to="/marketplace" className={location.pathname === "/marketplace" ? "active" : ""}>
          Marketplace
        </Link>

        <Link to="/add-item" className={location.pathname === "/add-item" ? "active" : ""}>
          Sell Item
        </Link>

        <Link to="/hostels" className={location.pathname === "/hostels" ? "active" : ""}>
          Hostels
        </Link>

        <Link to="/my-items" className={location.pathname === "/my-items" ? "active" : ""}>
          My Items
        </Link>
      </nav>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
