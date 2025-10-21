'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    employeeId?: string;
    department?: string;
    phone?: string;
    workLocation?: string;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    employeeId: user.employeeId || '',
    department: user.department || '',
    phone: user.phone || '',
    workLocation: user.workLocation || '',
  });
  const [avatar, setAvatar] = useState(user.avatar);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, avatar }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      ADMIN: 'danger',
      SUPERVISOR: 'warning',
      MANAGER: 'info',
      DATA_ENTRY: 'success',
      AUDITOR: 'default',
    };
    return variants[role] || 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your personal information and profile picture
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(formData.name)}
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
              {avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                >
                  Remove
                </Button>
              )}
              <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            minLength={2}
            maxLength={100}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900">
              {user.email}
            </div>
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <div className="flex items-center h-10">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <Input
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleInputChange}
            placeholder="Optional"
          />
        </div>

        <Input
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          placeholder="e.g., Warehouse, Quality Control"
        />

        {/* Contact Information */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+966 XX XXX XXXX"
            />
            <Input
              label="Work Location"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleInputChange}
              placeholder="e.g., Riyadh Office"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
