
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface TemplateForm {
    name: string;
    subject: string;
    htmlContent: string;
    type: string;
    isActive: boolean;
}

const PREVIEW_DATA = {
    user: {
        name: 'Rohit',
        email: 'rohit@example.com'
    },
    booking: {
        id: 'BN1234',
        date: '24 Feb 2026',
        city: 'Bangalore',
        occasion: 'Birthday Bash',
        totalAmount: '15000'
    }
};

export default function TemplateEditor({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const isAdmin = useIsAdmin();
    const isNew = params.id === 'new';

    const [formData, setFormData] = useState<TemplateForm>({
        name: '',
        subject: '',
        htmlContent: '',
        type: 'TRANSACTIONAL',
        isActive: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(!isNew);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    useEffect(() => {
        if (user && isAdmin && !isNew) {
            fetchTemplate();
        }
    }, [user, isAdmin, isNew]);

    const fetchTemplate = async () => {
        try {
            const response = await fetch(`/api/admin/email-templates/${params.id}`);
            const data = await response.json();
            if (data.success) {
                setFormData({
                    name: data.data.name,
                    subject: data.data.subject,
                    htmlContent: data.data.body,
                    type: data.data.type,
                    isActive: data.data.isActive
                });
            } else {
                showErrorToast('Template not found');
                router.push('/admin/email-templates');
            }
        } catch (error) {
            console.error(error);
            showErrorToast('Error loading template');
        } finally {
            setFetchLoading(false);
        }
    };

    const replaceVariables = (text: string, data: any) => {
        if (!text) return '';
        return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const keys = path.trim().split('.');
            let value = data;
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return match;
                }
            }
            return String(value);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.subject || !formData.htmlContent) {
            showErrorToast('Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const url = isNew
                ? '/api/admin/email-templates'
                : `/api/admin/email-templates/${params.id}`;

            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showSuccessToast(`Template ${isNew ? 'created' : 'updated'} successfully`);
                router.push('/admin/email-templates');
            } else {
                showErrorToast(data.error || 'Operation failed');
            }
        } catch (error) {
            console.error(error);
            showErrorToast('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTestSend = async () => {
        if (!testEmail) {
            showErrorToast('Please enter an email address');
            return;
        }
        setSendingTest(true);
        try {
            const response = await fetch('/api/admin/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    subject: formData.subject,
                    htmlContent: formData.htmlContent,
                    data: PREVIEW_DATA
                }),
            });
            const data = await response.json();
            if (data.success) {
                showSuccessToast('Test email sent successfully');
                setShowTestModal(false);
            } else {
                showErrorToast(data.error || 'Failed to send test email');
            }
        } catch (error) {
            console.error(error);
            showErrorToast('Error sending test email');
        } finally {
            setSendingTest(false);
        }
    };

    if (isLoading || (fetchLoading && !isNew)) {
        return (
            <Layout className="bg-gray-50">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (!isAdmin) return null;

    const previewSubject = replaceVariables(formData.subject, PREVIEW_DATA);
    const previewBody = replaceVariables(formData.htmlContent, PREVIEW_DATA);

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            {isNew ? 'Create New Template' : 'Edit Template'}
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowTestModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            Send Test Email
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Editor Column */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden h-fit">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Template Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Welcome Email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <select
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="TRANSACTIONAL">Transactional</option>
                                            <option value="MARKETING">Marketing</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="e.g. Welcome {{user.name}}!"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Supports variables like {'{{user.name}}'}, {'{{booking.id}}'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">HTML Content</label>
                                    <div className="mt-1">
                                        <textarea
                                            rows={20}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md font-mono"
                                            value={formData.htmlContent}
                                            onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                                            placeholder="<html><body>...</body></html>"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="isActive"
                                        name="isActive"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                        Active
                                    </label>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden flex flex-col h-[800px]">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                            <div className="group relative">
                                <span className="cursor-help text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 bg-blue-50">
                                    View Preview Data
                                </span>
                                <div className="absolute right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none group-hover:pointer-events-auto">
                                    <pre>{JSON.stringify(PREVIEW_DATA, null, 2)}</pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-b border-gray-200 bg-white">
                            <span className="text-sm font-medium text-gray-500">Subject: </span>
                            <span className="text-sm text-gray-900 font-medium">{previewSubject}</span>
                        </div>

                        <div className="flex-1 overflow-auto p-4 bg-gray-100">
                            <div className="bg-white min-h-full shadow-sm">
                                <iframe
                                    srcDoc={previewBody}
                                    title="Email Preview"
                                    className="w-full h-[700px] border-0"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Email Modal */}
            {showTestModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Send Test Email</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Enter an email address to send a test version of this template using the preview data.
                                    </p>
                                    <input
                                        type="email"
                                        className="mt-3 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="your@email.com"
                                        value={testEmail}
                                        onChange={e => setTestEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleTestSend}
                                    disabled={sendingTest}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${sendingTest ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {sendingTest ? 'Sending...' : 'Send Test'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTestModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
