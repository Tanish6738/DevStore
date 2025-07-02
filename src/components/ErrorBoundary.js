'use client';

import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, send to error tracking service like Sentry
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Could send to an API endpoint for logging
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: error.toString(),
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }),
        }).catch(err => console.error('Failed to log error:', err));
      } catch (logError) {
        console.error('Error logging failed:', logError);
      }
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-theme-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-theme-error" />
              <h2 className="mt-6 text-3xl font-extrabold text-theme-text">
                Oops! Something went wrong
              </h2>
              <p className="mt-2 text-sm text-theme-text-secondary">
                {this.state.retryCount > 0 
                  ? "We're still having trouble. Please try reloading the page."
                  : "We encountered an unexpected error. Don't worry, we've been notified."
                }
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                variant="secondary"
                onClick={this.handleReload}
                className="w-full"
              >
                Reload Page
              </Button>

              {this.props.fallback && (
                <Button
                  variant="outline"
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full"
                >
                  Go Back
                </Button>
              )}
            </div>

            {/* Development error details */}
            {isDevelopment && this.state.error && (
              <details className="mt-6 p-4 bg-theme-error/10 border border-theme-error/20 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-theme-error mb-2">
                  Error Details (Development)
                </summary>
                <div className="text-xs text-theme-error/80 space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{this.state.error.toString()}</pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="text-center">
              <p className="text-xs text-theme-text-secondary">
                Error ID: {Date.now()}-{Math.random().toString(36).substr(2, 9)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  const captureError = React.useCallback((error) => {
    setError(error);
    console.error('Error captured:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError, error };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary(Component, fallback) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
