import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login";
import Marketplace from "./pages/marketplace";
import AddItem from "./pages/additem";
import Hostels from "./pages/hostel";
import MyItems from "./pages/myitems";
import EarningsDashboard from "./pages/EarningsDashboard";
import ItemDetails from "./pages/ItemDetails";
import DashboardLayout from "./layouts/DashboardLayout";
import Success from "./pages/success";
import Payment from "./pages/payment";
import Notifications from "./pages/Notifications";
import SetupProfile from "./pages/SetupProfile";
import Cart from "./pages/Cart";

import ChatPage from "./pages/ChatPage";

import Admin from "./pages/admin";
import AdminHostels from "./pages/AdminHostels";
import AdminItems from "./pages/AdminItems";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminMessages from "./pages/AdminMessages";
import HostelDetails from "./pages/HostelDetails";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import SellerProfile from "./pages/SellerProfile";
import "./styles/global.css";

function App() {
  const { isLoggedIn, isAdmin, loading, setIsLoggedIn } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES - Landing & Auth Pages */}
        {!isLoggedIn && (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        )}

        {/* ADMIN ROUTES */}
        {isLoggedIn && isAdmin && (
          <>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hostels"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminHostels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/items"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/item-details"
              element={
                <ProtectedRoute requireAdmin>
                  <ItemDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/admin" />} />
          </>
        )}

        {/* NORMAL USER ROUTES */}
        {isLoggedIn && !isAdmin && (
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout setIsLoggedIn={setIsLoggedIn} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="add-item" element={<AddItem />} />
            <Route path="hostels" element={<Hostels />} />
            <Route path="hostel-details" element={<HostelDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="my-items" element={<MyItems />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="earnings" element={<EarningsDashboard />} />
            <Route path="order-details/:id" element={<OrderDetails />} />
            <Route path="item-details" element={<ItemDetails />} />
            <Route path="payment" element={<Payment />} />
            <Route path="success" element={<Success />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="setup-profile" element={<SetupProfile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="seller/:id" element={<SellerProfile />} />
          </Route>
        )}

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;