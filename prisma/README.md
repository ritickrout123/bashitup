# Database Setup Guide

## Prerequisites

1. PostgreSQL database running locally or remotely
2. Database connection string in `.env.local`

## Setup Steps

### 1. Environment Configuration

Update your `.env.local` file with your database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bashitnow_db"
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Push Schema to Database

For development (creates tables without migrations):

```bash
npm run db:push
```

For production (with proper migrations):

```bash
npm run db:migrate
```

### 4. Seed Database

Populate with initial data:

```bash
npm run db:seed
```

## Database Schema Overview

### Core Tables

- **users**: Customer, admin, and decorator accounts
- **themes**: Event decoration themes and packages
- **bookings**: Event booking records with status tracking
- **portfolio_items**: Showcase of completed events
- **testimonials**: Customer reviews and ratings
- **addons**: Additional services and products
- **payments**: Payment transaction records
- **system_config**: Application configuration settings

### Key Relationships

- Users can have multiple bookings (customer role)
- Users can be assigned to bookings (decorator role)
- Themes can have multiple portfolio items
- Bookings can have multiple addons
- Testimonials are linked to bookings and portfolio items

## Useful Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (careful!)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Sample Data

The seed script creates:

- Admin user: `admin@bashitnow.com` (password: `admin123`)
- Decorator user: `decorator@bashitnow.com` (password: `decorator123`)
- 6 sample themes across different categories
- 5 addon services
- 3 portfolio items with testimonials
- System configuration settings

## Production Notes

- Always use migrations in production (`npm run db:migrate`)
- Backup database before schema changes
- Use connection pooling for better performance
- Monitor database performance and optimize queries as needed