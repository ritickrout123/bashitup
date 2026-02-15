
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { Booking } from '@/types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

export default function BookingHistoryPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                const response = await fetch(`/api/bookings?customerId=${user.id}`);
                const data = await response.json();
                if (data.success) {
                    setBookings(data.data.bookings);
                } else {
                    setError('Failed to load bookings');
                }
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchBookings();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h1 className="text-2xl font-bold mb-4">Please log in</h1>
                    <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
                </div>
            </Layout>
        )
    }

    return (
        <Layout className="bg-gray-50 from-pink-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-500 mt-1">Track and manage your event bookings</p>
                    </div>
                    <Link
                        href="/booking"
                        className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                    >
                        + New Booking
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                            📅
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            You haven't booked any events with us yet. Start planning your perfect celebration today!
                        </p>
                        <Link
                            href="/booking"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                        >
                            Start Planning
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <Link
                                key={booking.id}
                                href={`/dashboard/bookings/${booking.id}`}
                                className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                            >
                                <div className="p-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <BookingStatusBadge status={booking.status} />
                                            <span className="text-sm text-gray-400">ID: {booking.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                                            {booking.theme?.name || booking.occasionType}
                                        </h3>
                                        <div className="flex flex-wrap gap-y-2 gap-x-6 mt-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <span>📅</span>
                                                {new Date(booking.date).toLocaleDateString(undefined, {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>📍</span>
                                                {booking.location?.city}, {booking.location?.pincode}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>💰</span>
                                                ₹{booking.totalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 mt-2 md:mt-0">
                                        <div className="text-right">
                                            {booking.status === 'PENDING' ? (
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-sm text-yellow-600 font-medium">Payment Pending</span>
                                                    <span className="text-xs text-gray-500">Draft Booking</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        Paid: ₹{(booking.paidAmount || 0).toLocaleString()}
                                                    </span>
                                                    {(booking.totalAmount - (booking.paidAmount || 0)) > 0 && (
                                                        <span className="text-xs text-red-500">
                                                            Due: ₹{(booking.totalAmount - (booking.paidAmount || 0)).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-pink-600 group-hover:translate-x-1 transition-transform">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
