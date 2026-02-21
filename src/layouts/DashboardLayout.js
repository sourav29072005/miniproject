import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";
import "../styles/dashboard.css";

function DashboardLayout({ setIsLoggedIn }) {
  return (
    <div className="dashboard-container">
      <Sidebar setIsLoggedIn={setIsLoggedIn} />

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
