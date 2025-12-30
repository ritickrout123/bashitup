import { NextResponse } from 'next/server';
import { EventCategory } from '@/types';

interface Category {
    label: string;
    value: EventCategory;
    icon?: string;
}

export async function GET() {
    // In a real scenario, these could be fetched from a database table 'EventCategories'
    // For now, we are defining the allowed categories here as the source of truth for the app
    const categories: Category[] = [
        { label: 'Birthdays', value: 'BIRTHDAY', icon: '🎂' },
        { label: 'Baby Showers', value: 'BABY_SHOWER', icon: '👶' },
        { label: 'Anniversary', value: 'ANNIVERSARY', icon: '💕' },
        { label: 'Wedding proposals', value: 'WEDDING_PROPOSAL', icon: '💍' }
    ];

    return NextResponse.json({ success: true, data: categories });
}
