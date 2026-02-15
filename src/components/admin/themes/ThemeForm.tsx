import React, { useState, useEffect } from 'react';

export interface ThemeFormData {
    name: string;
    description: string;
    category: 'BIRTHDAY' | 'ANNIVERSARY' | 'BABY_SHOWER' | 'WEDDING_PROPOSAL';
    images: string[];
    videoUrl?: string;
    basePrice: number;
    setupTime: number;
    isActive: boolean;
    addonIds?: string[];
}

interface ThemeFormProps {
    initialData?: any;
    onSubmit: (data: ThemeFormData) => Promise<void>;
    onCancel: () => void;
}

interface Addon {
    id: string;
    name: string;
    price: number;
    category: string;
}

export default function ThemeForm({ initialData, onSubmit, onCancel }: ThemeFormProps) {
    const [formData, setFormData] = useState<ThemeFormData>({
        name: '',
        description: '',
        category: 'BIRTHDAY',
        images: [],
        videoUrl: '',
        basePrice: 0,
        setupTime: 0,
        isActive: true,
        addonIds: [],
    });
    const [imageUrls, setImageUrls] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);

    useEffect(() => {
        fetchAddons();
    }, []);

    useEffect(() => {
        if (initialData) {
            let images: string[] = [];
            try {
                // handle case where images might be a JSON string from backend or already parsed
                images = typeof initialData.images === 'string'
                    ? JSON.parse(initialData.images)
                    : initialData.images || [];
            } catch (e) {
                images = [];
            }

            // Extract existing addon IDs if available (assuming initialData includes themeAddons)
            const existingAddonIds = initialData.themeAddons?.map((ta: any) => ta.addonId) || [];

            setFormData({
                name: initialData.name,
                description: initialData.description,
                category: initialData.category,
                images: images,
                videoUrl: initialData.videoUrl || '',
                basePrice: initialData.basePrice,
                setupTime: initialData.setupTime,
                isActive: initialData.isActive,
                addonIds: existingAddonIds,
            });
            setImageUrls(images.join(', '));
        }
    }, [initialData]);

    const fetchAddons = async () => {
        try {
            const res = await fetch('/api/admin/addons');
            const data = await res.json();
            if (data.success) {
                setAvailableAddons(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch addons:', e);
        }
    };

    const handleAddonToggle = (addonId: string) => {
        setFormData(prev => {
            const currentIds = prev.addonIds || [];
            if (currentIds.includes(addonId)) {
                return { ...prev, addonIds: currentIds.filter(id => id !== addonId) };
            } else {
                return { ...prev, addonIds: [...currentIds, addonId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const imagesArray = imageUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
            await onSubmit({ ...formData, images: imagesArray });
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
                {initialData ? 'Edit Theme' : 'Create New Theme'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ThemeFormData['category'] })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="BIRTHDAY">Birthday</option>
                            <option value="ANNIVERSARY">Anniversary</option>
                            <option value="BABY_SHOWER">Baby Shower</option>
                            <option value="WEDDING_PROPOSAL">Wedding Proposal</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Image URLs (comma separated)
                        </label>
                        <input
                            type="text"
                            value={imageUrls}
                            onChange={(e) => setImageUrls(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Video URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Base Price</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Setup Time (minutes)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.setupTime}
                            onChange={(e) => setFormData({ ...formData, setupTime: parseInt(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Optional Add-ons</label>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                            {availableAddons.length === 0 ? (
                                <p className="text-gray-500 text-sm">No add-ons available. Create some first.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availableAddons.map(addon => (
                                        <div key={addon.id} className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id={`addon-${addon.id}`}
                                                checked={formData.addonIds?.includes(addon.id)}
                                                onChange={() => handleAddonToggle(addon.id)}
                                                className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`addon-${addon.id}`} className="ml-2 text-sm text-gray-700">
                                                <span className="font-medium">{addon.name}</span>
                                                <span className="block text-gray-500 text-xs">{addon.category} • ₹{addon.price}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Active (Warning: inactive themes will not be visible to customers)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : initialData ? 'Update Theme' : 'Create Theme'}
                    </button>
                </div>
            </form>
        </div>
    );
}
