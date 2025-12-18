import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APIResponse, Theme } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== null) {
      where.isActive = isActive !== 'false';
    } else {
      // By default, only return active themes for public API
      where.isActive = true;
    }

    const themes = await prisma.theme.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: themes,
      timestamp: new Date(),
    } as APIResponse<Theme[]>);
  } catch (error) {
    console.error('Themes fetch error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch themes',
      },
      timestamp: new Date(),
    } as APIResponse<null>, { status: 500 });
  }
}