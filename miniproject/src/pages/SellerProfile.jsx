import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { getImageUrl } from "../utils/urlHelper";
import { ArrowLeft, User as UserIcon, Package, MessageCircle, Star, Flag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ReportModal from "../components/ReportModal";
import "./sellerprofile.css";

function SellerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [items, setItems] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("listings");
    const [showReportModal, setShowReportModal] = useState(false);
    const { user } = useAuth();
    
    // Safety check - if this is the currently logged in user, don't show the contact button
    const isCurrentUser = user && user.id === id;

    useEffect(() => {
        const fetchSellerData = async () => {
            console.log(`[SellerProfile] Fetching data for ID: ${id}`);
            try {
                setLoading(true);
                
                // Fetch basic profile first as it's critical
                const profileRes = await api.get(`auth/profile/${id}`);
                console.log("[SellerProfile] Profile data received:", profileRes.data);
                
                if (profileRes.data && profileRes.data.user) {
                    setSeller(profileRes.data.user);
                } else {
                    console.error("[SellerProfile] Profile response missing user object:", profileRes.data);
                }

                // Fetch items and reviews in parallel as they are secondary
                try {
                    const [itemsRes, reviewRes] = await Promise.all([
                        api.get(`items/user/${id}`),
                        api.get(`reviews/${id}`)
                    ]);
                    setItems(itemsRes.data || []);
                    setReviews(reviewRes.data || []);
                    console.log("[SellerProfile] Secondary data loaded:", { items: itemsRes.data?.length, reviews: reviewRes.data?.length });
                } catch (secondaryErr) {
                    console.warn("[SellerProfile] Failed to load secondary data (items/reviews):", secondaryErr);
                }

            } catch (err) {
                console.error("[SellerProfile] CRITICAL: Failed to fetch seller profile:", err);
                if (err.response?.status === 401) {
                    console.error("[SellerProfile] 401 Unauthorized - logic check: Is this route protected?");
                }
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchSellerData();
    }, [id]);

    const viewItem = (itemId) => {
        localStorage.setItem("selectedItemId", itemId);
        navigate("/item-details");
    };

    const handleContactSeller = async () => {
        const targetId = seller?.id || seller?._id;
        
        if (!seller || !targetId) {
            console.error("[SellerProfile] Cannot start chat: Seller ID missing.", { seller });
            alert("Seller information is still loading. Please try again in a moment.");
            return;
        }

        console.log(`[SellerProfile] Starting chat with recipientId: ${targetId}`);
        try {
            const res = await api.post("chat/start", { recipientId: targetId });
            navigate(`/chat?convo=${res.data._id}`);
        } catch (err) {
            console.error("[SellerProfile] Failed to start chat", err);
            const errorMsg = err.response?.data?.error || "Failed to connect to seller.";
            alert(`${errorMsg} (Recipient ID: ${targetId})`);
        }
    };

    if (loading) return (
        <div className="profile-page-container items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (!seller) return (
        <div className="profile-page-container items-center justify-center">
            <p className="text-gray-500">Seller not found.</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold flex items-center gap-2">
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
    );

    const initials = seller.name
        ? seller.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : seller.email.substring(0, 2).toUpperCase();

    return (
        <div className="bg-white min-h-screen pb-16 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                
                {/* Back Navigation */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-10 font-bold tracking-tight"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {/* Top Section: Profile Header & Stats */}
                <div className="flex flex-col md:flex-row gap-10 items-start pb-12 mb-12 border-b border-gray-100">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-44 md:h-44 flex-shrink-0 rounded-full overflow-hidden bg-gray-50 border-4 border-gray-100 shadow-sm relative">
                        {seller.profilePic ? (
                            <img
                                src={getImageUrl(seller.profilePic)}
                                alt={seller.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-gray-300">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full relative">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
                                    {seller.name}
                                </h1>

                            </div>
                            
                            {!isCurrentUser && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleContactSeller}
                                        className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                    >
                                        <MessageCircle size={18} /> Message Seller
                                    </button>
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-3 rounded-full hover:bg-red-50"
                                        title="Report this user"
                                    >
                                        <Flag size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Flat Core Stats */}
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-6 pt-2">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Seller Level</p>
                                <p className="text-gray-900 font-extrabold text-xl capitalize">{seller.sellerLevel || 'New Seller'}</p>
                            </div>
                            <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Rating</p>
                                <p className="flex items-center gap-1.5 text-gray-900 font-extrabold text-xl">
                                    <Star size={20} className="fill-current text-yellow-500" /> 
                                    {seller.averageRating ? seller.averageRating.toFixed(1) : '0.0'}
                                    <span className="text-sm font-medium text-gray-400 ml-1 mt-0.5">({seller.totalReviews || 0})</span>
                                </p>
                            </div>
                            {seller.department && (
                                <>
                                <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Department</p>
                                    <p className="text-gray-900 font-extrabold text-xl">{seller.department}</p>
                                </div>
                                </>
                            )}
                        </div>

                        {/* Minimalist Bio Quote Box */}
                        <div className="mt-8 max-w-2xl bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2 flex items-center gap-2">
                                <UserIcon size={12} /> About Seller
                            </p>
                            <p className="text-gray-700 leading-relaxed font-serif text-lg italic">
                                "{seller.bio || "Hello, I am a student looking to sell and buy items here. I don't have a bio yet!"}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Standardized Tabs */}
                <div className="flex items-center gap-8 mb-8 border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('listings')}
                        className={`pb-4 text-base font-bold transition-all ${activeTab === 'listings' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Active Listings ({items.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 text-base font-bold transition-all ${activeTab === 'reviews' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Buyer Reviews ({reviews.length})
                    </button>
                </div>

                {/* Main Sections Tab Content */}
                <div className="flex flex-col gap-16">
                    
                    {/* Active Listings List */}
                    {activeTab === 'listings' && (
                    <div className="w-full">
                        {items.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                                <Package size={48} className="mx-auto mb-4 opacity-20 text-gray-600" />
                                <p className="font-semibold text-lg text-gray-500 mb-1">No Listings Actively Available</p>
                                <p className="text-sm">This seller currently has no items for sale.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {items.map(item => (
                                    <div
                                        key={item._id}
                                        className="flex flex-col group cursor-pointer"
                                        onClick={() => viewItem(item._id)}
                                    >
                                        <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-sm relative transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="px-1">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors" title={item.title}>
                                                    {item.title}
                                                </h3>
                                                <p className="font-black text-gray-900 text-lg">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 mt-1 pb-1">
                                                {item.category}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Buyer Reviews List */}
                    {activeTab === 'reviews' && (
                    <div className="w-full mb-10">
                        {reviews.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <MessageCircle size={48} className="mx-auto mb-4 opacity-20 text-gray-600" />
                                <p className="font-semibold text-lg text-gray-500">No reviews found</p>
                                <p className="text-sm text-gray-400">There are no reviews yet for this seller.</p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {reviews.map((review, i) => (
                                    <div key={review._id} className={`flex flex-col sm:flex-row gap-6 ${i !== reviews.length - 1 ? 'pb-10 border-b border-gray-100' : ''}`}>
                                        
                                        <div className="w-14 h-14 flex-shrink-0">
                                            {review.reviewerId?.profilePic ? (
                                                <img src={getImageUrl(review.reviewerId.profilePic)} alt="Reviewer" className="w-full h-full rounded-full object-cover shadow-sm bg-gray-50" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xl">
                                                    {review.reviewerId?.name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 max-w-3xl">
                                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                                                <h4 className="font-black text-gray-900 text-lg">{review.reviewerId?.name || "Unknown Buyer"}</h4>
                                                <span className="text-xs uppercase tracking-widest font-bold text-gray-400">
                                                    {new Date(review.createdAt).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}
                                                </span>
                                            </div>
                                            
                                            <div className="flex text-yellow-500 mb-3 gap-0.5">
                                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                            </div>
                                            
                                            <p className="text-gray-800 text-base leading-relaxed mb-4">"{review.comment}"</p>

                                            {/* Minimal Ordered Item Context */}
                                            {review.orderId && (
                                                <div className="inline-flex items-center gap-3 pr-4 py-2 border border-gray-100 rounded-full bg-gray-50/50 hover:bg-gray-100 transition-colors w-max overflow-hidden max-w-full">
                                                    {(() => {
                                                        const order = review.orderId;
                                                        const hasItems = order.items && order.items.length > 0;
                                                        
                                                        // Resolve Title
                                                        const itemTitle = order.itemTitle || 
                                                                        (order.itemId && order.itemId.title) || 
                                                                        (hasItems && order.items[0].itemTitle) || 
                                                                        (hasItems && order.items[0].itemId && order.items[0].itemId.title) || 
                                                                        "Purchased Item";
                                                        
                                                        // Resolve Image
                                                        const itemImage = order.itemImage || 
                                                                        (order.itemId && order.itemId.image) || 
                                                                        (hasItems && order.items[0].itemImage) || 
                                                                        (hasItems && order.items[0].itemId && order.items[0].itemId.image);

                                                        return (
                                                            <>
                                                                {itemImage ? (
                                                                    <img 
                                                                        src={getImageUrl(itemImage)} 
                                                                        alt={itemTitle} 
                                                                        className="w-8 h-8 rounded-full ml-1 bg-white shadow-sm object-cover" 
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full ml-1 bg-gray-200 flex items-center justify-center text-[10px]">🖼</div>
                                                                )}
                                                                <div className="flex flex-col truncate">
                                                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-0.5">Purchased</span>
                                                                    <span className="text-xs font-bold text-gray-700 leading-none truncate">{itemTitle}</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>

            {seller && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    entityId={seller._id}
                    entityModel="User"
                />
            )}
        </div>
    );
}

export default SellerProfile;
