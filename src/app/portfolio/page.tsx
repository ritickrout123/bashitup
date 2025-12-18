import { Layout } from '@/components/layout';
import { PortfolioGallery } from '@/components/portfolio';

export default function PortfolioPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="pt-20">
          <PortfolioGallery
            title="Our Amazing Transformations"
            subtitle="See how we've brought joy and magic to celebrations across the country"
          />
        </div>
      </div>
    </Layout>
  );
}