import { BASE_URL } from "../api";

/**
 * Gets the correct URL for an image.
 * If the path is already a full URL (stars with http), it returns it as is.
 * Otherwise, it prefixes it with the backend's upload directory.
 * 
 * @param {string} path - The image path or URL from the database
 * @returns {string} - The full usable image URL
 */
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/uploads/${path}`;
};
