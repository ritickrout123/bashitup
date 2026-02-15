
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

interface BookingHistoryCardProps {
    userId: string;
}

export const BookingHistoryCard: React.FC<BookingHistoryCardProps> = ({ userId }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Fetch latest 3 bookings
                const response = await fetch(`/api/bookings?customerId=${userId}&limit=3`);
                const data = await response.json();
                if (data.success) {
                    setBookings(data.data.bookings);
                } else {
                    setError('Failed to load bookings');
                }
            } catch (err) {
                console.error('Error fetching dashboard bookings:', err);
                setError('Failed to load bookings');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchBookings();
        }
    }, [userId]);

    if (isLoading) {
        return (
            <div className="bg-white overflow-hidden shadow rounded-lg h-full min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-6 pb-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Your Bookings</h3>
                <Link href="/dashboard/bookings" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                    View All
                </Link>
            </div>

            <div className="flex-1 p-6">
                {bookings.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        <p className="mb-4">No bookings yet.</p>
                        <Link
                            href="/booking"
                            className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 shadow-sm"
                        >
                            Book Your First Event
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {booking.theme?.name || booking.occasionType}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {new Date(booking.date).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} • {booking.startTime}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {booking.location?.city || 'Location Pending'}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <BookingStatusBadge status={booking.status} />
                                    <Link
                                        href={`/dashboard/bookings/${booking.id}`}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Details →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
