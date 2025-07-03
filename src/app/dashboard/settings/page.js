'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { Save, User, Lock, Bell, Globe } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  bio: yup.string().max(500, 'Bio cannot exceed 500 characters'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onProfileSubmit = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await authAPI.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully!');
      passwordForm.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Settings</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500 leading-relaxed">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="form-container">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          {/* Mobile Tab Selector */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Desktop Tab Navigation */}
          <nav className="hidden sm:flex -mb-px space-x-2 lg:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                } whitespace-nowrap py-3 px-3 lg:px-4 border-b-2 font-semibold text-sm flex items-center rounded-t-lg transition-all duration-200 min-h-[48px]`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">{tab.name}</span>
                <span className="lg:hidden">{tab.name.charAt(0)}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Profile Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <input
                      {...profileForm.register('firstName')}
                      type="text"
                      placeholder="Enter your first name"
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="form-error">
                        {profileForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <input
                      {...profileForm.register('lastName')}
                      type="text"
                      placeholder="Enter your last name"
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="form-error">
                        {profileForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      {...profileForm.register('username')}
                      type="text"
                      placeholder="Choose a unique username"
                    />
                    {profileForm.formState.errors.username && (
                      <p className="form-error">
                        {profileForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      {...profileForm.register('email')}
                      type="email"
                      placeholder="Enter your email address"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="form-error">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 form-group lg:col-span-2">
                  <label htmlFor="bio" className="form-label">
                    Bio
                  </label>
                  <textarea
                    {...profileForm.register('bio')}
                    rows={4}
                    className="resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  {profileForm.formState.errors.bio && (
                    <p className="form-error">
                      {profileForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
                <button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center py-3 px-6 border border-transparent text-base sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl min-h-[48px]"
                >
                  {profileForm.formState.isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Change Password</h3>
                <div className="space-y-4 sm:space-y-6 max-w-full sm:max-w-md">
                  <div className="form-group">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      {...passwordForm.register('currentPassword')}
                      type="password"
                      placeholder="Enter your current password"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="form-error">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      {...passwordForm.register('newPassword')}
                      type="password"
                      placeholder="Enter your new password"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="form-error">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      {...passwordForm.register('confirmPassword')}
                      type="password"
                      placeholder="Confirm your new password"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="form-error">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
                <button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center py-3 px-6 border border-transparent text-base sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl min-h-[48px]"
                >
                  {passwordForm.formState.isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Notification Preferences</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500 mt-1">Receive email notifications for new comments and likes</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Blog Updates</h4>
                    <p className="text-sm text-gray-500 mt-1">Get notified when your blog posts receive engagement</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Weekly Summary</h4>
                    <p className="text-sm text-gray-500 mt-1">Receive a weekly summary of your blog performance</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Preferences</h3>
              <div className="space-y-4 sm:space-y-6 max-w-full sm:max-w-md">
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select className="mt-1 block w-full">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="mt-1 block w-full">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="mt-1 block w-full">
                    <option>UTC</option>
                    <option>EST</option>
                    <option>PST</option>
                    <option>GMT</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}