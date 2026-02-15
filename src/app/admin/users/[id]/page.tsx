'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

interface DetailedUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'CUSTOMER' | 'ADMIN' | 'DECORATOR';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    bookings: Array<{
        id: string;
        occasionType: string;
        date: string;
        status: any;
        totalAmount: number;
        theme: {
            name: string;
        };
    }>;
    decorations?: Array<{
        id: string;
        occasionType: string;
        date: string;
        status: any;
        totalAmount: number;
        theme: {
            name: string;
        };
    }>;
    testimonials: Array<{
        id: string;
        rating: number;
        comment: string;
        createdAt: string;
        booking: {
            theme: {
                name: string;
            };
        };
    }>;
    _count: {
        bookings: number;
        testimonials: number;
    };
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
    const { user: currentUser, isLoading } = useAuth();
    const isAdmin = useIsAdmin();
    const router = useRouter();

    const [user, setUser] = useState<DetailedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin && params.id) {
            fetchUserDetails();
        }
    }, [isAdmin, params.id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/users/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setUser(data.data);
            } else {
                setError(data.error?.message || 'Failed to fetch user details');
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            setError('An error occurred while loading user details');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async () => {
        if (!user) return;

        const newStatus = !user.isActive;
        const confirmMsg = newStatus
            ? 'Are you sure you want to activate this user?'
            : 'Are you sure you want to deactivate this user? They will not be able to log in.';

        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus }),
            });

            const data = await response.json();
            if (data.success) {
                setUser(prev => prev ? { ...prev, isActive: newStatus } : null);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update user status');
        }
    };

    if (isLoading || loading) {
        return (
            <Layout className="bg-gray-50">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                </div>
            </Layout>
        );
    }

    if (!isAdmin) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <Link href="/" className="text-blue-600 hover:underline">Go Home</Link>
                </div>
            </Layout>
        )
    }

    if (error || !user) {
        return (
            <Layout className="bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
                        <Link href="/admin/users" className="text-blue-600 hover:underline">
                            ← Back to Users
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    const totalSpent = user.bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/users"
                            className="p-2 rounded-full hover:bg-white transition-colors text-gray-500"
                        >
                            ←
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                {user.name}
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm">ID: {user.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={toggleUserStatus}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${user.isActive
                                ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {user.isActive ? 'Deactivate User' : 'Activate User'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Profile Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                                    <p className="text-gray-900 font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
                                    <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                            user.role === 'DECORATOR' ? 'bg-purple-100 text-purple-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</label>
                                    <p className="text-gray-900 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Summary</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-700">
                                        {user.role === 'DECORATOR'
                                            ? (user.decorations?.length || 0)
                                            : user._count.bookings}
                                    </p>
                                    <p className="text-xs text-purple-600 font-medium">Total Bookings</p>
                                </div>
                                <div className="p-4 bg-pink-50 rounded-lg">
                                    <p className="text-2xl font-bold text-pink-700">{user._count.testimonials}</p>
                                    <p className="text-xs text-pink-600 font-medium">Reviews</p>
                                </div>
                                <div className="col-span-2 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-700">₹{totalSpent.toLocaleString()}</p>
                                    <p className="text-xs text-blue-600 font-medium">Total Spent</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bookings & Testimonials */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {user.role === 'DECORATOR' ? 'Assigned Tasks' : 'Recent Bookings'}
                                </h2>
                            </div>

                            {(user.role === 'DECORATOR' ? user.decorations : user.bookings)?.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No {user.role === 'DECORATOR' ? 'tasks assigned to' : 'bookings found for'} this user.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {(user.role === 'DECORATOR' ? (user.decorations || []) : user.bookings).map(booking => (
                                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{booking.occasionType}</div>
                                                        <div className="text-xs text-gray-500">{booking.theme.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <BookingStatusBadge status={booking.status} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                        ₹{booking.totalAmount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {user.testimonials.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900">Recent Testimonials</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {user.testimonials.map(review => (
                                        <div key={review.id} className="p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                                            <p className="text-xs text-gray-400 mt-2">For: {review.booking?.theme?.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
