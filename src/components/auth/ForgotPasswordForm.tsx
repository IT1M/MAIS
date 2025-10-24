'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email validation function
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return undefined;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'An error occurred. Please try again');
      }
    } catch (error) {
      setError('An error occurred. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes and clear errors
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">
            If an account exists with this email, you will receive password reset instructions.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/en/login"
            className="text-sm text-primary hover:underline inline-flex items-center"
          >
            <span className="mr-1">←</span> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        error={error && error !== 'An error occurred. Please try again' ? error : undefined}
        placeholder="Enter your email"
        disabled={isLoading}
        autoComplete="email"
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingText="Sending..."
      >
        Send Reset Link
      </Button>

      <div className="text-center">
        <Link
          href="/en/login"
          className="text-sm text-primary hover:underline inline-flex items-center"
        >
          <span className="mr-1">←</span> Back to login
        </Link>
      </div>
    </form>
  );
}
