
import React from 'react';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface BookingStatusBadgeProps {
    status: BookingStatus | string;
    className?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-50' },
    CONFIRMED: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50' },
    IN_PROGRESS: { label: 'In Progress', color: 'text-purple-700', bg: 'bg-purple-50' },
    COMPLETED: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50' },
};

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, className = '' }) => {
    const config = statusConfig[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-50' };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}
        >
            {config.label}
        </span>
    );
};
