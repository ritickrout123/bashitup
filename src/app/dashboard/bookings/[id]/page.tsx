
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { Booking } from '@/types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
    const { user, isLoading: authLoading } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBooking = async () => {
            if (!user) return;

            try {
                const response = await fetch(`/api/bookings/${params.id}`);
                const data = await response.json();

                if (data.success) {
                    setBooking(data.data);
                } else {
                    setError(data.error?.message || 'Failed to load booking details');
                }
            } catch (err) {
                console.error('Error fetching booking details:', err);
                setError('Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchBooking();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading, params.id]);

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
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="mb-4">Please log in to view this booking.</p>
                    <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
                </div>
            </Layout>
        )
    }

    if (error || !booking) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ❌
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to load booking</h1>
                    <p className="text-gray-500 mb-6">{error || 'Booking not found'}</p>
                    <Link href="/dashboard/bookings" className="text-pink-600 hover:underline font-medium">
                        ← Back to My Bookings
                    </Link>
                </div>
            </Layout>
        );
    }

    // Helper to format date
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb & Header */}
                <div className="mb-8">
                    <Link href="/dashboard/bookings" className="text-sm text-gray-500 hover:text-gray-700 flex items-center mb-4">
                        ← Back to My Bookings
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Booking #{booking.id.slice(-8).toUpperCase()}
                                </h1>
                                <BookingStatusBadge status={booking.status} className="text-sm px-3 py-1" />
                            </div>
                            <p className="text-gray-500">
                                Created on {formatDate(booking.createdAt)}
                            </p>
                        </div>
                        {booking.status === 'PENDING' && (
                            <button className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                                Cancel Booking
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content - Left Column */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Event Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Event Details</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Occasion</label>
                                        <p className="text-gray-900 font-medium">{booking.occasionType}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Theme</label>
                                        <p className="text-gray-900 font-medium">{booking.theme?.name || 'Standard Setup'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Date & Time</label>
                                        <p className="text-gray-900 font-medium">
                                            {formatDate(booking.date)}
                                        </p>
                                        <p className="text-sm text-gray-500">{booking.startTime} - {booking.endTime}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Guest Count</label>
                                        <p className="text-gray-900 font-medium">{booking.guestCount} Guests</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                                    <p className="text-gray-900 font-medium">
                                        {booking.location?.address}
                                    </p>
                                    <p className="text-gray-600">
                                        {booking.location?.city}, {booking.location?.pincode}
                                    </p>
                                </div>

                                {booking.specialRequests ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Special Requests</label>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                                            "{booking.specialRequests}"
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Timeline / Status History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Track Status</h3>
                            </div>
                            <div className="p-6">
                                {booking.statusHistory && booking.statusHistory.length > 0 ? (
                                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8 py-2">
                                        {booking.statusHistory.map((item, index) => (
                                            <div key={index} className="relative">
                                                <span className={`absolute -left-[39px] top-1 w-5 h-5 rounded-full border-2 border-white ring-2 ${index === booking.statusHistory!.length - 1 ? 'bg-pink-500 ring-pink-100' : 'bg-gray-300 ring-gray-100'
                                                    }`}></span>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.status}</p>
                                                    <p className="text-sm text-gray-500 mb-1">{new Date(item.timestamp).toLocaleString()}</p>
                                                    {item.note && <p className="text-sm text-gray-600 bg-gray-50 inline-block px-3 py-1 rounded mt-1">{item.note}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">No tracking history available yet.</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar - Payment & Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Amount</span>
                                        <span className="font-medium">₹{booking.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-700 bg-green-50 p-2 rounded">
                                        <span className="font-medium">Advance Paid</span>
                                        <span className="font-bold">- ₹{(booking.paidAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold text-lg text-gray-900">
                                        <span>Balance Due</span>
                                        <span>₹{(booking.totalAmount - (booking.paidAmount || 0)).toLocaleString()}</span>
                                    </div>
                                    {booking.paymentStatus === 'PAID' && (booking.totalAmount - (booking.paidAmount || 0) > 0) && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            * Balance is due on the day of the event.
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-600">Payment Status</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {booking.paymentStatus} {booking.paidAmount && booking.paidAmount < booking.totalAmount ? '(Partial)' : ''}
                                        </span>
                                    </div>
                                    {booking.paymentStatus === 'PENDING' && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            Your advance token payment is pending. Please pay to confirm your slot.
                                        </div>
                                    )}
                                </div>

                                {booking.paymentStatus === 'PENDING' && (
                                    <button className="w-full py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-md transition-colors">
                                        Pay Advance Token
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg text-white p-6">
                            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                            <p className="text-indigo-100 text-sm mb-4">
                                Have questions about your booking? Our expert planners are here to help.
                            </p>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                                    Chat Support
                                </button>
                                <button className="flex-1 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                    Call Us
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
