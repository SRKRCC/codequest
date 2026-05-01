import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { NavigateFunction } from 'react-router-dom';

// Navigation utility for use in interceptors
let navigateFunction: NavigateFunction | null = null;

export const setNavigateFunction = (navigate: NavigateFunction) => {
  navigateFunction = navigate;
};

const navigateTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback to window.location if navigate function not set
    window.location.href = path;
  }
};

export { navigateTo };

// API Error Response interface
interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// Extend Axios config to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging and auth
axiosInstance.interceptors.request.use(
  (config) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: Date.now() };
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling global errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const { config } = error;

    // Enhanced error logging
    console.error('API Error:', {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Show user-friendly error messages and handle navigation
    if (error.response?.status) {
      switch (error.response.status) {
        case 401:
          // Store error context for unauthorized page
          sessionStorage.setItem('authError', JSON.stringify({
            message: 'Your session has expired. Please log in again.',
            redirectUrl: window.location.pathname
          }));
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            navigateTo('/unauthorized');
          }
          break;
        case 403:
          toast.error('You don\'t have permission to access this resource');
          // Could redirect to forbidden page for critical operations
          break;
        case 404:
          // For API 404s, show toast unless it's a navigation request
          if (!config?.url?.includes('/api/')) {
            navigateTo('/404');
          } else {
            toast.error('The requested resource was not found');
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          // Store error context for server error page
          sessionStorage.setItem('serverError', JSON.stringify({
            status: error.response.status,
            message: error.response.data?.message || 'Server is temporarily unavailable',
            retryUrl: config?.url
          }));
          toast.error('Server error. Redirecting to error page...');
          setTimeout(() => {
            navigateTo('/server-error');
          }, 1500);
          break;
        default:
          toast.error(error.response.data?.message || 'An unexpected error occurred');
      }
    } else if (error.code === 'NETWORK_ERROR') {
      // Store network error context
      sessionStorage.setItem('networkError', JSON.stringify({
        message: 'Unable to connect to our servers',
        retryUrl: config?.url
      }));
      toast.error('Network error. Redirecting to error page...');
      setTimeout(() => {
        navigateTo('/network-error');
      }, 1500);
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

