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
    const themeId = searchParams.get('themeId');
    const isPublic = searchParams.get('isPublic');
    const search = searchParams.get('search');

    const where: any = {};

    if (themeId) {
      where.themeId = themeId;
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      where,
      include: {
        theme: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        testimonial: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: portfolioItems,
    });
  } catch (error) {
    console.error('Admin portfolio fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch portfolio items' } },
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
    const {
      themeId,
      title,
      description,
      beforeImage,
      afterImages,
      videoUrl,
      eventDate,
      location,
      isPublic
    } = body;

    // Validate required fields
    if (!themeId || !title || !description || !beforeImage || !location || !eventDate) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        themeId,
        title,
        description,
        beforeImage,
        afterImages: Array.isArray(afterImages) ? JSON.stringify(afterImages) : JSON.stringify(afterImages || []),
        videoUrl,
        eventDate: new Date(eventDate),
        location,
        isPublic: isPublic || false,
      },
      include: {
        theme: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: portfolioItem,
    });
  } catch (error) {
    console.error('Admin portfolio creation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create portfolio item' } },
      { status: 500 }
    );
  }
}