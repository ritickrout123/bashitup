'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem, EventCategory } from '@/types';

interface PortfolioGalleryProps {
  categories?: EventCategory[];
  items?: PortfolioItem[];
  onThemeSelect?: (themeId: string) => void;
  title?: string;
  subtitle?: string;
}

// Mock portfolio data
const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    themeId: 'theme-1',
    title: 'Magical Birthday Celebration',
    description: 'Enchanted garden theme for 8-year-old birthday party',
    beforeImage: '/images/portfolio/before-1.jpg',
    afterImages: ['/images/portfolio/after-1-1.jpg', '/images/portfolio/after-1-2.jpg'],
    videoUrl: '/videos/portfolio-1.mp4',
    eventDate: new Date('2024-01-15'),
    location: 'Mumbai, Maharashtra',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    themeId: 'theme-2',
    title: 'Golden Anniversary Celebration',
    description: 'Elegant 25th anniversary setup with gold accents',
    beforeImage: '/images/portfolio/before-2.jpg',
    afterImages: ['/images/portfolio/after-2-1.jpg', '/images/portfolio/after-2-2.jpg'],
    eventDate: new Date('2024-02-10'),
    location: 'Delhi, India',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    themeId: 'theme-3',
    title: 'Safari Baby Shower',
    description: 'Adorable safari theme for baby shower celebration',
    beforeImage: '/images/portfolio/before-3.jpg',
    afterImages: ['/images/portfolio/after-3-1.jpg'],
    eventDate: new Date('2024-03-05'),
    location: 'Bangalore, Karnataka',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    themeId: 'theme-4',
    title: 'Corporate Excellence Awards',
    description: 'Professional corporate event setup',
    beforeImage: '/images/portfolio/before-4.jpg',
    afterImages: ['/images/portfolio/after-4-1.jpg', '/images/portfolio/after-4-2.jpg'],
    eventDate: new Date('2024-03-20'),
    location: 'Pune, Maharashtra',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const categoryLabels: Record<EventCategory, string> = {
  BIRTHDAY: 'Birthdays',
  ANNIVERSARY: 'Anniversaries',
  BABY_SHOWER: 'Baby Showers',
  CORPORATE: 'Corporate Events',
  OTHER: 'Other Events'
};

export function PortfolioGallery({
  categories = ['BIRTHDAY', 'ANNIVERSARY', 'BABY_SHOWER', 'CORPORATE'],
  items = mockPortfolioItems,
  onThemeSelect,
  title = "Our Portfolio",
  subtitle = "See how we transform spaces into magical celebrations"
}: PortfolioGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'ALL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Filter items by category
  const filteredItems = activeCategory === 'ALL' 
    ? items 
    : items.filter(item => {
        // For now, we'll categorize based on title keywords
        const title = item.title.toLowerCase();
        switch (activeCategory) {
          case 'BIRTHDAY':
            return title.includes('birthday');
          case 'ANNIVERSARY':
            return title.includes('anniversary');
          case 'BABY_SHOWER':
            return title.includes('baby') || title.includes('shower');
          case 'CORPORATE':
            return title.includes('corporate') || title.includes('office');
          default:
            return true;
        }
      });

  const handleThemeSelect = (themeId: string) => {
    if (onThemeSelect) {
      onThemeSelect(themeId);
    } else {
      window.location.href = `/booking?theme=${themeId}`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeCategory === 'ALL'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </motion.div>

        {/* Portfolio Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="group"
              >
                <PortfolioCard
                  item={item}
                  onSelect={() => setSelectedItem(item)}
                  onThemeSelect={() => handleThemeSelect(item.themeId)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No portfolio items found
            </h3>
            <p className="text-gray-600">
              Check back soon for more amazing transformations!
            </p>
          </motion.div>
        )}
      </div>

      {/* Portfolio Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <PortfolioModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onThemeSelect={() => handleThemeSelect(selectedItem.themeId)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// Portfolio Card Component
interface PortfolioCardProps {
  item: PortfolioItem;
  onSelect: () => void;
  onThemeSelect: () => void;
}

function PortfolioCard({ item, onSelect, onThemeSelect }: PortfolioCardProps) {

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
      whileHover={{ y: -5 }}
      onClick={onSelect}
    >
      {/* Before/After Images */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <BeforeAfterSlider
          beforeImage={item.beforeImage}
          afterImage={item.afterImages[0]}
          alt={item.title}
        />
        
        {/* Play button for video */}
        {item.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
            <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">
            {item.title}
          </h3>
          <div className="text-xs text-gray-500">
            {item.eventDate.toLocaleDateString()}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onThemeSelect();
          }}
          className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 text-sm"
        >
          Book This Theme
        </button>
      </div>
    </motion.div>
  );
}

// Before/After Slider Component
interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  alt: string;
}

function BeforeAfterSlider({ beforeImage, afterImage, alt }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-col-resize"
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* After image (background) */}
      <img
        src={afterImage || '/images/placeholder-after.jpg'}
        alt={`${alt} - After`}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Before image (overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage || '/images/placeholder-before.jpg'}
          alt={`${alt} - Before`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-semibold">
        BEFORE
      </div>
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-semibold">
        AFTER
      </div>
    </div>
  );
}

// Portfolio Modal Component
interface PortfolioModalProps {
  item: PortfolioItem;
  onClose: () => void;
  onThemeSelect: () => void;
}

function PortfolioModal({ item, onClose, onThemeSelect }: PortfolioModalProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{item.title}</h2>
            <p className="text-gray-600">{item.location} • {item.eventDate.toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Before/After Slider */}
          <div className="aspect-video mb-6 rounded-xl overflow-hidden">
            <BeforeAfterSlider
              beforeImage={item.beforeImage}
              afterImage={item.afterImages[0]}
              alt={item.title}
            />
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">{item.description}</p>

          {/* Additional Images */}
          {item.afterImages.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {item.afterImages.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${item.title} - View ${index + 2}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-4">
            <button
              onClick={onThemeSelect}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Book This Theme
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}