'use client';

import React, { useEffect, useState } from 'react';
import { Booking } from '@/types';

interface AdminMetricsProps {
    className?: string;
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ className = '' }) => {
    const [metrics, setMetrics] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        monthlyRevenue: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // In a real app, this would be a dedicated aggregation endpoint.
                // For now, we'll fetch recent bookings/users to calculate basic stats
                // or use a mock logic if the API doesn't support aggregation yet.
                // Assuming we have basic list endpoints.

                const [bookingsRes, usersRes] = await Promise.all([
                    fetch('/api/admin/bookings?limit=100'),
                    fetch('/api/admin/users?limit=1') // Just to get count if implementation supports pagination metadata
                ]);

                const bookingsData = await bookingsRes.json();
                const usersData = await usersRes.json();

                if (bookingsData.success) {
                    const allBookings: Booking[] = bookingsData.data.bookings || [];

                    const totalBookings = bookingsData.data.pagination?.total || allBookings.length;
                    const pendingBookings = allBookings.filter(b => b.status === 'PENDING').length;

                    // Simple revenue calc
                    const validBookings = allBookings.filter(b => ['CONFIRMED', 'COMPLETED', 'IN_PROGRESS'].includes(b.status));
                    const monthlyRevenue = validBookings.reduce((sum, b) => sum + b.totalAmount, 0);

                    setMetrics({
                        totalBookings,
                        pendingBookings,
                        monthlyRevenue,
                        totalUsers: usersData.data?.pagination?.total || (usersData.data ? usersData.data.length : 0) || 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch admin metrics:', error);
                // Ensure loading is false even on error so UI shows 0s instead of skeleton
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Bookings</span>
                <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.totalBookings}</span>
                    <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                        All Time
                    </span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending Actions</span>
                <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.pendingBookings}</span>
                    {metrics.pendingBookings > 0 ? (
                        <span className="text-white text-sm font-medium bg-red-500 px-2 py-1 rounded-lg animate-pulse">
                            Needs Attention
                        </span>
                    ) : (
                        <span className="text-gray-400 text-sm">All Clear</span>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Revenue (Est.)</span>
                <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-bold text-gray-900">
                        ₹{(metrics.monthlyRevenue / 1000).toFixed(1)}k
                    </span>
                    <span className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-1 rounded-lg">
                        Active
                    </span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Users</span>
                <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.totalUsers}</span>
                    <span className="text-purple-600 text-sm font-medium bg-purple-50 px-2 py-1 rounded-lg">
                        Registered
                    </span>
                </div>
            </div>

        </div>
    );
};
