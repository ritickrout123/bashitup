import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const themes = await prisma.theme.findMany({
      where,
      include: {
        _count: {
          select: {
            bookings: true,
            portfolioItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: themes,
    });
  } catch (error) {
    console.error('Admin themes fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: `Failed to fetch themes: ${error instanceof Error ? error.message : String(error)}` } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, category, images, videoUrl, basePrice, setupTime } = body;

    // Validate required fields
    if (!name || !description || !category || !basePrice || !setupTime) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const theme = await prisma.theme.create({
      data: {
        name,
        description,
        category,
        images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify(images || []),
        videoUrl,
        basePrice: parseFloat(basePrice),
        setupTime: parseInt(setupTime),
        isActive: true,
      },
      include: {
        _count: {
          select: {
            bookings: true,
            portfolioItems: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error('Admin theme creation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create theme' } },
      { status: 500 }
    );
  }
}