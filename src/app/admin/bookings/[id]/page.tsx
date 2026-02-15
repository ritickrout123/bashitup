'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { Booking, User } from '@/types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

export default function AdminBookingDetailsPage({ params }: { params: { id: string } }) {
    const { user, isLoading: authLoading } = useAuth();
    const isAdmin = useIsAdmin();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [decorators, setDecorators] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [availableAddons, setAvailableAddons] = useState<any[]>([]);
    const [showAddonModal, setShowAddonModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, params.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookingRes, decoratorsRes, addonsRes] = await Promise.all([
                fetch(`/api/admin/bookings/${params.id}`),
                fetch('/api/admin/users?role=DECORATOR'),
                fetch('/api/admin/addons')
            ]);

            const bookingData = await bookingRes.json();
            const decoratorsData = await decoratorsRes.json();
            const addonsData = await addonsRes.json();

            if (bookingData.success) {
                setBooking(bookingData.data);
            }
            if (decoratorsData.success) {
                setDecorators(decoratorsData.data);
            }
            if (addonsData.success) {
                setAvailableAddons(addonsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddon = async (addon: any) => {
        if (!booking) return;
        const currentAddons = booking.addons || [];
        const newAddons = [...currentAddons, { addonId: addon.id, quantity: 1, price: addon.price, addon: addon }];

        updateBookingAddons(newAddons);
        setShowAddonModal(false);
    };

    const handleRemoveAddon = async (addonId: string) => {
        if (!booking || !booking.addons) return;
        const newAddons = booking.addons.filter((ba: any) => ba.addonId !== addonId);
        updateBookingAddons(newAddons);
    };

    const updateBookingAddons = async (newAddons: any[]) => {
        if (!booking) return;
        try {
            setProcessing(true);
            // Construct payload for API
            const addonsPayload = newAddons.map(ba => ({
                addonId: ba.addonId,
                quantity: ba.quantity
            }));

            const res = await fetch(`/api/admin/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addons: addonsPayload })
            });
            const data = await res.json();
            if (data.success) {
                setBooking(data.data);
                // alert('Decor Updated Successfully'); // Optional feedback
            } else {
                alert(data.error?.message || 'Update failed');
            }
        } catch (error) {
            console.error('Addon update error:', error);
            alert('Failed to update addons');
        } finally {
            setProcessing(false);
        }
    };

    const handleAssignDecorator = async (decoratorId: string) => {
        if (!booking) return;
        try {
            setProcessing(true);
            const res = await fetch(`/api/admin/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decoratorId })
            });
            const data = await res.json();
            if (data.success) {
                setBooking(data.data);
                alert('Decorator assigned successfully');
            } else {
                alert(data.error?.message || 'Assignment failed');
            }
        } catch (error) {
            console.error('Assignment error:', error);
            alert('Failed to assign decorator');
        } finally {
            setProcessing(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!booking) return;
        if (!confirm(`Change status to ${newStatus}?`)) return;

        try {
            setProcessing(true);
            const res = await fetch(`/api/admin/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setBooking(data.data);
            } else {
                alert(data.error?.message || 'Update failed');
            }
        } catch (error) {
            console.error('Status update error:', error);
        } finally {
            setProcessing(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!isAdmin || !booking) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold">Access Denied or Booking Not Found</h1>
                    <Link href="/admin/bookings" className="text-pink-600 hover:underline mt-4 block">Back to List</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/admin/bookings" className="text-gray-500 hover:text-gray-900 transition-colors">
                                ← Back
                            </Link>
                            <span className="text-gray-300">|</span>
                            <span className="font-mono text-gray-400">#{booking.id.slice(-6).toUpperCase()}</span>
                            <BookingStatusBadge status={booking.status} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{booking.theme?.name || booking.occasionType}</h1>
                        <p className="text-gray-500">
                            Customer: <span className="font-medium text-gray-900">{booking.customer?.name}</span> • {new Date(booking.date).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Admin Actions */}
                        {booking.status === 'PENDING' && (
                            <button
                                onClick={() => handleStatusUpdate('CONFIRMED')}
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                Approve Booking
                            </button>
                        )}
                        {booking.status === 'CONFIRMED' && (
                            <button
                                onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                Start Job
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Manage Add-ons Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Manage Add-ons (Decor)</h3>
                                <button
                                    onClick={() => setShowAddonModal(true)}
                                    className="text-sm bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-bold hover:bg-pink-100 transition-colors"
                                >
                                    + Add Decor
                                </button>
                            </div>

                            {booking.addons && booking.addons.length > 0 ? (
                                <div className="space-y-3">
                                    {booking.addons.map((ba: any) => (
                                        <div key={ba.addonId} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                                            <div>
                                                <p className="font-bold text-gray-900">{ba.addon.name}</p>
                                                <p className="text-xs text-gray-500">₹{ba.price} x {ba.quantity}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-gray-900">₹{ba.price * ba.quantity}</span>
                                                <button
                                                    onClick={() => handleRemoveAddon(ba.addonId)}
                                                    className="text-red-500 hover:text-red-700 bg-white p-1 rounded-full border border-gray-200"
                                                    title="Remove"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-medium">Add-ons Total</span>
                                        <span className="text-lg font-bold text-pink-600">
                                            ₹{booking.addons.reduce((sum: number, ba: any) => sum + (ba.price * ba.quantity), 0)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 text-sm">No extra decor assigned.</p>
                                </div>
                            )}
                        </div>

                        {/* Decorator Assignment Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Decorator Assignment</h3>
                                {booking.decorator && (
                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold uppercase">Assigned</span>
                                )}
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assigned Decorator</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                    value={booking.decoratorId || ''}
                                    onChange={(e) => handleAssignDecorator(e.target.value)}
                                    disabled={processing}
                                >
                                    <option value="">-- Select Decorator --</option>
                                    {decorators.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    {booking.decoratorId
                                        ? "Selecting a new decorator will reassign this booking."
                                        : "Assign a decorator to handle this event."}
                                </p>
                            </div>
                        </div>

                        {/* Execution Proof Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Execution Proof (Proof of Work)</h3>

                            {booking.proofOfWorkUrl ? (
                                <div>
                                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-4">
                                        <img
                                            src={booking.proofOfWorkUrl}
                                            alt="Proof of Work"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <span>✅ Proof Uploaded</span>
                                        {booking.completedAt && (
                                            <span className="text-gray-400 text-sm">• Completed {new Date(booking.completedAt).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="text-4xl mb-3">📷</div>
                                    <p className="text-gray-500 font-medium">No proof uploaded yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Decorator must upload a photo to complete the job.</p>
                                </div>
                            )}

                            {/* Admin Override for Completion */}
                            {booking.status === 'IN_PROGRESS' && !booking.proofOfWorkUrl && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs text-red-500 mb-2 font-bold">⚠️ Admin Override</p>
                                    <button
                                        onClick={() => handleStatusUpdate('COMPLETED')}
                                        className="text-sm text-gray-600 hover:text-red-600 underline"
                                    >
                                        Force Mark as Completed (without proof)
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Event Details (Read Only) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase">Venue</span>
                                    <p className="font-medium">{booking.location?.address}, {booking.location?.city}</p>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase">Guests</span>
                                    <p className="font-medium">{booking.guestCount}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-xs text-gray-500 uppercase">Special Requests</span>
                                    <p className="font-medium italic text-gray-600">{booking.specialRequests || 'None'}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Customer & Financials */}
                    <div className="space-y-6">

                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Info</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-lg">
                                    {booking.customer?.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{booking.customer?.name}</p>
                                    <p className="text-sm text-gray-500">Customer</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span>📧</span> {booking.customer?.email}
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span>📞</span> {booking.customer?.phone || 'N/A'}
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <Link href={`/admin/users/${booking.customerId}`} className="text-sm font-bold text-pink-600 hover:text-pink-700">
                                    View Full Profile →
                                </Link>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status</h3>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-gray-500">Total</span>
                                <span className="text-xl font-bold text-gray-900">₹{booking.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-500">Paid</span>
                                <span className="text-green-600 font-bold">₹{(booking.paidAmount || 0).toLocaleString()}</span>
                            </div>
                            <div className={`p-3 rounded-lg text-center font-bold text-sm ${booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {booking.paymentStatus}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Addon Modal */}
                {showAddonModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Add Decor Item</h3>
                                <button onClick={() => setShowAddonModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="space-y-2">
                                {availableAddons.map(addon => {
                                    const isAdded = booking.addons?.some((ba: any) => ba.addonId === addon.id);
                                    if (isAdded) return null; // Don't show already added addons
                                    return (
                                        <button
                                            key={addon.id}
                                            onClick={() => handleAddAddon(addon)}
                                            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900 group-hover:text-pink-700">{addon.name}</span>
                                                <span className="font-bold text-gray-900">₹{addon.price}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{addon.category}</p>
                                        </button>
                                    );
                                })}
                                {availableAddons.length === 0 && (
                                    <p className="text-center text-gray-500 my-4">No addons available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
}
