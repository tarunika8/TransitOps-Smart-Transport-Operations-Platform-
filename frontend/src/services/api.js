import axios from 'axios';

// Placeholder axios client. Swap baseURL when a backend is available.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

export default api;
