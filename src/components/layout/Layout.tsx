import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  headerTransparent?: boolean;
  showBookingCTA?: boolean;
  footerVariant?: 'full' | 'minimal';
}

export default function Layout({
  children,
  showHeader = true,
  showFooter = true,
  className = '',
  headerTransparent = false,
  showBookingCTA = true,
  footerVariant = 'full'
}: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showHeader && (
        <Header 
          transparent={headerTransparent} 
          showBookingCTA={showBookingCTA} 
        />
      )}
      
      <main className={`flex-grow ${showHeader ? 'pt-16 md:pt-20' : ''}`}>
        {children}
      </main>
      
      {showFooter && <Footer variant={footerVariant} />}
    </div>
  );
}