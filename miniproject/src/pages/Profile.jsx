import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/urlHelper";
import { ArrowLeft, Pencil, BookOpen, User as UserIcon } from "lucide-react";
import "./profile.css";

function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const initials = user.name
        ? user.name.substring(0, 2).toUpperCase()
        : user.email.substring(0, 2).toUpperCase();

    return (
        <div className="profile-page-container">
            <div className="profile-header-banner">
                <button onClick={() => navigate(-1)} className="back-btn-circle">
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="profile-content-card">
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-large">
                        {user.profilePic ? (
                            <img
                                src={getImageUrl(user.profilePic)}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="initials-placeholder">{initials}</div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate("/setup-profile")}
                        className="edit-avatar-badge"
                        title="Update Profile"
                    >
                        <Pencil size={14} />
                    </button>
                </div>

                <div className="profile-main-info">
                    <h1 className="user-full-name">{user.name}</h1>
                    <p className="user-email-text">{user.email}</p>


                </div>

                <div className="profile-details-grid">
                    <div className="detail-item">
                        <div className="detail-icon">
                            <BookOpen size={18} />
                        </div>
                        <div className="detail-info">
                            <label>Department</label>
                            <p>{user.department || "Not specified"}</p>
                        </div>
                    </div>

                    <div className="detail-item full-width">
                        <div className="detail-icon">
                            <UserIcon size={18} />
                        </div>
                        <div className="detail-info">
                            <label>Campus Bio</label>
                            <p className="bio-text">
                                {user.bio || "No bio added yet. Tell others a bit about your campus interests!"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="profile-actions-footer">
                    <button
                        onClick={() => navigate("/setup-profile")}
                        className="primary-edit-btn"
                    >
                        <Pencil size={18} />
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
