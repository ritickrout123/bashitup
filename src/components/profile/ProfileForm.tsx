'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

export default function ProfileForm() {
    const { user, mutate } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to update profile');
            }

            await mutate(); // Refresh user data
            showSuccessToast('Profile updated successfully');
        } catch (err: any) {
            setError(err.message);
            showErrorToast(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Update your personal details.
                        </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address (ReadOnly)
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 9876543210"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="mt-4 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <LoadingButton
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Saving..."
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save
                </LoadingButton>
            </div>
        </form>
    );
}
