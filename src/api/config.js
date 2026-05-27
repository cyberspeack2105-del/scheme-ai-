const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_URL = '/api';

export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return `${API_URL}${url}`;
};
export const BASE_URL = API_URL;
