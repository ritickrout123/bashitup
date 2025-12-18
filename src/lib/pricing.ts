import { EventCategory, PriceBreakdown } from '@/types';

interface PriceCalculationParams {
  occasion: EventCategory;
  budgetRange: string;
  guestCount?: number;
  location?: string;
  addons?: string[];
}

interface BudgetRangeConfig {
  label: string;
  value: string;
  min: number;
  max: number;
}

export const budgetRanges: BudgetRangeConfig[] = [
  { label: '₹5,000 - ₹10,000', value: '5000-10000', min: 5000, max: 10000 },
  { label: '₹10,000 - ₹20,000', value: '10000-20000', min: 10000, max: 20000 },
  { label: '₹20,000 - ₹50,000', value: '20000-50000', min: 20000, max: 50000 },
  { label: '₹50,000+', value: '50000+', min: 50000, max: 100000 }
];

// Base pricing multipliers by occasion type
const occasionMultipliers: Record<EventCategory, number> = {
  BIRTHDAY: 1.0,
  ANNIVERSARY: 1.2,
  BABY_SHOWER: 1.1,
  CORPORATE: 1.5,
  OTHER: 1.0
};

// Location-based surcharge (percentage)
const locationSurcharges: Record<string, number> = {
  'Mumbai': 0.15,
  'Delhi': 0.12,
  'Bangalore': 0.10,
  'Chennai': 0.08,
  'Kolkata': 0.05,
  'Hyderabad': 0.08,
  'Pune': 0.10,
  'Ahmedabad': 0.05,
  'Jaipur': 0.03,
  'Surat': 0.02
};

// Guest count multipliers
const getGuestCountMultiplier = (guestCount: number): number => {
  if (guestCount <= 10) return 0.8;
  if (guestCount <= 25) return 1.0;
  if (guestCount <= 50) return 1.3;
  if (guestCount <= 100) return 1.6;
  return 2.0;
};

export function calculateEstimatedPrice(params: PriceCalculationParams): number {
  const { occasion, budgetRange, guestCount = 25, location = '' } = params;

  // Get base price from budget range
  const budget = budgetRanges.find(b => b.value === budgetRange);
  if (!budget) return 0;

  let basePrice = budget.min;

  // Apply occasion multiplier
  const occasionMultiplier = occasionMultipliers[occasion] || 1.0;
  basePrice *= occasionMultiplier;

  // Apply guest count multiplier
  const guestMultiplier = getGuestCountMultiplier(guestCount);
  basePrice *= guestMultiplier;

  // Apply location surcharge
  const locationSurcharge = locationSurcharges[location] || 0;
  basePrice *= (1 + locationSurcharge);

  return Math.round(basePrice);
}

export function calculateDetailedPrice(params: PriceCalculationParams): PriceBreakdown {
  const { occasion, budgetRange, guestCount = 25, location = '', addons = [] } = params;

  // Get base price from budget range
  const budget = budgetRanges.find(b => b.value === budgetRange);
  if (!budget) {
    return {
      basePrice: 0,
      addonPrices: {},
      locationSurcharge: 0,
      guestCountMultiplier: 0,
      totalPrice: 0,
      taxes: 0,
      finalAmount: 0
    };
  }

  const basePrice = budget.min;
  
  // Calculate multipliers
  const occasionMultiplier = occasionMultipliers[occasion] || 1.0;
  const guestMultiplier = getGuestCountMultiplier(guestCount);
  const locationSurchargeRate = locationSurcharges[location] || 0;

  // Calculate adjusted base price
  const adjustedBasePrice = basePrice * occasionMultiplier * guestMultiplier;
  
  // Calculate location surcharge amount
  const locationSurchargeAmount = adjustedBasePrice * locationSurchargeRate;
  
  // Calculate addon prices (placeholder - would be fetched from database)
  const addonPrices: { [addonId: string]: number } = {};
  let totalAddonPrice = 0;
  
  addons.forEach(addonId => {
    // Placeholder addon pricing logic
    const addonPrice = 1000; // This would be fetched from database
    addonPrices[addonId] = addonPrice;
    totalAddonPrice += addonPrice;
  });

  // Calculate subtotal
  const subtotal = adjustedBasePrice + locationSurchargeAmount + totalAddonPrice;
  
  // Calculate taxes (18% GST)
  const taxes = subtotal * 0.18;
  
  // Calculate final amount
  const finalAmount = subtotal + taxes;

  return {
    basePrice: adjustedBasePrice,
    addonPrices,
    locationSurcharge: locationSurchargeAmount,
    guestCountMultiplier: guestMultiplier,
    totalPrice: subtotal,
    taxes,
    finalAmount: Math.round(finalAmount)
  };
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getBudgetRangeByValue(value: string): BudgetRangeConfig | undefined {
  return budgetRanges.find(range => range.value === value);
}

export function isLocationServiceable(location: string): boolean {
  const serviceableCities = Object.keys(locationSurcharges);
  return serviceableCities.some(city => 
    city.toLowerCase().includes(location.toLowerCase()) ||
    location.toLowerCase().includes(city.toLowerCase())
  );
}

export function getLocationSurchargeRate(location: string): number {
  return locationSurcharges[location] || 0;
}