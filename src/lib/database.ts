import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';
import type { 
  User, 
  Theme, 
  PortfolioItem, 
  Testimonial,
  EventCategory,
  BookingStatus
} from '../types';

// User operations
export const userOperations = {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.user.create({
      data: userData,
    });
  },

  async updateById(id: string, data: Partial<User>) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },
};

// Theme operations
export const themeOperations = {
  async findAll(category?: EventCategory) {
    return await prisma.theme.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return await prisma.theme.findUnique({
      where: { id },
      include: {
        portfolioItems: {
          where: { isPublic: true },
          take: 3,
        },
        themeAddons: {
          include: {
            addon: true,
          },
        },
      },
    });
  },

  async create(themeData: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.theme.create({
      data: themeData,
    });
  },

  async updateById(id: string, data: Partial<Theme>) {
    return await prisma.theme.update({
      where: { id },
      data,
    });
  },
};

// Booking operations
export const bookingOperations = {
  async findAll(filters?: {
    customerId?: string;
    status?: BookingStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    return await prisma.booking.findMany({
      where: {
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.dateFrom && { date: { gte: filters.dateFrom } }),
        ...(filters?.dateTo && { date: { lte: filters.dateTo } }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        theme: true,
        decorator: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        addons: {
          include: {
            addon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        theme: true,
        decorator: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        addons: {
          include: {
            addon: true,
          },
        },
        payments: true,
        testimonial: true,
      },
    });
  },

  async create(bookingData: Prisma.BookingCreateInput) {
    return await prisma.booking.create({
      data: bookingData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        theme: true,
      },
    });
  },

  async updateStatus(id: string, status: BookingStatus) {
    return await prisma.booking.update({
      where: { id },
      data: { status },
    });
  },

  async checkAvailability(date: Date, startTime: string, endTime: string) {
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        date,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    return conflictingBookings.length === 0;
  },
};

// Portfolio operations
export const portfolioOperations = {
  async findAll(category?: EventCategory) {
    return await prisma.portfolioItem.findMany({
      where: {
        isPublic: true,
        ...(category && {
          theme: {
            category,
          },
        }),
      },
      include: {
        theme: true,
        testimonial: true,
      },
      orderBy: { eventDate: 'desc' },
    });
  },

  async findById(id: string) {
    return await prisma.portfolioItem.findUnique({
      where: { id },
      include: {
        theme: true,
        testimonial: true,
      },
    });
  },

  async create(portfolioData: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.portfolioItem.create({
      data: portfolioData,
    });
  },
};

// Testimonial operations
export const testimonialOperations = {
  async findAll(limit?: number) {
    return await prisma.testimonial.findMany({
      where: { isPublic: true },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        booking: {
          include: {
            theme: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: limit }),
    });
  },

  async create(testimonialData: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.testimonial.create({
      data: testimonialData,
    });
  },

  async getAverageRating() {
    const result = await prisma.testimonial.aggregate({
      where: { isPublic: true },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.rating,
    };
  },
};

// Addon operations
export const addonOperations = {
  async findAll(category?: string) {
    return await prisma.addon.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return await prisma.addon.findUnique({
      where: { id },
    });
  },
};

// System configuration operations
export const systemConfigOperations = {
  async getValue(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });
    return config?.value || null;
  },

  async setValue(key: string, value: string) {
    return await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },

  async getMultiple(keys: string[]) {
    const configs = await prisma.systemConfig.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    return configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);
  },
};

// Analytics and statistics
export const analyticsOperations = {
  async getBookingStats() {
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({
      where: { status: 'COMPLETED' },
    });
    const totalRevenue = await prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: {
        totalAmount: true,
      },
    });

    return {
      totalBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  },

  async getPopularThemes(limit = 5) {
    const themes = await prisma.theme.findMany({
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return themes;
  },
};