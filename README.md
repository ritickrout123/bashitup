# BashItNow - Event Décor Website

We set the BASH, in a FLASH — Event Décor at Your Doorstep in Few Minutes!

## Project Overview

BashItNow is a modern, mobile-first Progressive Web Application (PWA) for event decoration booking services. The platform provides seamless booking experiences with emotional storytelling and conversion-optimized user flows.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **PWA**: next-pwa for Progressive Web App features
- **Animations**: Framer Motion
- **State Management**: TanStack React Query
- **Database**: Prisma ORM (PostgreSQL)
- **Authentication**: JWT with bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Update the environment variables with your actual values.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   ├── booking/        # Booking-related components
│   └── portfolio/      # Portfolio components
├── lib/                # Utility libraries and constants
├── services/           # API services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Features

- 🚀 **Fast Setup**: 60-minute decoration service
- 📱 **Mobile-First**: PWA with offline capabilities
- 🎨 **Custom Themes**: Personalized decoration options
- 💳 **Easy Booking**: Streamlined booking process
- 📊 **Admin Dashboard**: Business management tools
- 💬 **WhatsApp Integration**: Real-time communication
- ⭐ **Social Proof**: Reviews and testimonials

## Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement responsive design
- Write meaningful commit messages
- Test components before pushing

## License

Private - BashItNow Team