'use client';

import React from 'react';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';

export default function AdminPage() {
  const { user, logout, isLoading } = useAuth();
  const isAdmin = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the admin panel.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have admin privileges to access this page.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <Layout className="bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage your BashItNow platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Dashboard
              </a>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bookings Management */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Bookings Management
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  View and manage all customer bookings
                </p>
                <div className="space-y-3">
                  <a
                    href="/admin/bookings"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    All Bookings
                  </a>
                  <a
                    href="/admin/bookings?status=pending"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Pending Bookings
                  </a>
                  <a
                    href="/admin/bookings?status=confirmed"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Confirmed Bookings
                  </a>
                </div>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  User Management
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage customers, decorators, and admins
                </p>
                <div className="space-y-3">
                  <a
                    href="/admin/users"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    All Users
                  </a>
                  <a
                    href="/admin/users?role=customer"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Customers
                  </a>
                  <a
                    href="/admin/users?role=decorator"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Decorators
                  </a>
                </div>
              </div>
            </div>

            {/* Content Management */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Content Management
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage themes, portfolio, and testimonials
                </p>
                <div className="space-y-3">
                  <a
                    href="/admin/themes"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Themes
                  </a>
                  <a
                    href="/admin/portfolio"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Portfolio
                  </a>
                  <a
                    href="/admin/testimonials"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Testimonials
                  </a>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Analytics & Reports
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  View business metrics and performance
                </p>
                <div className="space-y-3">
                  <a
                    href="/admin/analytics"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/admin/reports"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Reports
                  </a>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  System Settings
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure platform settings
                </p>
                <div className="space-y-3">
                  <a
                    href="/admin/settings"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    General Settings
                  </a>
                  <a
                    href="/admin/payments"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Payment Settings
                  </a>
                </div>
              </div>
            </div>

            {/* Current Admin Info */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Admin Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {user.role}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}