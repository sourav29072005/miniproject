import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Check, ShoppingCart, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import "../styles/payment.css"; // Kept for any base specific overrides, though Tailwind handles structure

function Payment() {
  const navigate = useNavigate();

  const [method, setMethod] = useState(""); // upi | card | netbanking | cod
  const [handoverLocation, setHandoverLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [processing, setProcessing] = useState(false);

  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Load item information from localStorage
    const paymentItemsStr = localStorage.getItem("paymentItems");
    let itemsToBuy = [];
    
    if (paymentItemsStr) {
      itemsToBuy = JSON.parse(paymentItemsStr);
    } else {
      // Legacy fallback
      const legacyId = localStorage.getItem("paymentItemId");
      if (legacyId) {
        itemsToBuy = [{
          itemId: legacyId,
          sellerId: localStorage.getItem("paymentItemSellerId"),
          price: localStorage.getItem("paymentItemPrice"),
          title: "Item for purchase"
        }];
      }
    }

    if (itemsToBuy.length === 0) {
      navigate("/marketplace");
      return;
    }

    setOrderItems(itemsToBuy);
    setTotalPrice(itemsToBuy.reduce((sum, item) => sum + Number(item.price), 0));
    setChecking(false);
  }, [navigate]);

  const handlePayNow = async () => {
    if (!method) {
      alert("Please select a payment method.");
      return;
    }

    if (!handoverLocation) {
      alert("Please select a handover location.");
      return;
    }

    if (handoverLocation === "Custom Location" && !customLocation.trim()) {
      alert("Please specify your custom handover location.");
      return;
    }

    setProcessing(true);

    try {
      await api.post("orders", {
        items: orderItems,
        handoverLocation,
        customLocation: handoverLocation === "Custom Location" ? customLocation.trim() : undefined,
      });

      // Clear payment info
      localStorage.removeItem("paymentItems");
      localStorage.removeItem("paymentItemId");
      localStorage.removeItem("paymentItemSellerId");
      localStorage.removeItem("paymentItemPrice");
      localStorage.setItem("paymentMethod", method);

      setProcessing(false);
      navigate("/success", { state: { paymentItemId: orderItems[0].itemId } });
    } catch (err) {
      console.error("Order creation failed:", err);
      alert(err.response?.data?.error || "Payment processing failed. Please try again.");
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    if (processing) return;
    navigate("/cart"); 
  };

  if (checking) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orderItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* PROGRESS STEPPER */}
        <div className="mb-10 w-full max-w-3xl mx-auto px-4 md:px-0">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-indigo-600 -z-10 rounded-full"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                <Check size={20} />
              </div>
              <span className="text-sm font-semibold text-indigo-700">Cart</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-600 bg-white text-indigo-600 flex items-center justify-center font-bold shadow-md">
                2
              </div>
              <span className="text-sm font-semibold text-indigo-700">Checkout</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-white text-slate-400 flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-sm font-medium text-slate-500">Success</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 px-6 md:px-10 py-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" /> Secure Checkout
              </h1>
              <p className="text-slate-300 text-sm mt-1">Review your order details and fulfill payment to finish.</p>
            </div>
            <div className="text-left sm:text-right bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-0.5">Total Amount</p>
              <p className="text-2xl font-black text-white">₹ {totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            
            {/* LEFT COLUMN: Summary & Location */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              
              {/* Order Summary */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <ShoppingCart size={22} className="text-indigo-600" /> Order Summary
                </h3>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                  <div className="space-y-4">
                    {orderItems.map((i, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 line-clamp-1 text-base">{i.title}</p>
                          <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">{i.sellerId?.name || "Marketplace Item"}</p>
                        </div>
                        <p className="font-extrabold text-slate-900 whitespace-nowrap text-lg">₹ {i.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Amount Payable</span>
                    <span className="text-3xl font-black text-indigo-700">₹ {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Handover Location */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <MapPin size={22} className="text-indigo-600" /> Handover Details
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
                  {/* Decorative background accent */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                  
                  <label className="block text-sm font-bold text-slate-700 mb-3">Preferred Campus Handover Spot</label>
                  <div className="relative">
                    <select 
                      value={handoverLocation} 
                      onChange={(e) => setHandoverLocation(e.target.value)}
                      disabled={processing}
                      className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium rounded-xl focus:ring-0 focus:border-indigo-500 block p-4 transition-colors cursor-pointer appearance-none outline-none"
                    >
                      <option value="">-- Click to choose location --</option>
                      <option value="Library">📚 Central Library</option>
                      <option value="Main Canteen">☕ Main Canteen</option>
                      <option value="Hostels Gate">🛏️ Hostels Gate</option>
                      <option value="Main Gate">🏛️ Campus Main Gate</option>
                      <option value="Custom Location">📍 Custom Location (Specify Below)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  {handoverLocation === "Custom Location" && (
                    <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Specify Custom Location</label>
                      <input 
                        type="text" 
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="E.g., Computer Science Block Ground Floor"
                        disabled={processing}
                        className="w-full bg-white border-2 border-indigo-200 text-slate-900 font-medium rounded-xl focus:ring-0 focus:border-indigo-500 block p-4 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Payment Methods & Actions */}
            <div className="lg:col-span-5 flex flex-col h-full relative">
              {/* Divider on desktop */}
              <div className="hidden lg:block absolute -left-7 top-0 bottom-0 w-px bg-slate-100"></div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <CreditCard size={22} className="text-indigo-600" /> Payment Method
                </h3>
                <div className="space-y-3">
                  
                  {/* Payment Option Cards */}
                  {[
                    { id: "cod", title: "Cash on Delivery", desc: "Pay seamlessly when you receive the item", popular: true },
                    { id: "upi", title: "UPI Payment", desc: "GPay, PhonePe, Paytm" },
                    { id: "card", title: "Credit / Debit Card", desc: "Visa, MasterCard, RuPay" },
                    { id: "netbanking", title: "Net Banking", desc: "All major banks supported" }
                  ].map((opt) => (
                    <label 
                      key={opt.id} 
                      className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border-2 transition-all hover:shadow-md ${method === opt.id ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === opt.id ? 'border-indigo-600' : 'border-slate-300'}`}>
                            {method === opt.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                          </div>
                          <span className={`font-bold text-[15px] ${method === opt.id ? 'text-indigo-900' : 'text-slate-800'}`}>{opt.title}</span>
                        </div>
                        {opt.popular && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-600 px-2 py-1 rounded-md">Popular</span>
                        )}
                      </div>
                      <p className={`text-xs ml-8 mt-1 font-medium ${method === opt.id ? 'text-indigo-700/80' : 'text-slate-500'}`}>{opt.desc}</p>
                      <input
                        type="radio"
                        name="pay"
                        value={opt.id}
                        checked={method === opt.id}
                        onChange={(e) => setMethod(e.target.value)}
                        disabled={processing}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-10 lg:mt-auto pt-6 border-t border-slate-100">
                <button 
                  className="w-full py-4 rounded-2xl text-lg font-extrabold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-200 transition-transform active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2" 
                  onClick={handlePayNow} 
                  disabled={processing}
                >
                  {processing
                    ? (method === "cod" ? "Finalizing Order..." : "Processing Payment...")
                    : (method === "cod" ? "Place Order 🚀" : "Pay Securely 💳")
                  }
                </button>

                <button 
                  className="w-full mt-4 py-4 rounded-2xl font-bold text-slate-500 bg-white hover:bg-slate-50 border-2 border-slate-200 transition-colors disabled:opacity-50" 
                  onClick={handleCancel} 
                  disabled={processing}
                >
                  Return to Cart
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;