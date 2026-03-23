import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {},
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacher_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('teacher_token');
      localStorage.removeItem('teacher_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
