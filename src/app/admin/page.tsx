'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { AdminMetrics } from '@/components/admin/AdminMetrics';

export default function AdminPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ActionCard = ({ href, icon, title, description, color }: { href: string, icon: string, title: string, description: string, color: string }) => (
    <Link href={href} className="group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden">
      <div className={`absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:scale-110 transition-transform ${color}`}>
        {icon}
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );

  return (
    <Layout className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500">Welcome back, {user.name}. Here is what's happening today.</p>
        </div>

        {/* Metrics Row */}
        <AdminMetrics />

        {/* Operations Center */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Daily Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              href="/admin/bookings"
              icon="📅"
              title="Booking Management"
              description="View, approve, and manage all customer bookings."
              color="text-blue-600"
            />
            <ActionCard
              href="/admin/users"
              icon="👥"
              title="User Directory"
              description="Manage customer accounts, decorators, and admins."
              color="text-blue-600"
            />
          </div>
        </section>

        {/* Growth Center */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
            Growth & Catalog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              href="/admin/themes"
              icon="🎨"
              title="Themes & Packages"
              description="Update theme catalog, pricing, and package details."
              color="text-purple-600"
            />
            <ActionCard
              href="/admin/email"
              icon="📧"
              title="Email Campaigns"
              description="Create and send marketing emails to customers."
              color="text-purple-600"
            />
            <ActionCard
              href="/admin/email-automation"
              icon="⚡"
              title="Automation Rules"
              description="Configure automated email triggers and templates."
              color="text-purple-600"
            />
          </div>
        </section>

        {/* System Center */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-gray-600 rounded-full"></span>
            System & Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              href="/admin/serviceability"
              icon="📍"
              title="Serviceability"
              description="Manage serviceable pincodes and city limits."
              color="text-gray-600"
            />
            <ActionCard
              href="/admin/testimonials"
              icon="💬"
              title="Testimonials"
              description="Moderate and approve customer reviews."
              color="text-gray-600"
            />
            <ActionCard
              href="/admin/analytics"
              icon="📊"
              title="Analytics"
              description="Deep dive into business performance metrics."
              color="text-gray-600"
            />
          </div>
        </section>

      </div>
    </Layout>
  );
}