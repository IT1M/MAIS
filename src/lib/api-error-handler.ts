import { showErrorToast } from '@/components/ui/Toast';

/**
 * API Error interface
 */
export interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Options for handling API errors
 */
export interface HandleAPIErrorOptions {
  /** Custom error message to display */
  customMessage?: string;
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Callback function to execute on retry */
  onRetry?: () => void;
  /** Whether to redirect on 401 errors */
  redirectOnUnauthorized?: boolean;
  /** Custom redirect URL for 401 errors */
  unauthorizedRedirectUrl?: string;
}

/**
 * Handles API errors with appropriate user feedback and actions
 * Implements requirements 11.2, 11.3, 11.4, 11.5:
 * - 401 Unauthorized: Redirect to login
 * - 403 Forbidden: Display access denied message
 * - 404 Not Found: Display not found message
 * - 500 Server Error: Display error with retry option
 * 
 * @param error - The API error object
 * @param options - Options for handling the error
 */
export function handleAPIError(
  error: APIError | Error | unknown,
  options: HandleAPIErrorOptions = {}
): void {
  const {
    customMessage,
    showToast = true,
    onRetry,
    redirectOnUnauthorized = true,
    unauthorizedRedirectUrl = '/login',
  } = options;

  // Parse error into APIError format
  const apiError = parseError(error);

  // Handle different status codes
  switch (apiError.status) {
    case 401:
      // Unauthorized - redirect to login
      if (showToast) {
        showErrorToast(
          customMessage || 'Your session has expired. Please log in again.'
        );
      }
      
      if (redirectOnUnauthorized) {
        // Store current URL for redirect after login
        const currentUrl = window.location.pathname + window.location.search;
        const redirectUrl = `${unauthorizedRedirectUrl}?returnUrl=${encodeURIComponent(currentUrl)}`;
        
        // Small delay to allow toast to be seen
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      }
      break;

    case 403:
      // Forbidden - access denied
      if (showToast) {
        showErrorToast(
          customMessage || 'Access denied. You do not have permission to perform this action.'
        );
      }
      break;

    case 404:
      // Not Found
      if (showToast) {
        showErrorToast(
          customMessage || 'The requested resource was not found.'
        );
      }
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      // Server Error - offer retry option
      if (showToast) {
        const message = customMessage || 'Server error. Please try again later.';
        
        if (onRetry) {
          // Show error with retry button
          showErrorToast(`${message} Click to retry.`);
          // Note: In a real implementation, you might want to use a custom toast
          // component that supports action buttons
        } else {
          showErrorToast(message);
        }
      }
      break;

    case 400:
      // Bad Request
      if (showToast) {
        showErrorToast(
          customMessage || apiError.message || 'Invalid request. Please check your input.'
        );
      }
      break;

    case 422:
      // Unprocessable Entity (validation error)
      if (showToast) {
        showErrorToast(
          customMessage || apiError.message || 'Validation error. Please check your input.'
        );
      }
      break;

    default:
      // Generic error
      if (showToast) {
        showErrorToast(
          customMessage || apiError.message || 'An unexpected error occurred. Please try again.'
        );
      }
      break;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', apiError);
  }
}

/**
 * Parses various error formats into a standardized APIError object
 */
function parseError(error: unknown): APIError {
  // If it's already an APIError
  if (isAPIError(error)) {
    return error;
  }

  // If it's a Response object from fetch
  if (error instanceof Response) {
    return {
      status: error.status,
      message: error.statusText || 'Request failed',
    };
  }

  // If it's a standard Error object
  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
    };
  }

  // If it's an object with error properties
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      status: typeof err.status === 'number' ? err.status : 0,
      message: typeof err.message === 'string' ? err.message : 'An error occurred',
      code: typeof err.code === 'string' ? err.code : undefined,
      details: err.details,
    };
  }

  // Fallback for unknown error types
  return {
    status: 0,
    message: 'An unexpected error occurred',
  };
}

/**
 * Type guard to check if an object is an APIError
 */
function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as APIError).status === 'number' &&
    'message' in error &&
    typeof (error as APIError).message === 'string'
  );
}

/**
 * Utility function to create an APIError from a fetch response
 * 
 * @param response - The fetch Response object
 * @returns Promise that resolves to an APIError
 */
export async function createAPIErrorFromResponse(response: Response): Promise<APIError> {
  let message = response.statusText || 'Request failed';
  let details: unknown;

  try {
    // Try to parse JSON error response
    const data = await response.json();
    if (data.message) {
      message = data.message;
    }
    if (data.error) {
      message = data.error;
    }
    details = data;
  } catch {
    // If JSON parsing fails, try to get text
    try {
      const text = await response.text();
      if (text) {
        message = text;
      }
    } catch {
      // Ignore text parsing errors
    }
  }

  return {
    status: response.status,
    message,
    details,
  };
}

/**
 * Wrapper for fetch that automatically handles errors
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param errorOptions - Error handling options
 * @returns Promise with the response data
 */
export async function fetchWithErrorHandling<T = unknown>(
  url: string,
  options?: RequestInit,
  errorOptions?: HandleAPIErrorOptions
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const apiError = await createAPIErrorFromResponse(response);
      handleAPIError(apiError, errorOptions);
      throw apiError;
    }

    return await response.json();
  } catch (error) {
    // If it's not already handled, handle it
    if (!isAPIError(error)) {
      handleAPIError(error, errorOptions);
    }
    throw error;
  }
}
