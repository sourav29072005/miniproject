import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, User } from "lucide-react";
import { getImageUrl } from "../utils/urlHelper";
import "../styles/cart.css";

function Cart() {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Group by seller
  const sellerGroups = useMemo(() => {
    if (!cartItems) return {};
    const groups = {};
    cartItems.forEach(item => {
      const sellerId = item.user?._id || "unknown";
      if (!groups[sellerId]) {
        groups[sellerId] = {
          seller: item.user || { name: "Unknown Seller" },
          items: [],
          total: 0
        };
      }
      groups[sellerId].items.push(item);
      groups[sellerId].total += Number(item.price);
    });
    return groups;
  }, [cartItems]);

  const checkoutGroup = (group) => {
    localStorage.setItem("paymentItems", JSON.stringify(group.items.map(i => ({
      itemId: i._id,
      price: i.price,
      title: i.title,
      sellerId: i.user?._id || i.user
    }))));
    navigate("/payment");
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page-bg flex items-center justify-center p-6">
        <div className="empty-cart-container w-full">
          <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <ShoppingBag size={48} className="text-indigo-400" />
            <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Your cart is empty</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
            Looks like you haven't added any items yet. Discover amazing deals in the marketplace.
          </p>
          <button 
            onClick={() => navigate("/marketplace")}
            className="premium-checkout-btn mx-auto text-lg px-8 py-4"
          >
            Start Shopping <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-bg">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl cart-header-title mb-1">Shopping Cart</h1>
            <p className="text-slate-500 text-sm md:text-base">
              You have <span className="font-semibold text-slate-700">{cartItems.length} items</span> waiting for checkout.
            </p>
          </div>
          <button 
            onClick={() => navigate("/marketplace")}
            className="back-to-shop-btn w-full md:w-auto justify-center"
          >
            Continue Shopping
          </button>
        </div>

        {/* Global Security Badge */}
        <div className="flex items-center gap-1.5 mb-6 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100 max-w-fit">
          <ShieldCheck size={18} />
          <span className="text-xs font-medium">Safe & Secure grouped checkouts. Your money is protected.</span>
        </div>

        {/* Seller Groups Grid */}
        <div className="grid gap-6">
          {Object.values(sellerGroups).map((group, index) => (
            <div key={index} className="seller-group-card">
              
              {/* Premium Seller Header */}
              <div className="seller-header-banner flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full shadow-md border-2 border-white overflow-hidden bg-white">
                    {group.seller.profilePic ? (
                      <img src={getImageUrl(group.seller.profilePic)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Seller Package</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-800 truncate">{group.seller.name || "Seller Name"}</h3>
                  </div>
                </div>
                
                {/* Visual Connector / Badge */}
                <div className="inline-flex sm:flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 font-semibold text-[11px] md:text-xs mt-3 sm:mt-0">
                  {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'} Group
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col">
                {group.items.map((item, i) => (
                  <div key={item._id} className="cart-item-row gap-4 md:gap-5">
                    <div className="item-img-container cursor-pointer" onClick={() => {
                        localStorage.setItem("selectedItemId", item._id);
                        navigate('/item-details');
                    }}>
                      {(item.images?.length > 0 || item.image) ? (
                        <img 
                          src={getImageUrl(item.images?.[0] || item.image)} 
                          alt={item.title} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:gap-3 mb-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer pr-2"
                              onClick={() => {
                                localStorage.setItem("selectedItemId", item._id);
                                navigate('/item-details');
                              }}>
                            {item.title}
                          </h3>
                          <p className="text-base sm:text-lg font-extrabold text-slate-900 whitespace-nowrap mt-1 sm:mt-0">₹ {item.price}</p>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 md:line-clamp-2 leading-relaxed">{item.description || "No description provided."}</p>
                      </div>
                      
                      <div className="flex items-end justify-between mt-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          In Stock
                        </span>
                        
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="remove-item-btn"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Action Bar */}
              <div className="checkout-action-bar flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex flex-col w-full sm:w-auto">
                  <span className="text-[11px] md:text-xs font-semibold text-slate-500 mb-0.5">Package Subtotal</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl md:text-2xl font-extrabold text-slate-900">₹ {group.total.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => checkoutGroup(group)}
                  className="premium-checkout-btn w-full sm:w-auto justify-center"
                >
                  Checkout {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Cart;
