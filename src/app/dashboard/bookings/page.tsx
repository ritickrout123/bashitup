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

        if (user) fetchBookings();
        else if (!authLoading) setLoading(false);
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
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Please log in</h1>
                    <p className="text-gray-500 mb-8">You need to be logged in to view your bookings.</p>
                    <Link href="/login" className="px-8 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </Layout>
        )
    }

    return (
        <Layout className="bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Journey</h1>
                        <p className="text-gray-500 mt-1">Timeline of your events with BashItNow</p>
                    </div>
                    <Link
                        href="/booking"
                        className="hidden sm:inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        + New Booking
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-8">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="text-6xl mb-6">✨</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Your timeline is empty. Start planning your first unforgettable event today!
                        </p>
                        <Link
                            href="/booking"
                            className="inline-flex items-center px-8 py-3 bg-pink-600 text-white rounded-full font-bold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-pink-200"
                        >
                            Start Planning
                        </Link>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>

                        <div className="space-y-12">
                            {bookings.map((booking, index) => {
                                const eventDate = new Date(booking.date);
                                const isPast = eventDate < new Date();

                                return (
                                    <div key={booking.id} className="relative md:pl-24 transition-all hover:translate-x-1 duration-300">
                                        {/* Timeline Dot */}
                                        <div className={`hidden md:flex absolute left-0 top-6 w-16 h-16 rounded-2xl items-center justify-center border-4 border-white shadow-md z-10 ${isPast ? 'bg-gray-100 text-gray-400' : 'bg-pink-50 text-pink-600'
                                            }`}>
                                            <div className="text-center leading-tight">
                                                <span className="block text-xs font-bold uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                                                <span className="block text-xl font-bold">{eventDate.getDate()}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/dashboard/bookings/${booking.id}`}
                                            className="block group"
                                        >
                                            <div className={`bg-white rounded-2xl p-6 sm:p-8 border-2 transition-all duration-300 ${booking.status === 'CONFIRMED'
                                                    ? 'border-pink-100 shadow-xl shadow-pink-50 hover:border-pink-200'
                                                    : 'border-transparent shadow-lg hover:shadow-xl hover:border-gray-100'
                                                }`}>
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <BookingStatusBadge status={booking.status} className="!text-xs py-1 px-3" />
                                                            <span className="text-xs font-medium text-gray-400">#{booking.id.slice(-6).toUpperCase()}</span>
                                                        </div>

                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                                                            {booking.theme?.name || booking.occasionType}
                                                        </h3>

                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">📍</span> {booking.location?.city || 'Location Pending'}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">👥</span> {booking.guestCount} Guests
                                                            </div>
                                                            <div className="flex items-center gap-2 md:hidden">
                                                                <span className="text-lg">📅</span> {eventDate.toLocaleDateString()}
                                                            </div>
                                                        </div>

                                                        {booking.status === 'PENDING' && (
                                                            <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3 inline-block">
                                                                ℹ️ We are verifying your request. Expect an update shortly.
                                                            </p>
                                                        )}
                                                        {booking.status === 'CONFIRMED' && (
                                                            <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 inline-block">
                                                                ✅ Booking confirmed! Your decorator is preparing.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end sm:text-right border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 gap-4">
                                                        <div>
                                                            <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                                                            <p className="text-xl font-bold text-gray-900">₹{booking.totalAmount.toLocaleString()}</p>
                                                        </div>

                                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 group-hover:bg-pink-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                                            ↗
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
