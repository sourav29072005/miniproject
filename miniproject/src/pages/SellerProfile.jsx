import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";
import { ArrowLeft, BookOpen, User as UserIcon, Package } from "lucide-react";
import "./sellerprofile.css";

function SellerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                const [profileRes, itemsRes] = await Promise.all([
                    api.get(`auth/profile/${id}`),
                    api.get(`items/user/${id}`)
                ]);
                setSeller(profileRes.data.user);
                setItems(itemsRes.data);
            } catch (err) {
                console.error("Failed to fetch seller data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSellerData();
    }, [id]);

    const viewItem = (itemId) => {
        localStorage.setItem("selectedItemId", itemId);
        navigate("/item-details");
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
        <div className="profile-page-container">
            <div className="profile-header-banner">
                <button onClick={() => navigate(-1)} className="back-btn-circle">
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="profile-content-card max-w-2xl">
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-large shadow-lg">
                        {seller.profilePic ? (
                            <img
                                src={`${BASE_URL}/uploads/${seller.profilePic}`}
                                alt={seller.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="initials-placeholder text-3xl">{initials}</div>
                        )}
                    </div>
                </div>

                <div className="profile-main-info text-center">
                    <h1 className="user-full-name text-2xl font-bold">{seller.name}</h1>
                    <p className="user-email-text text-gray-500">{seller.email}</p>

                    <div className="flex justify-center gap-3 mt-4">
                        <div className="stat-badge-seller">
                            <span className="count">{items.length}</span>
                            <span className="label">Items</span>
                        </div>
                        {seller.department && (
                            <div className="stat-badge-seller dept">
                                <span className="label">{seller.department}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-details-grid w-full mt-6">
                    <div className="detail-item full-width bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="detail-icon bg-white text-blue-600 p-2 rounded-lg shadow-sm">
                            <UserIcon size={18} />
                        </div>
                        <div className="detail-info">
                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">About Seller</label>
                            <p className="bio-text text-gray-600 mt-1 text-sm italic">
                                "{seller.bio || "This student hasn't added a bio yet."}"
                            </p>
                        </div>
                    </div>
                </div>

                <div className="seller-items-section w-full mt-10">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                        <Package size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-800">Available from this Seller</h2>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                            <Package size={40} className="mx-auto mb-2 opacity-20" />
                            <p>No other items available right now.</p>
                        </div>
                    ) : (
                        <div className="seller-items-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map(item => (
                                <div
                                    key={item._id}
                                    className="seller-item-card flex bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group"
                                    onClick={() => viewItem(item._id)}
                                >
                                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                                        <img
                                            src={`${BASE_URL}/uploads/${item.image}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        />
                                    </div>
                                    <div className="p-4 flex flex-col justify-center overflow-hidden flex-1">
                                        <h3 className="font-semibold text-gray-800 truncate text-sm">{item.title}</h3>
                                        <p className="text-blue-600 font-bold">₹ {item.price}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded">{item.category}</span>
                                            <ArrowLeft size={14} className="rotate-180 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SellerProfile;
