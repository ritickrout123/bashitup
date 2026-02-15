
'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface EmailTemplate {
    id: string;
    name: string;
}

interface EmailEvent {
    id: string;
    eventKey: string;
    description: string;
    isActive: boolean;
    delay: number;
    recipientType: string;
    templateId: string | null;
    template: EmailTemplate | null;
}

export default function EmailEventsPage() {
    const { user, isLoading } = useAuth();
    const isAdmin = useIsAdmin();
    const [events, setEvents] = useState<EmailEvent[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loadingConfig, setLoadingConfig] = useState(true);

    useEffect(() => {
        if (user && isAdmin) {
            fetchData();
        }
    }, [user, isAdmin]);

    const fetchData = async () => {
        try {
            const [eventsRes, templatesRes] = await Promise.all([
                fetch('/api/admin/email-events'),
                fetch('/api/admin/email-templates')
            ]);

            const eventsData = await eventsRes.json();
            const templatesData = await templatesRes.json();

            if (eventsData.success) setEvents(eventsData.data);
            if (templatesData.success) setTemplates(templatesData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showErrorToast('Failed to load configuration');
        } finally {
            setLoadingConfig(false);
        }
    };

    const handlUpdateEvent = async (id: string, updates: Partial<EmailEvent>) => {
        try {
            const response = await fetch(`/api/admin/email-events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            const data = await response.json();
            if (data.success) {
                setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
                showSuccessToast('Event updated successfully');
            } else {
                showErrorToast('Failed to update event');
            }
        } catch (error) {
            console.error('Update error:', error);
            showErrorToast('Error updating event');
        }
    };

    if (isLoading || loadingConfig) {
        return (
            <Layout className="bg-gray-50">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (!isAdmin) return null;

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Email Events
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Configure when system emails are sent and which templates they use.
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <a
                            href="/admin/email-templates"
                            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Manage Templates
                        </a>
                    </div>
                </div>

                {/* Events Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Event
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Template
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Config
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{event.eventKey}</div>
                                        <div className="text-sm text-gray-500">{event.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={event.templateId || ''}
                                            onChange={(e) => handlUpdateEvent(event.id, { templateId: e.target.value || null })}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Select Template...</option>
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handlUpdateEvent(event.id, { isActive: !event.isActive })}
                                            type="button"
                                            className={`${event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                } inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                        >
                                            {event.isActive ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs">Delay (min):</span>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-16 border-gray-300 rounded-md text-sm"
                                                value={event.delay}
                                                onChange={(e) => handlUpdateEvent(event.id, { delay: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
