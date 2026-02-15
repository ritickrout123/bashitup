'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { Booking } from '@/types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';


export default function DecoratorDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [assignments, setAssignments] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!user) return;
            try {
                // Filter by the current user's ID to show only their assignments
                const response = await fetch(`/api/admin/bookings?decoratorId=${user.id}`);
                const data = await response.json();
                if (data.success) {
                    // API returns data as the array directly, or inside data.bookings depending on implementation.
                    // Based on route.ts: return NextResponse.json({ success: true, data: bookings });
                    setAssignments(Array.isArray(data.data) ? data.data : []);
                }
            } catch (error) {
                console.error('Failed to fetch decorator assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'DECORATOR') {
            fetchAssignments();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'DECORATOR') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
                    <p className="text-gray-600 mb-6">This area is for authorized decorators only.</p>
                    <Link href="/dashboard" className="text-purple-600 hover:underline">Return to Dashboard</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                    <p className="text-gray-500">Upcoming events assigned to you</p>
                </div>

                {/* Metrics / Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase">Upcoming</span>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {assignments.filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase">Completed</span>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {assignments.filter(a => a.status === 'COMPLETED').length}
                        </p>
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading tasks...</p>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 dashed">
                            <span className="text-4xl block mb-4">🎉</span>
                            <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                            <p className="text-gray-500">No pending assignments at the moment.</p>
                        </div>
                    ) : (
                        assignments.map(booking => (
                            <JobCard key={booking.id} booking={booking} />
                        ))
                    )}
                </div>

            </div>
        </Layout>
    );
}

import { ImageUpload } from '@/components/ui/ImageUpload';

const JobCard = ({ booking }: { booking: Booking }) => {
    const [proofUrl, setProofUrl] = useState<string | null>(booking.proofOfWorkUrl || null);
    const [status, setStatus] = useState(booking.status);
    const [expanded, setExpanded] = useState(false);

    const updateStatus = async (newStatus: string) => {
        try {
            const body: any = { status: newStatus };
            if (newStatus === 'COMPLETED' && proofUrl) body.proofOfWorkUrl = proofUrl;

            const res = await fetch(`/api/admin/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                setStatus(newStatus as any);
                // Ideally refresh parent list, but local update suffices for demo
            } else {
                alert(data.error?.message || 'Update failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating status');
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase">
                            {booking.theme?.name || 'No Theme'}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.location?.address}, {booking.location?.city}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Setup needed by: <span className="font-semibold text-gray-900">{booking.startTime}</span> • {booking.guestCount} Guests
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        {expanded ? 'Hide Details' : 'View Instructions'}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">📍 Location Details</h4>
                        <p className="text-gray-700">{booking.location?.address}</p>
                        <p className="text-gray-700">{booking.location?.city}, {booking.location?.zip}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">📋 Setup Notes</h4>
                        <p className="text-gray-700 italic">
                            {booking.specialRequests || "No special instructions provided."}
                        </p>
                    </div>
                </div>
            )}


            <div className="mt-6 pt-6 border-t border-gray-100">
                {status === 'CONFIRMED' || status === 'IN_PROGRESS' ? (
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Execution Proof</h4>

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1">
                                {proofUrl ? (
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                        <img src={proofUrl} alt="Proof" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">Uploaded</div>
                                    </div>
                                ) : (
                                    <ImageUpload onUpload={setProofUrl} label="Upload Setup Photo (Required)" />
                                )}
                            </div>

                            <div className="flex gap-3 mt-4 md:mt-0">
                                {status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => updateStatus('IN_PROGRESS')}
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Start Job
                                    </button>
                                )}

                                {status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => updateStatus('COMPLETED')}
                                        disabled={!proofUrl}
                                        className={`px-6 py-3 font-bold rounded-xl transition-all ${proofUrl
                                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {proofUrl ? 'Complete Job' : 'Upload Photo to Complete'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>✅</span> Job Completed
                    </div>
                )}
            </div>
        </div >
    );
};
