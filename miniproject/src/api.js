import axios from "axios";

export const BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://cev-backend.onrender.com";

const api = axios.create({
    baseURL: `${BASE_URL}/api/`,
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getNotifications = () => api.get("/notifications");
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const clearNotifications = () => api.delete("/notifications/clear-read");

export default api;
