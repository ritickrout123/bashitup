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
    const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'support'>('overview');
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

        if (user) fetchBooking();
        else if (!authLoading) setLoading(false);
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
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                    <Link href="/login" className="text-pink-600 hover:underline">Log in to view booking</Link>
                </div>
            </Layout>
        )
    }

    if (error || !booking) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
                    <p className="text-gray-500 mb-8">{error || "We couldn't find the booking you're looking for."}</p>
                    <Link href="/dashboard/bookings" className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                        Return to Bookings
                    </Link>
                </div>
            </Layout>
        );
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isPendingPayment = booking.paymentStatus === 'PENDING' || (booking.paidAmount || 0) < booking.totalAmount;

    return (
        <Layout className="bg-gray-50 min-h-screen">

            {/* Hero Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <Link href="/dashboard/bookings" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors">
                            ← Back to Timeline
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <BookingStatusBadge status={booking.status} className="!text-sm px-3 py-1" />
                                <span className="text-sm font-medium text-gray-400">#{booking.id.slice(-8).toUpperCase()}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {booking.theme?.name || booking.occasionType}
                            </h1>
                            <p className="text-gray-500 flex items-center gap-2">
                                📅 {formatDate(booking.date)} • ⏰ {booking.startTime}
                            </p>
                        </div>

                        {/* Primary Action Button based on status */}
                        <div className="flex gap-3">
                            {booking.status === 'PENDING' && (
                                <button className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                                    Cancel Request
                                </button>
                            )}
                            {isPendingPayment && booking.status !== 'CANCELLED' && (
                                <button className="px-8 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-200 transition-all hover:-translate-y-0.5 animate-pulse">
                                    Complete Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-gray-200 gap-8">
                            {['overview', 'financials', 'support'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors relative ${activeTab === tab ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* TAB CONTENT: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Event Details Card */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Event Details</h3>
                                    <div className="grid sm:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Occasion</label>
                                            <p className="text-lg font-medium text-gray-900">{booking.occasionType}</p>
                                        </div>
                                        {/* <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Expected Guests</label>
                                            <p className="text-lg font-medium text-gray-900">{booking.guestCount} People</p>
                                        </div> */}
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Location</label>
                                            <p className="text-lg font-medium text-gray-900">{booking.location?.address}</p>
                                            <p className="text-gray-500">{booking.location?.city}, {booking.location?.pincode}</p>
                                        </div>
                                        {booking.specialRequests && (
                                            <div className="sm:col-span-2 bg-yellow-50 p-6 rounded-2xl">
                                                <label className="text-xs font-bold text-yellow-600 uppercase tracking-wider block mb-2">Special Requests</label>
                                                <p className="text-yellow-800 italic">"{booking.specialRequests}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline Tracker */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Status Timeline</h3>
                                    <div className="relative border-l-2 border-gray-100 ml-3 space-y-10 pl-8 py-2">
                                        {booking.statusHistory?.map((item, index) => (
                                            <div key={index} className="relative">
                                                <span className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${index === booking.statusHistory!.length - 1 ? 'bg-pink-500 ring-4 ring-pink-50' : 'bg-gray-300'
                                                    }`}></span>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{item.status}</p>
                                                    <p className="text-sm text-gray-500 mb-2">{new Date(item.timestamp).toLocaleString()}</p>
                                                    {item.note && (
                                                        <p className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                                                            {item.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(!booking.statusHistory || booking.statusHistory.length === 0) && (
                                            <p className="text-gray-400 italic">No updates available yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: FINANCIALS */}
                        {activeTab === 'financials' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-fadeIn">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Payment Invoice</h3>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {booking.paymentStatus}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Base Package Price</span>
                                        <span className="font-medium">₹{booking.totalAmount.toLocaleString()}</span>
                                    </div>
                                    {/* Placeholder for Add-ons breakdown if implemented */}
                                    {/* <div className="flex justify-between text-gray-600">
                                         <span>Add-ons</span>
                                         <span className="font-medium">₹0</span>
                                     </div> */}
                                    <div className="border-t border-dashed border-gray-200 my-4"></div>
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total Amount</span>
                                        <span>₹{booking.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 bg-green-50 p-4 rounded-xl">
                                        <span className="font-medium">Amount Paid</span>
                                        <span className="font-bold">- ₹{(booking.paidAmount || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Balance Due</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{Math.max(0, booking.totalAmount - (booking.paidAmount || 0)).toLocaleString()}
                                        </p>
                                    </div>
                                    {isPendingPayment && (
                                        <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-colors">
                                            Pay Balance
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: SUPPORT */}
                        {activeTab === 'support' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white text-center">
                                    <h3 className="text-2xl font-bold mb-4">We're here to help!</h3>
                                    <p className="text-indigo-100 mb-8 max-w-md mx-auto">
                                        Need to make changes or have questions about your event? Our support team is ready to assist you.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                                            Chat with Us
                                        </button>
                                        <button className="px-6 py-3 bg-indigo-500/30 text-white font-bold rounded-xl hover:bg-indigo-500/50 transition-colors border border-indigo-400/30">
                                            Call Support
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                                    <div className="space-y-4">
                                        <details className="group">
                                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-700 group-hover:text-pink-600 transition-colors">
                                                <span>What is the cancellation policy?</span>
                                                <span className="transition group-open:rotate-180">▼</span>
                                            </summary>
                                            <p className="text-gray-500 mt-3 group-open:animate-fadeIn">
                                                You can cancel up to 48 hours before the event for a full refund of your advance.
                                            </p>
                                        </details>
                                        <div className="h-px bg-gray-100"></div>
                                        <details className="group">
                                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-700 group-hover:text-pink-600 transition-colors">
                                                <span>Can I change the date?</span>
                                                <span className="transition group-open:rotate-180">▼</span>
                                            </summary>
                                            <p className="text-gray-500 mt-3 group-open:animate-fadeIn">
                                                Yes, subject to availability. Please contact support at least 3 days in advance.
                                            </p>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Theme Info Widget */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                            <div className="h-32 bg-gray-200 w-full relative">
                                {/* Placeholder for Theme Image */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Theme Image
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="font-bold text-gray-900 mb-1">{booking.theme?.name}</h4>
                                <p className="text-sm text-gray-500 mb-4">Selected Theme Package</p>
                                <Link
                                    href="/themes"
                                    className="block w-full py-2 border border-gray-200 rounded-lg text-center text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    View Theme Details
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
