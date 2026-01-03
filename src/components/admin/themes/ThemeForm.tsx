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
}

interface ThemeFormProps {
    initialData?: any;
    onSubmit: (data: ThemeFormData) => Promise<void>;
    onCancel: () => void;
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
    });
    const [imageUrls, setImageUrls] = useState('');
    const [loading, setLoading] = useState(false);

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

            setFormData({
                name: initialData.name,
                description: initialData.description,
                category: initialData.category,
                images: images,
                videoUrl: initialData.videoUrl || '',
                basePrice: initialData.basePrice,
                setupTime: initialData.setupTime,
                isActive: initialData.isActive,
            });
            setImageUrls(images.join(', '));
        }
    }, [initialData]);

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
