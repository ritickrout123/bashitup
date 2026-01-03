import React, { useState, useEffect } from 'react';

export interface PortfolioFormData {
    themeId: string;
    title: string;
    description: string;
    beforeImage: string;
    afterImages: string[];
    videoUrl?: string;
    eventDate: string;
    location: string;
    isPublic: boolean;
}

interface PortfolioFormProps {
    initialData?: any;
    themes: { id: string; name: string }[];
    onSubmit: (data: PortfolioFormData) => Promise<void>;
    onCancel: () => void;
}

export default function PortfolioForm({ initialData, themes, onSubmit, onCancel }: PortfolioFormProps) {
    const [formData, setFormData] = useState<PortfolioFormData>({
        themeId: '',
        title: '',
        description: '',
        beforeImage: '',
        afterImages: [],
        videoUrl: '',
        eventDate: new Date().toISOString().split('T')[0],
        location: '',
        isPublic: true,
    });
    const [afterImageUrls, setAfterImageUrls] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            let afterImgs: string[] = [];
            try {
                afterImgs = typeof initialData.afterImages === 'string'
                    ? JSON.parse(initialData.afterImages)
                    : initialData.afterImages || [];
            } catch (e) {
                afterImgs = [];
            }

            setFormData({
                themeId: initialData.themeId,
                title: initialData.title,
                description: initialData.description,
                beforeImage: initialData.beforeImage,
                afterImages: afterImgs,
                videoUrl: initialData.videoUrl || '',
                eventDate: initialData.eventDate ? new Date(initialData.eventDate).toISOString().split('T')[0] : '',
                location: initialData.location,
                isPublic: initialData.isPublic,
            });
            setAfterImageUrls(afterImgs.join(', '));
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const imagesArray = afterImageUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
            await onSubmit({ ...formData, afterImages: imagesArray });
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
                {initialData ? 'Edit Portfolio Item' : 'Create New Portfolio Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Theme</label>
                        <select
                            required
                            value={formData.themeId}
                            onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Select a Theme</option>
                            {themes.map(theme => (
                                <option key={theme.id} value={theme.id}>{theme.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
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

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Before Image URL</label>
                        <input
                            type="text"
                            required
                            value={formData.beforeImage}
                            onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Event Date</label>
                        <input
                            type="date"
                            required
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            After Images URLs (comma separated)
                        </label>
                        <input
                            type="text"
                            value={afterImageUrls}
                            onChange={(e) => setAfterImageUrls(e.target.value)}
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

                    <div className="col-span-2">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                                Public (Visible in gallery)
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
                        {loading ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
                    </button>
                </div>
            </form>
        </div>
    );
}
