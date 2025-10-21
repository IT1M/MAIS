'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
}

interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'DATA_ENTRY',
    isActive: user?.isActive ?? true,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {user ? 'Edit User' : 'Add New User'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'ADMIN', label: '👨‍💼 ADMIN - Full system access' },
              { value: 'DATA_ENTRY', label: '✏️ DATA_ENTRY - Add/edit inventory' },
              { value: 'SUPERVISOR', label: '👁️ SUPERVISOR - View all, edit, delete' },
              { value: 'MANAGER', label: '📊 MANAGER - View analytics, reports' },
              { value: 'AUDITOR', label: '🔍 AUDITOR - View-only access' },
            ]}
          />
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Password
              </label>
              <div className="flex space-x-2">
                <Input
                  value={generatedPassword}
                  readOnly
                  placeholder="Click generate"
                />
                <Button type="button" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
              {generatedPassword && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    toast.success('Password copied');
                  }}
                  className="mt-1"
                >
                  Copy Password
                </Button>
              )}
            </div>
          )}
          <Switch
            label="Active Status"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{user ? 'Update User' : 'Create User'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Failed to save user');

      toast.success(editingUser ? 'User updated' : 'User created');
      setShowModal(false);
      setEditingUser(undefined);
      // Refresh users list
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter((u) => u.id !== userId));
      toast.success('User deleted');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive } : u)));
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update user');
    }
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

  const permissions = [
    { name: 'Add Inventory', admin: true, supervisor: true, manager: false, dataEntry: true, auditor: false },
    { name: 'Edit Inventory', admin: true, supervisor: true, manager: false, dataEntry: true, auditor: false },
    { name: 'Delete Inventory', admin: true, supervisor: true, manager: false, dataEntry: false, auditor: false },
    { name: 'View Analytics', admin: true, supervisor: true, manager: true, dataEntry: false, auditor: true },
    { name: 'Generate Reports', admin: true, supervisor: true, manager: true, dataEntry: false, auditor: false },
    { name: 'Manage Users', admin: true, supervisor: false, manager: false, dataEntry: false, auditor: false },
    { name: 'System Settings', admin: true, supervisor: false, manager: false, dataEntry: false, auditor: false },
    { name: 'View Audit Logs', admin: true, supervisor: true, manager: false, dataEntry: false, auditor: true },
    { name: 'Export Data', admin: true, supervisor: true, manager: true, dataEntry: false, auditor: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>Add New User</Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'SUPERVISOR', label: 'Supervisor' },
            { value: 'MANAGER', label: 'Manager' },
            { value: 'DATA_ENTRY', label: 'Data Entry' },
            { value: 'AUDITOR', label: 'Auditor' },
          ]}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Switch
                      checked={user.isActive}
                      onChange={(e) => handleToggleActive(user.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {user.lastLogin ? format(user.lastLogin, 'PP') : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Role Permissions Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Permission
                </th>
                <th className="text-center py-2 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Admin
                </th>
                <th className="text-center py-2 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Supervisor
                </th>
                <th className="text-center py-2 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Manager
                </th>
                <th className="text-center py-2 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Data Entry
                </th>
                <th className="text-center py-2 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Auditor
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-4 text-gray-900 dark:text-white">{perm.name}</td>
                  <td className="text-center py-2 px-4">
                    {perm.admin ? '✓' : '✗'}
                  </td>
                  <td className="text-center py-2 px-4">
                    {perm.supervisor ? '✓' : '✗'}
                  </td>
                  <td className="text-center py-2 px-4">
                    {perm.manager ? '✓' : '✗'}
                  </td>
                  <td className="text-center py-2 px-4">
                    {perm.dataEntry ? '✓' : '✗'}
                  </td>
                  <td className="text-center py-2 px-4">
                    {perm.auditor ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(undefined);
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}
