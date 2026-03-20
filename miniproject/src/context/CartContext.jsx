import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    if (!user) {
        setCartItems([]);
        return;
    }
    try {
      const { data } = await api.get("cart");
      setCartItems(data || []);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addToCart = async (itemId) => {
    try {
      await api.post("cart/add", { itemId });
      await fetchCart(); // guarantee freshly populated objects
      return { success: true };
      
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Failed to add to cart" };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`cart/remove/${itemId}`);
      await fetchCart(); // guarantee freshly populated objects
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Failed to remove" };
    }
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, fetchCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
