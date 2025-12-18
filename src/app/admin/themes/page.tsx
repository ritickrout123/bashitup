'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';

interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'BIRTHDAY' | 'ANNIVERSARY' | 'BABY_SHOWER' | 'CORPORATE' | 'OTHER';
  images: string[];
  videoUrl?: string;
  basePrice: number;
  setupTime: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    bookings: number;
    portfolioItems: number;
  };
}

interface ThemeFilters {
  category?: string;
  isActive?: string;
  search?: string;
}

export default function AdminThemesPage() {
  const { user, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ThemeFilters>({});
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchThemes();
    }
  }, [isAdmin, filters]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/admin/themes?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setThemes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateThemeStatus = async (themeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/themes/${themeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();
      
      if (data.success) {
        setThemes(prev => 
          prev.map(theme => 
            theme.id === themeId 
              ? { ...theme, isActive }
              : theme
          )
        );
      }
    } catch (error) {
      console.error('Failed to update theme status:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BIRTHDAY': return 'bg-pink-100 text-pink-800';
      case 'ANNIVERSARY': return 'bg-red-100 text-red-800';
      case 'BABY_SHOWER': return 'bg-blue-100 text-blue-800';
      case 'CORPORATE': return 'bg-gray-100 text-gray-800';
      case 'OTHER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Theme Management</h1>
              <p className="text-gray-600">Manage decoration themes and packages</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Theme
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
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="BIRTHDAY">Birthday</option>
                  <option value="ANNIVERSARY">Anniversary</option>
                  <option value="BABY_SHOWER">Baby Shower</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.isActive || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Theme name or description"
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div> 
       {/* Themes Grid */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Themes ({themes.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading themes...</p>
            </div>
          ) : themes.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No themes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {themes.map((theme) => (
                <div key={theme.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Theme Image */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {(() => {
                      try {
                        const images = JSON.parse(theme.images);
                        return images.length > 0 ? (
                          <img
                            src={images[0]}
                            alt={theme.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        );
                      } catch {
                        return (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                  
                  {/* Theme Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {theme.name}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        theme.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {theme.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {theme.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(theme.category)}`}>
                        {theme.category.replace('_', ' ')}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{theme.basePrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {theme.setupTime} min setup
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{theme._count.bookings} bookings</span>
                      <span>{theme._count.portfolioItems} portfolio items</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedTheme(theme)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => updateThemeStatus(theme.id, !theme.isActive)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          theme.isActive 
                            ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {theme.isActive ? 'Deactivate' : 'Activate'}
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