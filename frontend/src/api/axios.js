import axios from 'axios';

// withCredentials makes the browser send/receive the httpOnly JWT cookie
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  withCredentials: true,
});

export const errMsg = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const imgUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600?text=No+Image';
  return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL || ''}${path}`;
};

export default api;
