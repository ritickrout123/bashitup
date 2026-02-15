'use client';

import React, { useState } from 'react';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, label = "Upload Image" }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    // Mock upload for now since we don't have a real backend service configured in this environment
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        // Simulating upload delay
        setTimeout(() => {
            // Create a fake local URL or usage object URL for preview
            // In a real app, this would be the response from S3/Cloudinary
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onUpload(objectUrl); // Pass this "url" back
            setUploading(false);
        }, 1500);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-400 text-2xl">📷</span>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                </div>
                {uploading && <span className="text-sm text-pink-600 animate-pulse">Uploading...</span>}
                {preview && !uploading && <span className="text-sm text-green-600 font-medium">Ready</span>}
            </div>
            <p className="text-xs text-gray-500 mt-2">Tap to take a photo or select from gallery.</p>
        </div>
    );
};
