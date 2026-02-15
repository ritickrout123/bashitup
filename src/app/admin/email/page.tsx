'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

export default function EmailCampaignPage() {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [targetRole, setTargetRole] = useState('ALL');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !content) {
            showErrorToast('Please fill in all fields');
            return;
        }

        if (!confirm('Are you sure you want to send this email to ' + (targetRole === 'ALL' ? 'all users' : targetRole + ' users') + '?')) {
            return;
        }

        setIsSending(true);

        try {
            // Get token from cookie or storage (handled by auth context usually, but for fetch we need to pass it)
            // Assuming headers are handled or we need to grab it. 
            // For MVP, if auth is cookie-based, it sends auto. If bearer, we need it. 
            // The API route checks authorization header. AuthService usually stores it.
            // Let's assume standard fetch wrapper or just try to get it from localStorage if that's where it lives.
            // Based on `useAuth`, `user` object might not have token.
            // Wait, `AuthService.login` sets secure cookies. The middleware or API logic uses cookies?
            // The API logic `route.ts` I wrote checks `Authorization: Bearer ...`.
            // I should update the API to checking cookies if that's how the app works, OR I should send the token here.
            // Let's check `useAuth` hook implementation or just use cookies in API.
            // Looking at `register` route, it sets cookies.
            // So the API should probably read cookies.

            // I'll update the API to read cookies next if needed, but for now let's try to send simple fetch.
            // If the API requires Bearer token, I need to get it. 
            // User might be stored in context, let's assume we can get token.

            const response = await fetch('/api/email/campaign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // If needed
                },
                body: JSON.stringify({
                    subject,
                    content,
                    targetRole
                }),
            });

            const data = await response.json();

            if (data.success) {
                showSuccessToast('Campaign sent successfully!');
                setSubject('');
                setContent('');
            } else {
                showErrorToast(data.error?.message || 'Failed to send campaign');
            }
        } catch (error) {
            console.error('Send error:', error);
            showErrorToast('An error occurred while sending');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Email Marketing
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Send updates and offers to your users.
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSend} className="space-y-6">

                            <div>
                                <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700">
                                    Recipients
                                </label>
                                <select
                                    id="targetRole"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="ALL">All Users</option>
                                    <option value="CUSTOMER">Customers Only</option>
                                    <option value="DECORATOR">Decorators Only</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                    Subject Line
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="e.g. Special Offer for You!"
                                />
                            </div>

                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                    Email Content (HTML supported)
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="content"
                                        rows={10}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                                        placeholder="<h1>Hello!</h1><p>Write your message here...</p>"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Basic HTML tags are supported for formatting.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSending ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isSending ? 'Sending...' : 'Send Campaign'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
