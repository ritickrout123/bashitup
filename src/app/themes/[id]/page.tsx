import { prisma } from '@/lib/prisma';
import { Layout } from '@/components/layout';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { EventCategory } from '@/types';

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
};

// Helper for category label
const getCategoryLabel = (category: EventCategory) => {
    const labels: Record<EventCategory, string> = {
        BIRTHDAY: 'Birthday',
        ANNIVERSARY: 'Anniversary',
        BABY_SHOWER: 'Baby Shower',
        WEDDING_PROPOSAL: 'Wedding Proposal'
    };
    return labels[category] || category;
};

export default async function ThemeDetailsPage({ params }: { params: { id: string } }) {
    const theme = await prisma.theme.findUnique({
        where: { id: params.id },
    });

    if (!theme) {
        notFound();
    }

    // Parse images. Assuming it's a JSON string of string[]. 
    // If it's single string URL in some legacy data, handle that too just in case, but schema says String.
    let images: string[] = [];
    try {
        const parsed = JSON.parse(theme.images);
        if (Array.isArray(parsed)) {
            images = parsed;
        } else {
            images = [theme.images];
        }
    } catch (e) {
        // If not JSON, treat as single URL string
        images = [theme.images];
    }

    const mainImage = images[0] || '/images/placeholder-theme.jpg';

    return (
        <Layout headerTransparent={false} showHeader={true} className="bg-gradient-to-br from-pink-50 to-purple-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
                {/* Breadcrumb / Back Link */}
                <div className="mb-8">
                    <Link
                        href="/themes"
                        className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Themes
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left: Image Section */}
                        <div className="lg:w-1/2 p-6 lg:p-8">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-lg group">
                                <img
                                    src={mainImage}
                                    alt={theme.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-gray-800 shadow-sm border border-gray-100">
                                        {getCategoryLabel(theme.category as EventCategory)}
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnails (if more than 1 image) */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-pink-500 transition-all">
                                            <img src={img} alt={`${theme.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Details Section */}
                        <div className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center bg-white">
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {theme.name}
                            </h1>

                            <div className="flex items-center space-x-6 mb-8 text-gray-600">
                                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg">
                                    <span className="text-2xl mr-2">⏱️</span>
                                    <span className="font-medium">{theme.setupTime} min setup</span>
                                </div>
                            </div>

                            <div className="prose text-gray-600 mb-10 max-w-none">
                                <p>{theme.description}</p>
                            </div>

                            <div className="border-t border-b border-gray-100 py-8 mb-8 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Total Price</p>
                                    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                                        {formatPrice(theme.basePrice)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/booking?theme=${theme.id}`}
                                    className="flex-1 text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                >
                                    Book This Theme
                                </Link>
                            </div>

                            <p className="mt-6 text-center text-sm text-gray-400">
                                * Additional charges may apply for add-ons and customization.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
