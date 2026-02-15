'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, EventCategory } from '@/types';

interface ThemeFilters {
  category: EventCategory | 'ALL';
  priceRange: 'ALL' | 'LOW' | 'MID' | 'HIGH';
  city: 'ALL' | 'Chandigarh' | 'Mohali' | 'Panchkula';
}

interface ThemeCatalogueProps {
  initialThemes?: Theme[];
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
  WEDDING_PROPOSAL: 'Wedding Proposals',
  CORPORATE: 'Corporate', // Added missing enum mapping if exists, or just use partial
  OTHER: 'Other'
};

const cityOptions = ['Chandigarh', 'Mohali', 'Panchkula'];

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
    city: 'ALL'
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

      // City filter
      if (filters.city !== 'ALL') {
        // If theme has specific cities defined, check if it includes the selected city.
        // If theme.cities is empty or undefined, it's available everywhere.
        if (theme.cities && theme.cities.length > 0 && !theme.cities.includes(filters.city)) {
          return false;
        }
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
                className="mb-8 bg-white rounded-2xl p-6 shadow-lg sticky top-20 z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  {/* Filter Groups */}
                  <div className="flex flex-wrap gap-6 items-center flex-1">

                    {/* Occasion */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Occasion</span>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                      >
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFilterChange('city', 'ALL')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.city === 'ALL' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          All
                        </button>
                        {cityOptions.map(city => (
                          <button
                            key={city}
                            onClick={() => handleFilterChange('city', city)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.city === city ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</span>
                      <div className="flex gap-2">
                        {[
                          { key: 'ALL', label: 'All' },
                          { key: 'LOW', label: '< ₹8k' },
                          { key: 'MID', label: '₹8k-12k' },
                          { key: 'HIGH', label: '> ₹12k' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => handleFilterChange('priceRange', key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.priceRange === key ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      aria-label="Grid View"
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
                      aria-label="List View"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Results count */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
                  <span>Showing <strong>{filteredThemes.length}</strong> of {themes.length} themes</span>
                  {(filters.category !== 'ALL' || filters.city !== 'ALL' || filters.priceRange !== 'ALL') && (
                    <button
                      onClick={() => setFilters({ category: 'ALL', priceRange: 'ALL', city: 'ALL' })}
                      className="text-pink-600 hover:text-pink-700 font-medium text-xs"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Themes Grid/List */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${JSON.stringify(filters)}`}
                className={viewMode === 'grid'
                  ? 'grid gap-8 md:grid-cols-2 lg:grid-cols-3'
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
                className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No themes found matching your criteria
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Try adjusting filters or view all themes to find inspiration.
                </p>
                <button
                  onClick={() => setFilters({ category: 'ALL', priceRange: 'ALL', city: 'ALL' })}
                  className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  View All Themes
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
  const hasPackages = theme.packages && theme.packages.length > 0;
  // Determine if premium: Has packages or price > 12000
  const isPremium = hasPackages || theme.basePrice > 12000;

  if (viewMode === 'list') {
    return (
      <motion.div
        className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border ${isPremium ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'}`}
        whileHover={{ y: -2 }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-1/3 h-56 md:h-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
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
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900 shadow-sm">
              {categoryLabels[theme.category]}
            </div>
            {isPremium && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-200 to-yellow-400 px-3 py-1 rounded-full text-xs font-bold text-yellow-900 shadow-md">
                PREMIUM
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{theme.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {hasPackages && <span className="text-sm text-gray-500 font-normal mr-1">Starts at</span>}
                    ₹{theme.basePrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {theme.setupTime} min setup • {theme.cities?.length ? `${theme.cities.length} Cities` : 'All Cities'}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{theme.description}</p>

              {hasPackages && (
                <div className="mb-6 flex gap-2">
                  {theme.packages?.slice(0, 3).map(pkg => (
                    <span key={pkg.id} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                      {pkg.name}
                    </span>
                  ))}
                  {(theme.packages?.length || 0) > 3 && <span className="px-2 py-1 text-xs text-gray-400">+{theme.packages!.length - 3} more</span>}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-auto">
              <a
                href={`/themes/${theme.id}`}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                View Details
              </a>
              <button
                onClick={onSelect}
                className="px-8 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-300"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      className={`bg-white rounded-3xl transition-all duration-300 overflow-hidden group h-full flex flex-col relative ${isPremium
          ? 'shadow-xl hover:shadow-2xl ring-1 ring-purple-100'
          : 'shadow-md hover:shadow-xl border border-gray-100'
        }`}
      whileHover={{ y: -8 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        <img
          src={(() => {
            try {
              return theme.images[0] || '/images/placeholder-theme.jpg';
            } catch {
              return '/images/placeholder-theme.jpg';
            }
          })()}
          alt={theme.name}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900 shadow-sm">
            {categoryLabels[theme.category]}
          </span>
        </div>

        {isPremium && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <span>✨</span> PREMIUM
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-300 line-clamp-1">
              {theme.name}
            </h3>
          </div>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {theme.description}
          </p>

          {hasPackages ? (
            <div className="space-y-2 mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase">Available Packages</div>
              <div className="flex flex-wrap gap-1.5">
                {theme.packages?.slice(0, 3).map(pkg => (
                  <span key={pkg.id} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-md">
                    {pkg.name}
                  </span>
                ))}
                {(theme.packages?.length || 0) > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-md">+{theme.packages!.length - 3}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 h-12">
              {/* Spacer for non-package themes to align cards roughly if needed, or just let them shrink */}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Starting from</p>
            <p className="text-xl font-bold text-gray-900">₹{theme.basePrice.toLocaleString()}</p>
          </div>

          <button
            onClick={onSelect}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md ${isPremium
                ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-black hover:to-gray-900'
                : 'bg-white border text-gray-900 hover:bg-gray-50'
              }`}
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}