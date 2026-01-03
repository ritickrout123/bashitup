'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch('/api/bookings/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ session_id: sessionId }),
                });

                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setBookingDetails(data.data);
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Verifying your payment...</h2>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h2>
                <p className="text-gray-600 mb-8">We couldn't verify your payment. Please contact support if you believe this is an error.</p>
                <button
                    onClick={() => router.push('/booking')}
                    className="px-6 py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
                >
                    Return to Booking
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
            >
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
                <p className="text-xl text-gray-600 mb-12">
                    Thank you for your payment. Your booking for <span className="font-semibold text-pink-600">{bookingDetails?.theme?.name}</span> has been confirmed.
                </p>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-4">Booking Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                            <p className="font-mono font-medium text-gray-900">{bookingDetails?.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                            <p className="font-medium text-gray-900">
                                {new Date(bookingDetails?.date).toLocaleDateString()} | {bookingDetails?.startTime}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                            <p className="font-medium text-green-600">₹{bookingDetails?.paidAmount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {bookingDetails?.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
                    >
                        View Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Layout>
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </Layout>
    );
}
