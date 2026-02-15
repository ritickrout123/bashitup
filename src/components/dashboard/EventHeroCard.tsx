import React from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

interface EventHeroCardProps {
    booking?: Booking;
    userName: string;
}

export const EventHeroCard: React.FC<EventHeroCardProps> = ({ booking, userName }) => {
    if (!booking) {
        return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-xl">
                <div className="absolute inset-0 bg-[url('/images/confetti-overlay.png')] opacity-10"></div>
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Ready to plan your next <br />
                            <span className="text-yellow-300">unforgettable moment?</span>
                        </h2>
                        <p className="text-pink-100 text-lg mb-8">
                            From intimate gatherings to grand celebrations, we make it easy.
                        </p>
                        <Link
                            href="/booking"
                            className="inline-flex items-center px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            ✨ Start Planning Now
                        </Link>
                    </div>
                    <div className="hidden md:block text-9xl opcaity-80">
                        🎉
                    </div>
                </div>
            </div>
        );
    }

    const eventDate = new Date(booking.date);
    const today = new Date();
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl transition-all hover:shadow-2xl group">
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Upcoming Event
                            </span>
                            <BookingStatusBadge status={booking.status} className="!text-xs" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                            {booking.theme?.name || booking.occasionType}
                        </h2>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <span>📍</span> {booking.location?.city || 'Location TBD'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-2xl text-center min-w-[120px] border border-pink-100/50">
                        {daysLeft > 0 ? (
                            <>
                                <span className="block text-4xl font-bold text-pink-600">{daysLeft}</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Days To Go</span>
                            </>
                        ) : daysLeft === 0 ? (
                            <span className="block text-xl font-bold text-pink-600 animate-pulse">Today!</span>
                        ) : (
                            <span className="block text-lg font-bold text-gray-500">Completed</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-100 pt-8">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Date</label>
                        <p className="font-semibold text-gray-900 text-lg">
                            {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Time</label>
                        <p className="font-semibold text-gray-900 text-lg">{booking.startTime}</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Guests</label>
                        <p className="font-semibold text-gray-900 text-lg">{booking.guestCount}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end items-center">
                        <Link
                            href={`/dashboard/bookings/${booking.id}`}
                            className="w-full md:w-auto text-center px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                        >
                            View Details →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
