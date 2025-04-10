import axios from 'axios';

const api = axios.create({
  baseURL: 'https://finance-office.onrender.com',
  withCredentials: true
});

// Add response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/user/login';
    }
    return Promise.reject(error);
  }
);

export default api;