# Error Handling Utilities - Usage Examples

This document provides examples of how to use the error handling utilities implemented for the Saudi Mais Inventory System.

## 1. ErrorBoundary Component

The `ErrorBoundary` component catches React errors and displays a user-friendly fallback UI.

### Basic Usage

Wrap your app or specific components with the ErrorBoundary:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Custom Fallback UI

You can provide a custom fallback component:

```tsx
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h1>Custom Error Page</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

### Wrapping Specific Routes

```tsx
// In your layout or page component
export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary>
      <MainLayout>
        {children}
      </MainLayout>
    </ErrorBoundary>
  );
}
```

## 2. API Error Handler

The `handleAPIError` function provides consistent error handling for API requests.

### Basic Usage

```tsx
import { handleAPIError } from '@/lib/api-error-handler';

async function fetchData() {
  try {
    const response = await fetch('/api/inventory');
    if (!response.ok) {
      const error = await createAPIErrorFromResponse(response);
      handleAPIError(error);
      return;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    handleAPIError(error);
  }
}
```

### With Custom Options

```tsx
import { handleAPIError } from '@/lib/api-error-handler';

async function deleteItem(id: string) {
  try {
    const response = await fetch(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await createAPIErrorFromResponse(response);
      handleAPIError(error, {
        customMessage: 'Failed to delete item. Please try again.',
        showToast: true,
        onRetry: () => deleteItem(id),
      });
      return;
    }
    
    showSuccessToast('Item deleted successfully');
  } catch (error) {
    handleAPIError(error);
  }
}
```

### Using fetchWithErrorHandling Helper

```tsx
import { fetchWithErrorHandling } from '@/lib/api-error-handler';

async function getInventoryItems() {
  try {
    const data = await fetchWithErrorHandling<InventoryItem[]>(
      '/api/inventory',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        customMessage: 'Failed to load inventory items',
        redirectOnUnauthorized: true,
      }
    );
    return data;
  } catch (error) {
    // Error is already handled by fetchWithErrorHandling
    return [];
  }
}
```

### Preventing Redirect on 401

```tsx
handleAPIError(error, {
  redirectOnUnauthorized: false,
  customMessage: 'Please log in to continue',
});
```

## 3. Form Validation Error Display

The form error handler utilities help display inline validation errors and improve UX.

### Basic Usage

```tsx
import { useRef } from 'react';
import { displayFormErrors, FormErrors } from '@/lib/form-error-handler';

function MyForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Your validation logic
    const errors: FormErrors = {};
    
    if (!itemName) {
      errors.itemName = 'Item name is required';
    }
    
    if (!quantity || quantity <= 0) {
      errors.quantity = 'Please enter a valid quantity';
    }
    
    // Display errors if any
    if (Object.keys(errors).length > 0) {
      displayFormErrors(errors, formRef);
      return;
    }
    
    // Submit form...
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="itemName">Item Name</label>
        <input
          type="text"
          id="itemName"
          name="itemName"
          className="border rounded px-3 py-2"
        />
      </div>
      
      <div className="form-field">
        <label htmlFor="quantity">Quantity</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          className="border rounded px-3 py-2"
        />
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Clear Errors on Field Change

```tsx
import { clearFieldError } from '@/lib/form-error-handler';

function MyForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleFieldChange = (fieldName: string) => {
    if (formRef.current) {
      clearFieldError(formRef.current, fieldName);
    }
  };

  return (
    <form ref={formRef}>
      <input
        name="itemName"
        onChange={() => handleFieldChange('itemName')}
      />
    </form>
  );
}
```

### Using validateAndDisplayErrors Helper

```tsx
import { validateAndDisplayErrors } from '@/lib/form-error-handler';

function MyForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    const formData = new FormData(formRef.current!);
    
    const itemName = formData.get('itemName') as string;
    if (!itemName) {
      errors.itemName = 'Item name is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateAndDisplayErrors(
      formRef,
      validateForm,
      {
        scrollToError: true,
        focusError: true,
        scrollOffset: 100, // Account for fixed header
      }
    );
    
    if (!isValid) {
      return;
    }
    
    // Submit form...
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Custom Scroll Options

```tsx
displayFormErrors(errors, formRef, {
  scrollToError: true,
  focusError: true,
  scrollBehavior: 'smooth', // or 'auto'
  scrollBlock: 'center', // or 'start', 'end', 'nearest'
  scrollOffset: 80, // pixels from top
});
```

### Clear All Errors

```tsx
import { clearAllFormErrors } from '@/lib/form-error-handler';

function MyForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleReset = () => {
    clearAllFormErrors(formRef);
    formRef.current?.reset();
  };

  return (
    <form ref={formRef}>
      {/* form fields */}
      <button type="button" onClick={handleReset}>Reset</button>
    </form>
  );
}
```

## Integration with Existing Components

### Data Entry Form Example

```tsx
import { useRef } from 'react';
import { displayFormErrors, clearFieldError } from '@/lib/form-error-handler';
import { handleAPIError, fetchWithErrorHandling } from '@/lib/api-error-handler';

function DataEntryForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateFormData();
    if (Object.keys(errors).length > 0) {
      displayFormErrors(errors, formRef);
      return;
    }
    
    // Submit to API
    try {
      const formData = new FormData(formRef.current!);
      const data = await fetchWithErrorHandling('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { 'Content-Type': 'application/json' },
      });
      
      showSuccessToast('Item added successfully!');
      formRef.current?.reset();
    } catch (error) {
      // Error already handled by fetchWithErrorHandling
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Best Practices

1. **Always wrap your app with ErrorBoundary** at the root level
2. **Use fetchWithErrorHandling** for consistent API error handling
3. **Clear field errors** when the user starts typing to improve UX
4. **Provide custom error messages** that are specific to the context
5. **Test error scenarios** to ensure proper error handling
6. **Log errors** in production to a monitoring service (e.g., Sentry)
7. **Use form-field class** on field containers for proper error message placement

## Accessibility Considerations

All error handling utilities follow accessibility best practices:

- Error messages use `role="alert"` for screen reader announcements
- Fields with errors have `aria-invalid="true"`
- Error messages are linked to fields with `aria-describedby`
- Focus management ensures keyboard users can navigate to errors
- Color is not the only indicator of errors (icons and text are used)
