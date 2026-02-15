
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { BookingHistoryCard } from '@/components/dashboard/BookingHistoryCard';
import { EventHeroCard } from '@/components/dashboard/EventHeroCard';
import { Booking } from '@/types';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [activeBooking, setActiveBooking] = useState<Booking | undefined>(undefined);
  const [loadingBooking, setLoadingBooking] = useState(true);

  useEffect(() => {
    const fetchLatestBooking = async () => {
      if (!user) return;
      try {
        // Fetch only the most recent booking to check for upcoming events
        const response = await fetch(`/api/bookings?customerId=${user.id}&limit=1`);
        const data = await response.json();
        if (data.success && data.data.bookings.length > 0) {
          // Basic logic: if the latest booking is in the future or today
          // For now, just taking the latest one as the "Hero"
          setActiveBooking(data.data.bookings[0]);
        }
      } catch (error) {
        console.error('Failed to fetch latest booking:', error);
      } finally {
        setLoadingBooking(false);
      }
    };

    if (user) {
      fetchLatestBooking();
    } else if (!authLoading) {
      setLoadingBooking(false);
    }
  }, [user, authLoading]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-pink-600 hover:bg-pink-700 shadow-lg transition-all"
          >
            Sign In to Continued
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout className="bg-gray-50">

      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, <span className="font-semibold text-pink-600">{user.name}</span>!</p>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Hero Section */}
        <section>
          {loadingBooking ? (
            <div className="h-64 bg-gray-100 animate-pulse rounded-3xl"></div>
          ) : (
            <EventHeroCard booking={activeBooking} userName={user.name} />
          )}
        </section>

        {/* Quick Actions Bar */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/booking" className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-100 transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                📅
              </div>
              <span className="font-medium text-gray-700 group-hover:text-pink-600">New Booking</span>
            </Link>

            <Link href="/themes" className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🎨
              </div>
              <span className="font-medium text-gray-700 group-hover:text-purple-600">Browse Themes</span>
            </Link>

            <Link href="/dashboard/profile" className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <span className="font-medium text-gray-700 group-hover:text-blue-600">My Profile</span>
            </Link>

            <Link href="/dashboard/bookings" className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-100 transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                📂
              </div>
              <span className="font-medium text-gray-700 group-hover:text-green-600">All Bookings</span>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <BookingHistoryCard userId={user.id} />
          </div>

          {/* Sidebar / Widgets */}
          <div className="space-y-6">
            {/* Support / Help Widget */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Need Help Planning?</h3>
                <p className="text-indigo-100 mb-6 text-sm">
                  Our expert event planners are just a click away to help you create magic.
                </p>
                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm">
                  Chat with Planner
                </button>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            </div>

            {/* Role Specific Actions (Admin/Decorator) */}
            {user.role !== 'CUSTOMER' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">{user.role} Tools</h3>
                <div className="space-y-3">
                  {user.role === 'ADMIN' && (
                    <>
                      <Link href="/admin/bookings" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 text-center">
                        Manage All Bookings
                      </Link>
                      <Link href="/admin/users" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 text-center">
                        User Management
                      </Link>
                    </>
                  )}
                  {user.role === 'DECORATOR' && (
                    <Link href="/decorator/tasks" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 text-center">
                      View My Tasks
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}