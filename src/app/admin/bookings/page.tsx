'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { Booking } from '@/types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

export default function AdminBookingsPage() {
  const { user, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchBookings();
    }
  }, [isAdmin]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings');
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh or update local state
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b));
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('An error occurred');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesTab = activeTab === 'ALL' || b.status === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      b.theme?.name.toLowerCase().includes(searchLower) ||
      b.occasionType.toLowerCase().includes(searchLower) ||
      b.customer?.name.toLowerCase().includes(searchLower) ||
      b.id.toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null; // Or appropriate access denied component

  const tabs = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <Layout className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-500">Track and manage all event requests</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
            ← Dashboard
          </Link>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                {tab.label}
                {tab.id !== 'ALL' && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {bookings.filter(b => b.status === tab.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by ID, Customer, Theme..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none shadow-sm transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Bookings List/Kanban */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 font-medium">No bookings found in this view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookingStatusBadge status={booking.status} className="!text-xs py-1 px-3" />
                        <span className="text-xs font-mono text-gray-400">#{booking.id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                            {booking.theme?.name || booking.occasionType}
                          </h3>
                          <p className="text-sm text-gray-500">
                            by <span className="font-medium text-gray-900">{booking.customer?.name}</span> • {booking.guestCount} Guests
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Financials & Location */}
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600 lg:border-l lg:border-r border-gray-100 lg:px-8">
                      <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Total</span>
                        <span className="font-bold text-gray-900">₹{booking.totalAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Paid</span>
                        <span className={`${(booking.paidAmount || 0) < booking.totalAmount ? 'text-yellow-600' : 'text-green-600'} font-bold`}>
                          ₹{(booking.paidAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Location</span>
                        <span className="truncate max-w-[150px] block">{booking.location?.city}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                          className="px-4 py-2 bg-green-50 text-green-700 font-bold text-sm rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}