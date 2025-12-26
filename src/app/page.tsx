import { Layout } from '@/components/layout';
import { ModernHeroSection, TrustSignals, USPSection, HowItWorks } from '@/components/homepage';
import { QuickBookingWidget } from '@/components/booking';

export default function Home() {
  return (
    <Layout headerTransparent={false} showHeader={false} className="bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Modern Hero Section with Integrated Header */}
      <ModernHeroSection
        tagline="We set the BASH, in a FLASH"
        backgroundImage="/images/hero-bg.jpg"
        ctaText="Book Your Event Now"
      />

      {/* Quick Booking Widget */}
      <QuickBookingWidget className="-mt-10" />

      {/* USP Section */}
      <USPSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Trust Signals */}
      <TrustSignals
        clientCount={500}
        eventsCompleted={1000}
        averageRating={4.9}
      />

    </Layout>
  );
}
