'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { EventCategory, Theme, Location, PriceBreakdown } from '@/types';
import { calculateDetailedPrice, formatPrice, getLocationSurchargeRate, calculateSetupTime } from '@/lib/pricing';

interface PriceCalculatorProps {
  occasionType: EventCategory;
  selectedTheme?: Theme;
  guestCount: number;
  location: Location;
  addons: string[];
  onPriceChange: (price: number) => void;
  className?: string;
}

// Mock addon data (would be fetched from API)
const availableAddons = [
  { id: 'addon-001', name: 'Professional Photography', price: 2500, category: 'Photography' },
  { id: 'addon-002', name: 'Cake Cutting Setup', price: 800, category: 'Food' },
  { id: 'addon-003', name: 'DJ & Sound System', price: 3500, category: 'Entertainment' },
  { id: 'addon-004', name: 'Extra Lighting', price: 1200, category: 'Lighting' },
  { id: 'addon-005', name: 'Flower Arrangements', price: 1800, category: 'Decoration' },
  { id: 'addon-006', name: 'Balloon Arch', price: 1500, category: 'Decoration' },
  { id: 'addon-007', name: 'Photo Booth Props', price: 900, category: 'Entertainment' },
  { id: 'addon-008', name: 'Welcome Banner', price: 600, category: 'Signage' }
];

import { AddonService } from '@/services/addonService';

// ... (keep existing imports)

export function PriceCalculator({
  occasionType,
  selectedTheme,
  guestCount,
  location,
  addons,
  onPriceChange,
  className = ''
}: PriceCalculatorProps) {
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(addons);
  const [isCalculating, setIsCalculating] = useState(false);
  const [dynamicAddons, setDynamicAddons] = useState<any[]>([]);

  // Fetch addons on mount
  useEffect(() => {
    const fetchAddons = async () => {
      const fetchedAddons = await AddonService.getAddons();
      setDynamicAddons(fetchedAddons);
    };
    fetchAddons();
  }, []);

  const calculatePrice = useCallback(async () => {
    if (!selectedTheme) return;

    setIsCalculating(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Determine budget range based on theme base price and guest count
      const estimatedBudget = selectedTheme.basePrice * (guestCount / 25);
      let budgetRange = '5000-10000';

      if (estimatedBudget > 50000) budgetRange = '50000+';
      else if (estimatedBudget > 20000) budgetRange = '20000-50000';
      else if (estimatedBudget > 10000) budgetRange = '10000-20000';

      // Create a map of addon prices from dynamicAddons
      const addonRates: Record<string, number> = {};
      dynamicAddons.forEach(addon => {
        addonRates[addon.id] = addon.price;
      });

      const breakdown = calculateDetailedPrice({
        occasion: occasionType,
        budgetRange,
        guestCount,
        location: location.city,
        addons: selectedAddons,
        addonRates // Pass the dynamic rates
      });

      // Add theme-specific pricing
      const themeAdjustedBreakdown: PriceBreakdown = {
        ...breakdown,
        basePrice: selectedTheme.basePrice * 1.0, // Guest Count Multiplier removed
        addonPrices: selectedAddons.reduce((acc, addonId) => {
          // Use dynamic addon data if available, or fallback to mock
          const addon = dynamicAddons.find(a => a.id === addonId) || availableAddons.find(a => a.id === addonId);
          if (addon) {
            acc[addonId] = addon.price;
          }
          return acc;
        }, {} as { [addonId: string]: number })
      };

      // Recalculate totals
      const addonTotal = Object.values(themeAdjustedBreakdown.addonPrices).reduce((sum, price) => sum + price, 0);
      const locationSurcharge = themeAdjustedBreakdown.basePrice * getLocationSurchargeRate(location.city);
      const subtotal = themeAdjustedBreakdown.basePrice + addonTotal + locationSurcharge;
      const taxes = subtotal * 0.18;
      const finalAmount = subtotal + taxes;

      const finalBreakdown: PriceBreakdown = {
        ...themeAdjustedBreakdown,
        locationSurcharge,
        totalPrice: subtotal,
        taxes,
        finalAmount: Math.round(finalAmount)
      };

      setPriceBreakdown(finalBreakdown);
      onPriceChange(finalBreakdown.finalAmount);

    } catch (error) {
      console.error('Price calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [selectedTheme, occasionType, guestCount, location.city, selectedAddons, onPriceChange, dynamicAddons]);

  // Calculate price when inputs change
  useEffect(() => {
    if (selectedTheme && occasionType) {
      calculatePrice();
    }
  }, [occasionType, selectedTheme, guestCount, location, selectedAddons, calculatePrice]);

  const handleAddonToggle = (addonId: string) => {
    const newAddons = selectedAddons.includes(addonId)
      ? selectedAddons.filter(id => id !== addonId)
      : [...selectedAddons, addonId];

    setSelectedAddons(newAddons);
  };

  const getGuestCountCategory = (count: number) => {
    if (count <= 10) return 'Intimate (1-10 guests)';
    if (count <= 25) return 'Small (11-25 guests)';
    if (count <= 50) return 'Medium (26-50 guests)';
    if (count <= 100) return 'Large (51-100 guests)';
    return 'Extra Large (100+ guests)';
  };

  if (!selectedTheme) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Select a theme to see pricing details</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Price Summary Header */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Price Estimate</h3>
          {isCalculating && (
            <div className="flex items-center text-pink-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
              Calculating...
            </div>
          )}
        </div>

        {priceBreakdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {formatPrice(priceBreakdown.finalAmount)}
            </div>
            <p className="text-sm text-gray-600">
              Total price including taxes
            </p>
          </motion.div>
        )}
      </div>

      {/* Add-ons Selection */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
          <span>Enhance Your Event (Optional)</span>
          {priceBreakdown && (
            <span className={`text-xs px-2 py-1 rounded-full ${calculateSetupTime(selectedTheme.setupTime, selectedAddons) > 180
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-50 text-blue-700'
              }`}>
              ⏱️ Est. Setup: {Math.floor(calculateSetupTime(selectedTheme.setupTime, selectedAddons) / 60)}h {calculateSetupTime(selectedTheme.setupTime, selectedAddons) % 60}m
            </span>
          )}
        </h4>

        {calculateSetupTime(selectedTheme.setupTime, selectedAddons) > 180 && (
          <div className="mb-4 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
            ⚠️ Complex setup. Might require expert confirmation.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {(dynamicAddons.length > 0 ? dynamicAddons : availableAddons).map((addon) => (
            <motion.div
              key={addon.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group ${selectedAddons.includes(addon.id)
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                }`}
              onClick={() => handleAddonToggle(addon.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${selectedAddons.includes(addon.id) ? 'bg-pink-500 border-pink-500' : 'border-gray-300 bg-white'
                      }`}>
                      {selectedAddons.includes(addon.id) && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <h5 className="font-semibold text-gray-800">{addon.name}</h5>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">{addon.category}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-pink-600">
                    {formatPrice(addon.price)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Price Breakdown */}
      {priceBreakdown && (
        <motion.div
          className="bg-white border border-gray-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Price Breakdown
          </h4>

          <div className="space-y-3">
            {/* Base Price */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-700">Base Theme Price</span>
                <div className="text-sm text-gray-500">
                  {selectedTheme.name}
                </div>
              </div>
              <span className="font-semibold">
                {formatPrice(priceBreakdown.basePrice)}
              </span>
            </div>

            {/* Add-ons */}
            {Object.keys(priceBreakdown.addonPrices).length > 0 && (
              <>
                <hr className="border-gray-200" />
                <div className="text-sm font-medium text-gray-700 mb-2">Add-ons:</div>
                {Object.entries(priceBreakdown.addonPrices).map(([addonId, price]) => {
                  const addon = availableAddons.find(a => a.id === addonId);
                  return (
                    <div key={addonId} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 ml-4">• {addon?.name}</span>
                      <span>{formatPrice(price)}</span>
                    </div>
                  );
                })}
              </>
            )}

            {/* Location Surcharge */}
            {priceBreakdown.locationSurcharge > 0 && (
              <>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-700">Location Surcharge</span>
                    <div className="text-sm text-gray-500">
                      {location.city} ({(getLocationSurchargeRate(location.city) * 100).toFixed(0)}%)
                    </div>
                  </div>
                  <span>{formatPrice(priceBreakdown.locationSurcharge)}</span>
                </div>
              </>
            )}

            {/* Subtotal */}
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center font-semibold">
              <span className="text-gray-700">Subtotal</span>
              <span>{formatPrice(priceBreakdown.totalPrice)}</span>
            </div>

            {/* Taxes */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-700">GST (18%)</span>
                <div className="text-sm text-gray-500">Goods & Services Tax</div>
              </div>
              <span>{formatPrice(priceBreakdown.taxes)}</span>
            </div>

            {/* Final Total */}
            <hr className="border-gray-300" />
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-800">Total Amount</span>
              <span className="text-pink-600">
                {formatPrice(priceBreakdown.finalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <div className="text-blue-500 mr-3 mt-0.5">💳</div>
              <div>
                <h5 className="font-semibold text-blue-800 mb-1">Payment Options</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pay ₹1,000 token advance to confirm booking</li>
                  <li>• Remaining amount can be paid after event completion</li>
                  <li>• Multiple payment methods accepted (UPI, Card, Cash)</li>
                  <li>• 100% refund if cancelled 24 hours before event</li>
                </ul>
              </div>
            </div>
          </div> */}

          {/* Savings Info */}
          {selectedAddons.length > 2 && (
            <motion.div
              className="mt-4 p-4 bg-green-50 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center">
                <div className="text-green-500 mr-3">🎉</div>
                <div>
                  <span className="font-semibold text-green-800">Great Choice!</span>
                  <p className="text-sm text-green-700">
                    You&apos;re getting multiple add-ons. Consider our premium packages for better value!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}