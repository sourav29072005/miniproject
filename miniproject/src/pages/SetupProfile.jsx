import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./setupProfile.css";

function SetupProfile() {
    const { user, refreshUser } = useAuth();
    const [profilePic, setProfilePic] = useState(null);
    const [name, setName] = useState(user?.name || "");
    const [department, setDepartment] = useState(user?.department || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const isProfileComplete = !!user?.department;

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const token = storedUser?.token;

            if (!token) {
                setError("Session expired. Please login again.");
                return;
            }

            const formData = new FormData();
            if (name) formData.append("name", name);
            if (department) formData.append("department", department);
            if (bio) formData.append("bio", bio);
            if (profilePic) formData.append("profilePic", profilePic);

            const response = await api.put("auth/update-profile", formData);

            // Update local user data but preserve the token
            localStorage.setItem("user", JSON.stringify({ ...response.data.user, token }));

            // Refresh AuthContext state
            refreshUser();

            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate("/");
    };

    return (
        <div className="setup-container">
            <div className="setup-card">
                <h1 className="setup-title">
                    {isProfileComplete ? "Update Your Profile" : "Complete Your Profile"}
                </h1>
                <p className="setup-subtitle">Help others know you better in our campus community.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSave} className="setup-form">
                    <div className="profile-pic-upload">
                        <div className="avatar-preview">
                            {profilePic ? (
                                <img src={URL.createObjectURL(profilePic)} alt="Preview" />
                            ) : (
                                <div className="avatar-placeholder-large">?</div>
                            )}
                        </div>
                        <label htmlFor="profile-upload" className="upload-label">
                            {profilePic ? "Change Photo" : (user?.profilePic ? "Update Photo" : "Choose Profile Picture")}
                        </label>
                        <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePic(e.target.files[0])}
                            className="hidden-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="setup-select"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="setup-select"
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science (CSE)</option>
                            <option value="Electronics">Electronics (ECE)</option>
                            <option value="Electrical">Electrical (EEE)</option>
                            <option value="Mechanical">Mechanical (ME)</option>
                            <option value="Civil">Civil (CE)</option>
                            <option value="Information Technology">Information Technology (IT)</option>
                            <option value="Applied Electronics">Applied Electronics</option>
                            <option value="MCA">MCA</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Campus Bio</label>
                        <textarea
                            placeholder="E.g. Passionate about second-hand books and gadgets."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="setup-textarea"
                        />
                    </div>

                    <div className="setup-actions">
                        {!isProfileComplete && (
                            <button type="button" onClick={handleSkip} className="skip-btn" disabled={loading}>
                                Skip for Now
                            </button>
                        )}
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? "Saving..." : (isProfileComplete ? "Update Profile" : "Save & Continue")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SetupProfile;
