import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const theme = await prisma.theme.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          select: {
            id: true,
            occasionType: true,
            date: true,
            status: true,
            totalAmount: true,
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        portfolioItems: {
          select: {
            id: true,
            title: true,
            beforeImage: true,
            afterImages: true,
            eventDate: true,
            location: true,
            isPublic: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            bookings: true,
            portfolioItems: true,
          },
        },
      },
    });

    if (!theme) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Theme not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error('Admin theme fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch theme' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, category, images, videoUrl, basePrice, setupTime, isActive } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (images !== undefined) updateData.images = Array.isArray(images) ? JSON.stringify(images) : images;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (setupTime !== undefined) updateData.setupTime = parseInt(setupTime);
    if (isActive !== undefined) updateData.isActive = isActive;

    const theme = await prisma.theme.update({
      where: { id: params.id },
      data: updateData,
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
    console.error('Admin theme update error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update theme' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Check if theme has any bookings
    const bookingCount = await prisma.booking.count({
      where: { themeId: params.id },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Cannot delete theme with existing bookings' } },
        { status: 409 }
      );
    }

    await prisma.theme.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Theme deleted successfully',
    });
  } catch (error) {
    console.error('Admin theme deletion error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete theme' } },
      { status: 500 }
    );
  }
}