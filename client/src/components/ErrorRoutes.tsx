import React, { useEffect, useState } from 'react';
import { ServerErrorPage, NetworkErrorPage, UnauthorizedPage } from './EnhancedErrorPages';

// Server Error Page with retry functionality
export const ServerErrorRoute: React.FC = () => {
  const [errorContext, setErrorContext] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('serverError');
    if (stored) {
      setErrorContext(JSON.parse(stored));
      // Clear the stored error after reading
      sessionStorage.removeItem('serverError');
    }
  }, []);

  const handleRetry = () => {
    if (errorContext?.retryUrl) {
      // Try to make the request again
      window.location.reload();
    } else {
      // Default retry - reload page
      window.location.reload();
    }
  };

  return (
    <ServerErrorPage onRetry={handleRetry} />
  );
};

// Network Error Page with retry functionality  
export const NetworkErrorRoute: React.FC = () => {
  const [errorContext, setErrorContext] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('networkError');
    if (stored) {
      setErrorContext(JSON.parse(stored));
      // Clear the stored error after reading
      sessionStorage.removeItem('networkError');
    }
  }, []);

  const handleRetry = () => {
    if (errorContext?.retryUrl) {
      // Try to make the request again
      window.location.reload();
    } else {
      // Default retry - reload page  
      window.location.reload();
    }
  };

  return (
    <NetworkErrorPage onRetry={handleRetry} />
  );
};

// Unauthorized Page with context
export const UnauthorizedRoute: React.FC = () => {
  return (
    <UnauthorizedPage />
  );
};