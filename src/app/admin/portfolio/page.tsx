'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import PortfolioForm, { PortfolioFormData } from '@/components/admin/portfolio/PortfolioForm';

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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

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

    const handleCreateItem = async (data: PortfolioFormData) => {
        try {
            const response = await fetch('/api/admin/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setShowCreateForm(false);
                fetchPortfolioItems();
            } else {
                alert(result.error?.message || 'Failed to create item');
            }
        } catch (error) {
            console.error('Failed to create item:', error);
            alert('Failed to create item');
        }
    };

    const handleUpdateItem = async (data: PortfolioFormData) => {
        if (!editingItem) return;
        try {
            const response = await fetch(`/api/admin/portfolio/${editingItem.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setShowEditForm(false);
                setEditingItem(null);
                fetchPortfolioItems();
            } else {
                alert(result.error?.message || 'Failed to update item');
            }
        } catch (error) {
            console.error('Failed to update item:', error);
            alert('Failed to update item');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const response = await fetch(`/api/admin/portfolio/${itemId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                fetchPortfolioItems();
            } else {
                alert(result.error?.message || 'Failed to delete item');
            }
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item');
        }
    }


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
                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    setShowCreateForm(true);
                                    setShowEditForm(false);
                                    setEditingItem(null);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Add Item
                            </button>
                            <a
                                href="/admin"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Back to Admin
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {(showCreateForm || showEditForm) && (
                    <div className="mb-8">
                        <PortfolioForm
                            themes={themes}
                            initialData={editingItem}
                            onSubmit={showEditForm ? handleUpdateItem : handleCreateItem}
                            onCancel={() => {
                                setShowCreateForm(false);
                                setShowEditForm(false);
                                setEditingItem(null);
                            }}
                        />
                    </div>
                )}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {portfolioItems.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                        {item.beforeImage ? (
                                            <img
                                                src={item.beforeImage}
                                                alt={item.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-medium text-gray-900 truncate">
                                                {item.title}
                                            </h4>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.isPublic
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {item.isPublic ? 'Public' : 'Private'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Theme: {item.theme.name}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-3 truncate">
                                            {item.location} • {new Date(item.eventDate).toLocaleDateString()}
                                        </p>

                                        <div className="flex space-x-2 mt-4">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setShowEditForm(true);
                                                    setShowCreateForm(false);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => updateItemVisibility(item.id, !item.isPublic)}
                                                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                                            >
                                                {item.isPublic ? 'Hide' : 'Show'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}