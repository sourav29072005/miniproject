import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const linkClasses = (path) =>
    `block px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-primary text-white"
        : "text-secondary hover:bg-gray-100"
    }`;

  return (
    <div className="w-64 bg-white shadow-card flex flex-col p-6">
      {/* Logo */}
    <Link to="/" className="flex items-center gap-2 mb-8">
      <div className="w-8 h-8 bg-primary rounded-md"></div>
      <span className="text-xl font-bold text-primary">CEV CONNECT</span>
   </Link>

      {/* Navigation */}
      <nav className="space-y-2">
        <Link to="/" className={linkClasses("/")}>
          Home
        </Link>

        <Link to="/marketplace" className={linkClasses("/marketplace")}>
          Marketplace
        </Link>

        <Link to="/add-item" className={linkClasses("/add-item")}>
          Sell Item
        </Link>

        <Link to="/hostels" className={linkClasses("/hostels")}>
          Hostels
        </Link>

        <Link to="/my-items" className={linkClasses("/my-items")}>
          My Items
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;