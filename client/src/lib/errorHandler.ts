import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Standardized error types
export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

// Error classification
export class ErrorHandler {
  // Extract error message from different response formats
  static extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as ApiError;
      
      // Handle standardized backend errors
      if (responseData?.success === false) {
        return responseData.error.message;
      }
      
      // Handle legacy error formats
      if (responseData?.error) {
        return typeof responseData.error === 'string' ? responseData.error : responseData.error.message;
      }
      
      // Handle legacy message format
      if ((responseData as any)?.message) {
        return (responseData as any).message;
      }

      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }

      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please try again.';
      }

      // HTTP status specific messages
      switch (error.response?.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'You are not authorized. Please log in again.';
        case 403:
          return 'Access forbidden. You do not have permission.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'Conflict detected. The resource already exists.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }

    // Handle non-Axios errors
    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  }

  // Determine if error is retryable
  static isRetryable(error: unknown): boolean {
    if (error instanceof AxiosError) {
      // Network errors are retryable
      if (!error.response) return true;
      
      const status = error.response.status;
      // Server errors and rate limits are retryable
      return status >= 500 || status === 429;
    }
    return false;
  }

  // Get user-friendly title for error
  static getErrorTitle(error: unknown): string {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      
      switch (status) {
        case 400:
          return 'Invalid Input';
        case 401:
          return 'Authentication Required';
        case 403:
          return 'Access Denied';
        case 404:
          return 'Not Found';
        case 409:
          return 'Already Exists';
        case 429:
          return 'Too Many Requests';
        case 500:
          return 'Server Error';
        case 503:
          return 'Service Unavailable';
        default:
          return 'Error';
      }
    }
    return 'Error';
  }

  // Handle error with toast and optional callback
  static handleError(error: unknown, customMessage?: string, onError?: (error: string) => void) {
    const message = customMessage || this.extractErrorMessage(error);
    const title = this.getErrorTitle(error);
    
    // Show toast notification
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: 'white',
      },
    });

    // Call custom error handler if provided
    if (onError) {
      onError(message);
    }

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${title}]:`, error);
    }

    return message;
  }
}

// Hook for error handling with retry logic
export const useErrorHandler = () => {
  const handleError = (error: unknown, customMessage?: string) => {
    return ErrorHandler.handleError(error, customMessage);
  };

  const handleErrorWithRetry = async (
    operation: () => Promise<any>,
    maxRetries: number = 2,
    customMessage?: string
  ): Promise<any> => {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry if it's not a retryable error or if it's the last attempt
        if (!ErrorHandler.isRetryable(error) || attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (attempt < maxRetries) {
          toast.loading(`Retrying... (${attempt + 1}/${maxRetries})`, {
            duration: 1000,
          });
        }
      }
    }
    
    // Handle the final error
    return Promise.reject(handleError(lastError, customMessage));
  };

  return {
    handleError,
    handleErrorWithRetry,
    isRetryable: ErrorHandler.isRetryable,
    extractMessage: ErrorHandler.extractErrorMessage
  };
};