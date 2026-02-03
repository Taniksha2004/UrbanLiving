import axios, { InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api', // Your backend API base URL
});

// Add a request interceptor to attach the JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;