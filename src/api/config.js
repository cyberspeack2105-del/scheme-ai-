export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return `${API_URL}${url}`;
};
export const BASE_URL = API_URL;
