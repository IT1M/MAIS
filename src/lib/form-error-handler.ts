import { RefObject } from 'react';

/**
 * Form field error interface
 */
export interface FormFieldError {
  field: string;
  message: string;
}

/**
 * Form errors object (field name -> error message)
 */
export interface FormErrors {
  [field: string]: string;
}

/**
 * Options for displaying form errors
 */
export interface DisplayFormErrorsOptions {
  /** Whether to scroll to the first error field */
  scrollToError?: boolean;
  /** Whether to focus the first error field */
  focusError?: boolean;
  /** Scroll behavior */
  scrollBehavior?: ScrollBehavior;
  /** Scroll block position */
  scrollBlock?: ScrollLogicalPosition;
  /** Offset from top when scrolling (in pixels) */
  scrollOffset?: number;
}

/**
 * Displays form validation errors inline and scrolls to the first error
 * Implements requirements 11.6, 11.7:
 * - Display inline error messages below each invalid field
 * - Scroll to first invalid field and apply focus
 * 
 * @param errors - Object containing field names and error messages
 * @param formRef - Reference to the form element
 * @param options - Options for error display behavior
 */
export function displayFormErrors(
  errors: FormErrors,
  formRef: RefObject<HTMLFormElement>,
  options: DisplayFormErrorsOptions = {}
): void {
  const {
    scrollToError = true,
    focusError = true,
    scrollBehavior = 'smooth',
    scrollBlock = 'center',
    scrollOffset = 80, // Account for fixed headers
  } = options;

  if (!formRef.current) {
    console.warn('Form ref is not available');
    return;
  }

  const errorFields = Object.keys(errors);
  
  if (errorFields.length === 0) {
    return;
  }

  // Display inline errors for each field
  errorFields.forEach((fieldName) => {
    const errorMessage = errors[fieldName];
    showFieldError(formRef.current!, fieldName, errorMessage);
  });

  // Scroll to and focus the first error field
  const firstErrorField = errorFields[0];
  const firstErrorElement = getFieldElement(formRef.current, firstErrorField);

  if (firstErrorElement) {
    if (scrollToError) {
      scrollToElement(firstErrorElement, scrollBehavior, scrollBlock, scrollOffset);
    }

    if (focusError) {
      // Small delay to ensure scroll completes first
      setTimeout(() => {
        focusElement(firstErrorElement);
      }, scrollBehavior === 'smooth' ? 300 : 0);
    }
  }
}

/**
 * Shows an inline error message for a specific field
 * 
 * @param form - The form element
 * @param fieldName - The name of the field
 * @param errorMessage - The error message to display
 */
export function showFieldError(
  form: HTMLFormElement,
  fieldName: string,
  errorMessage: string
): void {
  const fieldElement = getFieldElement(form, fieldName);
  
  if (!fieldElement) {
    console.warn(`Field "${fieldName}" not found in form`);
    return;
  }

  // Add error styling to the field
  fieldElement.classList.add('border-destructive', 'focus:ring-destructive');
  fieldElement.setAttribute('aria-invalid', 'true');

  // Find or create error message container
  const fieldContainer = fieldElement.closest('.form-field') || fieldElement.parentElement;
  
  if (!fieldContainer) {
    return;
  }

  // Remove existing error message if present
  const existingError = fieldContainer.querySelector(`[data-error-for="${fieldName}"]`);
  if (existingError) {
    existingError.remove();
  }

  // Create and insert error message element
  const errorElement = document.createElement('p');
  errorElement.className = 'mt-1 text-sm text-destructive';
  errorElement.setAttribute('data-error-for', fieldName);
  errorElement.setAttribute('role', 'alert');
  errorElement.textContent = errorMessage;

  // Insert after the field element
  if (fieldElement.nextSibling) {
    fieldContainer.insertBefore(errorElement, fieldElement.nextSibling);
  } else {
    fieldContainer.appendChild(errorElement);
  }

  // Link error message to field for accessibility
  const errorId = `${fieldName}-error`;
  errorElement.id = errorId;
  fieldElement.setAttribute('aria-describedby', errorId);
}

/**
 * Clears the error message for a specific field
 * 
 * @param form - The form element
 * @param fieldName - The name of the field
 */
export function clearFieldError(
  form: HTMLFormElement,
  fieldName: string
): void {
  const fieldElement = getFieldElement(form, fieldName);
  
  if (!fieldElement) {
    return;
  }

  // Remove error styling from the field
  fieldElement.classList.remove('border-destructive', 'focus:ring-destructive');
  fieldElement.removeAttribute('aria-invalid');
  fieldElement.removeAttribute('aria-describedby');

  // Remove error message
  const fieldContainer = fieldElement.closest('.form-field') || fieldElement.parentElement;
  
  if (fieldContainer) {
    const errorElement = fieldContainer.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorElement) {
      errorElement.remove();
    }
  }
}

/**
 * Clears all error messages from a form
 * 
 * @param formRef - Reference to the form element
 */
export function clearAllFormErrors(formRef: RefObject<HTMLFormElement>): void {
  if (!formRef.current) {
    return;
  }

  // Remove all error messages
  const errorElements = formRef.current.querySelectorAll('[data-error-for]');
  errorElements.forEach((element) => element.remove());

  // Remove error styling from all fields
  const fields = formRef.current.querySelectorAll('[aria-invalid="true"]');
  fields.forEach((field) => {
    field.classList.remove('border-destructive', 'focus:ring-destructive');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  });
}

/**
 * Gets a form field element by name
 * Supports input, select, and textarea elements
 * 
 * @param form - The form element
 * @param fieldName - The name of the field
 * @returns The field element or null if not found
 */
function getFieldElement(
  form: HTMLFormElement,
  fieldName: string
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  // Try to find by name attribute
  let element = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[name="${fieldName}"]`
  );

  // If not found, try to find by id
  if (!element) {
    element = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `#${fieldName}`
    );
  }

  return element;
}

/**
 * Scrolls to an element with offset for fixed headers
 * 
 * @param element - The element to scroll to
 * @param behavior - Scroll behavior
 * @param block - Scroll block position
 * @param offset - Offset from top in pixels
 */
function scrollToElement(
  element: HTMLElement,
  behavior: ScrollBehavior,
  block: ScrollLogicalPosition,
  offset: number
): void {
  // Get element position
  const elementRect = element.getBoundingClientRect();
  const absoluteElementTop = elementRect.top + window.pageYOffset;
  const targetPosition = absoluteElementTop - offset;

  // Scroll to position
  window.scrollTo({
    top: targetPosition,
    behavior,
  });
}

/**
 * Focuses an element (input, select, or textarea)
 * 
 * @param element - The element to focus
 */
function focusElement(element: HTMLElement): void {
  if (element instanceof HTMLInputElement || 
      element instanceof HTMLSelectElement || 
      element instanceof HTMLTextAreaElement) {
    element.focus();
    
    // For text inputs, select the content for easy correction
    if (element instanceof HTMLInputElement && 
        (element.type === 'text' || element.type === 'email' || element.type === 'tel')) {
      element.select();
    }
  }
}

/**
 * Converts an array of field errors to a FormErrors object
 * 
 * @param fieldErrors - Array of field error objects
 * @returns FormErrors object
 */
export function fieldErrorsToFormErrors(fieldErrors: FormFieldError[]): FormErrors {
  return fieldErrors.reduce((acc, { field, message }) => {
    acc[field] = message;
    return acc;
  }, {} as FormErrors);
}

/**
 * Validates a form and displays errors
 * This is a helper function that combines validation and error display
 * 
 * @param formRef - Reference to the form element
 * @param validationFn - Function that validates the form and returns errors
 * @param options - Options for error display
 * @returns True if form is valid, false otherwise
 */
export async function validateAndDisplayErrors(
  formRef: RefObject<HTMLFormElement>,
  validationFn: () => Promise<FormErrors> | FormErrors,
  options?: DisplayFormErrorsOptions
): Promise<boolean> {
  // Clear existing errors
  clearAllFormErrors(formRef);

  // Run validation
  const errors = await validationFn();

  // If there are errors, display them
  if (Object.keys(errors).length > 0) {
    displayFormErrors(errors, formRef, options);
    return false;
  }

  return true;
}
