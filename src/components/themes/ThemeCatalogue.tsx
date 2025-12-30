'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, EventCategory } from '@/types';

interface ThemeFilters {
  category: EventCategory | 'ALL';
  priceRange: 'ALL' | 'LOW' | 'MID' | 'HIGH';
  mood: 'ALL' | 'ELEGANT' | 'FUN' | 'ROMANTIC' | 'PROFESSIONAL';
}

interface ThemeCatalogueProps {
  initialThemes?: Theme[]; // Optional initial data
  onThemeSelect?: (theme: Theme) => void;
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
}



const categoryLabels: Record<EventCategory | 'ALL', string> = {
  ALL: 'All Occasions',
  BIRTHDAY: 'Birthdays',
  ANNIVERSARY: 'Anniversary',
  BABY_SHOWER: 'Baby Showers',
  WEDDING_PROPOSAL: 'Wedding Proposals'
};

export function ThemeCatalogue({
  initialThemes = [],
  onThemeSelect,
  showFilters = true,
  title = "Choose Your Perfect Theme",
  subtitle = "Browse our curated collection of professionally designed themes"
}: ThemeCatalogueProps) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ThemeFilters>({
    category: 'ALL',
    priceRange: 'ALL',
    mood: 'ALL'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch themes from API
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/themes');
        const data = await response.json();
        if (data.success) {
          setThemes(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch themes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Filter themes based on current filters
  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      // Category filter
      if (filters.category !== 'ALL' && theme.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (filters.priceRange !== 'ALL') {
        const price = theme.basePrice;
        switch (filters.priceRange) {
          case 'LOW':
            if (price > 8000) return false;
            break;
          case 'MID':
            if (price <= 8000 || price > 12000) return false;
            break;
          case 'HIGH':
            if (price <= 12000) return false;
            break;
        }
      }

      return true;
    });
  }, [themes, filters]);

  const handleFilterChange = (key: keyof ThemeFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeSelect = (theme: Theme) => {
    if (onThemeSelect) {
      onThemeSelect(theme);
    } else {
      // Default behavior - redirect to booking with theme
      window.location.href = `/booking?theme=${theme.id}`;
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
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {/* Filters */}
            {showFilters && (
              <motion.div
                className="mb-8 bg-white rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-wrap gap-6 items-center justify-between">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">Category:</span>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleFilterChange('category', key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filters.category === key
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Price Range Filter */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">Price:</span>
                    {[
                      { key: 'ALL', label: 'All Prices' },
                      { key: 'LOW', label: 'Under ₹8K' },
                      { key: 'MID', label: '₹8K - ₹12K' },
                      { key: 'HIGH', label: 'Above ₹12K' }
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => handleFilterChange('priceRange', key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filters.priceRange === key
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredThemes.length} of {themes.length} themes
                </div>
              </motion.div>
            )}

            {/* Themes Grid/List */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${JSON.stringify(filters)}`}
                className={viewMode === 'grid'
                  ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-6'
                }
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredThemes.map((theme) => (
                  <motion.div
                    key={theme.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <ThemeCard
                      theme={theme}
                      onSelect={() => handleThemeSelect(theme)}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Empty state */}
            {filteredThemes.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No themes found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more themes
                </p>
                <button
                  onClick={() => setFilters({ category: 'ALL', priceRange: 'ALL', mood: 'ALL' })}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// Theme Card Component
interface ThemeCardProps {
  theme: Theme;
  onSelect: () => void;
  viewMode: 'grid' | 'list';
}

function ThemeCard({ theme, onSelect, viewMode }: ThemeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (viewMode === 'list') {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        whileHover={{ y: -2 }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-1/3 h-48 md:h-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 animate-pulse" />
            <img
              src={(() => {
                try {
                  return theme.images[0] || '/images/placeholder-theme.jpg';
                } catch {
                  return '/images/placeholder-theme.jpg';
                }
              })()}
              alt={theme.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
              {categoryLabels[theme.category]}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{theme.name}</h3>
                <p className="text-gray-600">{theme.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">
                  ₹{theme.basePrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {theme.setupTime} min setup
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                  View More
                </button>
              </div>
              <button
                onClick={onSelect}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 animate-pulse" />
        <img
          src={(() => {
            try {
              const images = JSON.parse(theme.images);
              return images[0] || '/images/placeholder-theme.jpg';
            } catch {
              return '/images/placeholder-theme.jpg';
            }
          })()}
          alt={theme.name}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
          {categoryLabels[theme.category]}
        </div>

        {/* Quick actions */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-300">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">
            {theme.name}
          </h3>
          <div className="text-right">
            <div className="text-xl font-bold text-pink-600">
              ₹{theme.basePrice.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {theme.setupTime} min
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {theme.description}
        </p>

        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm font-medium">
            View More
          </button>
          <button
            onClick={onSelect}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 text-sm"
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}