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

    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: params.id },
      include: {
        theme: {
          select: {
            id: true,
            name: true,
            category: true,
            basePrice: true,
          },
        },
        testimonial: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: portfolioItem,
    });
  } catch (error) {
    console.error('Admin portfolio item fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch portfolio item' } },
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
    const { title, description, beforeImage, afterImages, videoUrl, eventDate, location, isPublic } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (beforeImage !== undefined) updateData.beforeImage = beforeImage;
    if (afterImages !== undefined) updateData.afterImages = Array.isArray(afterImages) ? JSON.stringify(afterImages) : afterImages;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (eventDate !== undefined) updateData.eventDate = new Date(eventDate);
    if (location !== undefined) updateData.location = location;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const portfolioItem = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: updateData,
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
    });

    return NextResponse.json({
      success: true,
      data: portfolioItem,
    });
  } catch (error) {
    console.error('Admin portfolio item update error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update portfolio item' } },
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

    await prisma.portfolioItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    console.error('Admin portfolio item deletion error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete portfolio item' } },
      { status: 500 }
    );
  }
}