
'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    updatedAt: string;
    isActive: boolean;
}

export default function EmailTemplatesPage() {
    const { user, isLoading } = useAuth();
    const isAdmin = useIsAdmin();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (user && isAdmin) {
            fetchTemplates();
        }
    }, [user, isAdmin]);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/admin/email-templates');
            const data = await response.json();
            if (data.success) {
                setTemplates(data.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            showErrorToast('Failed to load templates');
        } finally {
            setLoadingData(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const response = await fetch(`/api/admin/email-templates/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTemplates(prev => prev.filter(t => t.id !== id));
                showSuccessToast('Template deleted');
            } else {
                showErrorToast('Failed to delete template');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            showErrorToast('Error deleting template');
        }
    };

    if (isLoading || loadingData) {
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
                            Email Templates
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Create and manage HTML templates for system emails.
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <a
                            href="/admin/email-events"
                            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Configure Events
                        </a>
                        <a
                            href="/admin/email-templates/new"
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Create Template
                        </a>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900 truncate" title={template.name}>
                                        {template.name}
                                    </h3>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {template.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 truncate" title={template.subject}>
                                    Subject: {template.subject}
                                </p>
                                <p className="mt-2 text-xs text-gray-400">
                                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-3">
                                <a href={`/admin/email-templates/${template.id}`} className="text-sm text-blue-600 hover:text-blue-900 font-medium">
                                    Edit
                                </a>
                                <button onClick={() => handleDelete(template.id)} className="text-sm text-red-600 hover:text-red-900 font-medium">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {templates.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-gray-500">No templates found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
