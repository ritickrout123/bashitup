import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get aggregate statistics
    const [
      totalClients,
      totalEvents,
      testimonialStats,
      recentBookings,
      systemConfig
    ] = await Promise.all([
      // Total unique customers who have completed bookings
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          bookings: {
            some: {
              status: 'COMPLETED'
            }
          }
        }
      }),

      // Total completed events
      prisma.booking.count({
        where: {
          status: 'COMPLETED'
        }
      }),

      // Testimonial statistics
      prisma.testimonial.aggregate({
        where: {
          isPublic: true
        },
        _avg: {
          rating: true
        },
        _count: {
          id: true
        }
      }),

      // Recent bookings (last 24 hours)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // System configuration for additional stats
      prisma.systemConfig.findMany({
        where: {
          key: {
            in: ['years_in_business', 'cities_served', 'average_setup_time']
          }
        }
      })
    ]);

    // Parse system config
    const configMap = systemConfig.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    // Calculate satisfaction rate (percentage of 4+ star ratings)
    const highRatingCount = await prisma.testimonial.count({
      where: {
        isPublic: true,
        rating: {
          gte: 4
        }
      }
    });

    const satisfactionRate = testimonialStats._count.id > 0 
      ? Math.round((highRatingCount / testimonialStats._count.id) * 100)
      : 0;

    const stats = {
      totalClients,
      totalEvents,
      averageRating: Number(testimonialStats._avg.rating?.toFixed(1)) || 0,
      totalReviews: testimonialStats._count.id,
      yearsInBusiness: parseInt(configMap.years_in_business || '1'),
      citiesServed: parseInt(configMap.cities_served || '1'),
      setupTime: parseInt(configMap.average_setup_time || '60'),
      satisfactionRate,
      recentBookings: {
        count: recentBookings,
        timeframe: '24 hours'
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error fetching social proof stats:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_STATS_ERROR',
        message: 'Failed to fetch social proof statistics'
      },
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Update system configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Key and value are required'
        },
        timestamp: new Date()
      }, { status: 400 });
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    });

    return NextResponse.json({
      success: true,
      data: config,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'UPDATE_CONFIG_ERROR',
        message: 'Failed to update system configuration'
      },
      timestamp: new Date()
    }, { status: 500 });
  }
}