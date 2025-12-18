'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';

interface PortfolioItem {
    id: string;
    themeId: string;
    title: string;
    description: string;
    beforeImage: string;
    afterImages: string[];
    videoUrl?: string;
    eventDate: string;
    location: string;
    isPublic: boolean;
    createdAt: string;
    theme: {
        name: string;
        category: string;
    };
    testimonial?: {
        id: string;
        rating: number;
        comment: string;
    };
}

interface PortfolioFilters {
    themeId?: string;
    isPublic?: string;
    search?: string;
}

export default function AdminPortfolioPage() {
    const { user, isLoading } = useAuth();
    const isAdmin = useIsAdmin();
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [themes, setThemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<PortfolioFilters>({});

    useEffect(() => {
        if (isAdmin) {
            fetchPortfolioItems();
            fetchThemes();
        }
    }, [isAdmin, filters]);

    const fetchPortfolioItems = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`/api/admin/portfolio?${queryParams}`);
            const data = await response.json();

            if (data.success) {
                setPortfolioItems(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch portfolio items:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchThemes = async () => {
        try {
            const response = await fetch('/api/admin/themes');
            const data = await response.json();

            if (data.success) {
                setThemes(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch themes:', error);
        }
    };

    const updateItemVisibility = async (itemId: string, isPublic: boolean) => {
        try {
            const response = await fetch(`/api/admin/portfolio/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isPublic }),
            });

            const data = await response.json();

            if (data.success) {
                setPortfolioItems(prev =>
                    prev.map(item =>
                        item.id === itemId
                            ? { ...item, isPublic }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error('Failed to update portfolio item:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <Layout className="bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
                            <p className="text-gray-600">Manage portfolio items and showcase work</p>
                        </div>
                        <a
                            href="/admin"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Back to Admin
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Theme
                                </label>
                                <select
                                    value={filters.themeId || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, themeId: e.target.value || undefined }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Themes</option>
                                    {themes.map(theme => (
                                        <option key={theme.id} value={theme.id}>
                                            {theme.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Visibility
                                </label>
                                <select
                                    value={filters.isPublic || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, isPublic: e.target.value || undefined }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Items</option>
                                    <option value="true">Public</option>
                                    <option value="false">Private</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder="Title, description, or location"
                                    value={filters.search || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Portfolio Items ({portfolioItems.length})
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading portfolio items...</p>
                        </div>
                    ) : portfolioItems.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-gray-600">No portfolio items found.</p>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-600">Portfolio management interface will be implemented here.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}