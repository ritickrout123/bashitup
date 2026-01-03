'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import ProfileForm from '@/components/profile/ProfileForm';

export default function ProfilePage() {
    const { isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        if (typeof window !== 'undefined') {
            window.location.href = '/login?redirect=/dashboard/profile';
        }
        return null;
    }

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between px-4 sm:px-0 mb-6">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Profile Settings
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <a
                            href="/dashboard"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to Dashboard
                        </a>
                    </div>
                </div>

                <ProfileForm />
            </div>
        </Layout>
    );
}
