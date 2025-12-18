import { Layout } from '@/components/layout';
import { ThemeCatalogue } from '@/components/themes';

export default function ThemesPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="pt-20">
          <ThemeCatalogue
            title="Explore Our Themes"
            subtitle="Discover the perfect theme for your celebration from our curated collection"
            showFilters={true}
          />
        </div>
      </div>
    </Layout>
  );
}