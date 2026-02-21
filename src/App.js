import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login";
import Marketplace from "./pages/marketplace";
import AddItem from "./pages/additem";
import Hostels from "./pages/hostel";
import MyItems from "./pages/myitems";
import ItemDetails from "./pages/ItemDetails";
import DashboardLayout from "./layouts/DashboardLayout";
import Success from "./pages/success";
import Payment from "./pages/payment";

import Admin from "./pages/admin";
import AdminHostels from "./pages/AdminHostels";
import AdminItems from "./pages/AdminItems";

import HostelDetails from "./pages/HostelDetails";

import "./styles/global.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setIsLoggedIn(true);
      setIsAdmin(user.role === "admin");
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }

    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ PUBLIC ROUTES */}
        {!isLoggedIn && (
          <>
            <Route
              path="/login"
              element={
                <Login setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </>
        )}

        {/* ✅ ADMIN ROUTES */}
        {isLoggedIn && isAdmin && (
          <>
            <Route
              path="/admin"
              element={
                <Admin setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
              }
            />

            <Route path="/admin/hostels" element={<AdminHostels />} />
            <Route path="/admin/items" element={<AdminItems />} />

            {/* ✅ THIS MUST BE HERE (admin can view item details) */}
            <Route path="/admin/item-details" element={<ItemDetails />} />

            {/* If admin hits "/", send to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin" />} />
          </>
        )}

        {/* ✅ NORMAL USER DASHBOARD ROUTES */}
        {isLoggedIn && !isAdmin && (
          <Route
            path="/"
            element={<DashboardLayout setIsLoggedIn={setIsLoggedIn} />}
          >
            <Route index element={<Home />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="add-item" element={<AddItem />} />
            <Route path="hostels" element={<Hostels />} />
            <Route path="hostel-details" element={<HostelDetails />} />
            <Route path="my-items" element={<MyItems />} />
            <Route path="item-details" element={<ItemDetails />} />
            <Route path="payment" element={<Payment />} />
            <Route path="success" element={<Success />} />
          </Route>
        )}

        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;