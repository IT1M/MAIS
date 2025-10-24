'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  callbackUrl?: string;
  error?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm({ callbackUrl, error }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({
    general: error ? 'Authentication failed. Please try again.' : undefined,
  });
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

  // Password validation function
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }

    return undefined;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({
          general: 'Invalid email or password',
        });
      } else if (result?.ok) {
        // Redirect to callback URL or dashboard on success
        const redirectUrl = callbackUrl || '/en/dashboard';
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (error) {
      setErrors({
        general: 'An error occurred. Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes and clear field-specific errors
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error when user modifies any field
    if (errors.general) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.general}
          </p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        placeholder="Enter your email"
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        error={errors.password}
        placeholder="Enter your password"
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingText="Signing in..."
      >
        Sign In
      </Button>

      <div className="text-center">
        <Link
          href="/en/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
