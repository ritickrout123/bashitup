'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { BookingData, Theme, TimeSlot, EventCategory, Location } from '@/types';
import { PriceCalculator } from './PriceCalculator';
import { AvailabilityChecker } from './AvailabilityChecker';
import { BookingConfirmation } from './BookingConfirmation';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { LoadingButton } from '@/components/ui/LoadingButton';

interface BookingFormProps {
  onSubmit: (booking: BookingData) => void;
  onPriceUpdate: (price: number) => void;
  availableThemes: Theme[];
  className?: string;
}

interface BookingFormData {
  occasionType: string;
  themeId: string;
  date: Date | null;
  timeSlot: TimeSlot | null;
  location: Location;
  guestCount: number;
  budgetRange: { min: number; max: number };
  addons: string[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}

const initialFormData: BookingFormData = {
  occasionType: '',
  themeId: '',
  date: null,
  timeSlot: null,
  location: {
    address: '',
    city: '',
    pincode: '',
    coordinates: { lat: 0, lng: 0 }
  },
  guestCount: 25,
  budgetRange: { min: 5000, max: 10000 },
  addons: [],
  customerInfo: {
    name: '',
    email: '',
    phone: ''
  },
  specialRequests: ''
};

const steps = [
  { id: 1, title: 'Occasion', description: 'What are you celebrating?' },
  { id: 2, title: 'Theme', description: 'Choose your perfect theme' },
  { id: 3, title: 'Location', description: 'Where should we set up?' },
  { id: 4, title: 'Date & Time', description: 'When do you need us?' },
  { id: 5, title: 'Details', description: 'Tell us more about your event' },
  { id: 6, title: 'Contact', description: 'How can we reach you?' },
  { id: 7, title: 'Confirmation', description: 'Review and confirm' }
];



const tricityCities = [
  'Chandigarh',
  'Mohali',
  'Panchkula'
];

export function BookingForm({
  onSubmit,
  onPriceUpdate,
  availableThemes,
  className = ''
}: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [occasionTypes, setOccasionTypes] = useState<{ value: string; label: string; icon: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setOccasionTypes(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
    fetchCategories();
  }, []);

  const handlePriceChange = useCallback((price: number) => {
    setTotalPrice(price);
    onPriceUpdate(price);
  }, [onPriceUpdate]);

  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Prefill form from URL params and Auth user
  useEffect(() => {
    let hasUpdates = false;
    const updates: Partial<BookingFormData> = {};
    const newLocation = { ...formData.location };
    const newCustomerInfo = { ...formData.customerInfo };

    // 1. Handle URL Params (Quick Booking)
    const dateParam = searchParams.get('date');
    const occasionParam = searchParams.get('occasion');
    const cityParam = searchParams.get('location');
    const budgetParam = searchParams.get('budget');
    const themeParam = searchParams.get('theme');

    if (dateParam && !formData.date) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        updates.date = parsedDate;
        hasUpdates = true;
      }
    }

    // Handle Theme Selection (from Theme Details or Catalogue)
    if (themeParam && !formData.themeId && availableThemes.length > 0) {
      const selectedTheme = availableThemes.find(t => t.id === themeParam);
      if (selectedTheme) {
        updates.themeId = selectedTheme.id;
        updates.occasionType = selectedTheme.category;
        hasUpdates = true;
        // Skip to Step 3 (Location) since Occasion (1) and Theme (2) are known
        setCurrentStep(3);
      }
    }

    if (occasionParam && !formData.occasionType && !updates.occasionType) {
      updates.occasionType = occasionParam;
      hasUpdates = true;
      // Skip to Step 2 (Theme) since Occasion (1) is known
      setCurrentStep(2);
    }

    if (cityParam && !formData.location.city) {
      // Ensure city matches one of our allowed options (case-insensitive check)
      const formattedCity = tricityCities.find(c => c.toLowerCase() === cityParam.toLowerCase());
      if (formattedCity) {
        newLocation.city = formattedCity;
        updates.location = newLocation;
        hasUpdates = true;
      }
    }

    // 2. Handle Auth User (Contact Info)
    if (isAuthenticated && user) {
      let infoUpdated = false;
      if (!formData.customerInfo.name && user.name) {
        newCustomerInfo.name = user.name;
        infoUpdated = true;
      }
      if (!formData.customerInfo.email && user.email) {
        newCustomerInfo.email = user.email;
        infoUpdated = true;
      }
      if (!formData.customerInfo.phone && user.phone) {
        newCustomerInfo.phone = user.phone;
        infoUpdated = true;
      }

      if (infoUpdated) {
        updates.customerInfo = newCustomerInfo;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, user]); // Run when params or auth changes

  // Filter themes by occasion
  const filteredThemes = availableThemes.filter(theme =>
    !formData.occasionType || theme.category === formData.occasionType
  );

  // Memoize location to prevent infinite re-renders
  const memoizedLocation = useMemo(() => formData.location, [
    formData.location.address,
    formData.location.city,
    formData.location.pincode
  ]);

  // Update form data
  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));

    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  // Pure validator (NO state update) - used for disable logic
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.occasionType;
      case 2:
        return !!formData.themeId;
      case 3:
        return (
          !!formData.location.city &&
          !!formData.location.address &&
          !!formData.location.pincode
        );
      case 4:
        // Date is enough at minimum, or both date & time depending on requirements.
        return !!formData.date && !!formData.timeSlot;
      case 5:
        return formData.guestCount > 0;
      case 6:
        return (
          !!formData.customerInfo.name &&
          /\S+@\S+\.\S+/.test(formData.customerInfo.email) &&
          /^\+?[\d\s-()]{10,}$/.test(formData.customerInfo.phone)
        );
      default:
        return true;
    }
  };

  // State-setting validator (ONLY on actions)
  const validateStepAndSetErrors = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    switch (step) {
      case 1:
        if (!formData.occasionType) {
          newErrors.occasionType = 'Please select an occasion';
          isValid = false;
        }
        break;
      case 2:
        if (!formData.themeId) {
          newErrors.themeId = 'Please select a theme';
          isValid = false;
        }
        break;
      case 3:
        if (!formData.location.city) {
          newErrors.city = 'City is required';
          isValid = false;
        }
        if (!formData.location.address) {
          newErrors.address = 'Address is required';
          isValid = false;
        }
        if (!formData.location.pincode) {
          newErrors.pincode = 'Pincode is required';
          isValid = false;
        } else if (!/^\d{6}$/.test(formData.location.pincode)) {
          newErrors.pincode = 'Invalid pincode';
          isValid = false;
        }
        break;
      case 4:
        if (!formData.date) {
          newErrors.date = 'Date is required';
          isValid = false;
        }
        if (!formData.timeSlot) {
          newErrors.timeSlot = 'Time slot is required';
          isValid = false;
        }
        break;
      case 5:
        if (formData.guestCount <= 0) {
          newErrors.guestCount = 'Guest count must be greater than 0';
          isValid = false;
        }
        break;
      case 6:
        if (!formData.customerInfo.name) {
          newErrors.name = 'Name is required';
          isValid = false;
        }
        if (!formData.customerInfo.email) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
          newErrors.email = 'Invalid email address';
          isValid = false;
        }
        if (!formData.customerInfo.phone) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
        } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.customerInfo.phone)) {
          newErrors.phone = 'Invalid phone number';
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle next step
  const handleNext = () => {
    if (validateStepAndSetErrors(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStepAndSetErrors(6)) return;

    setIsLoading(true);
    try {
      const bookingData: BookingData = {
        occasionType: formData.occasionType,
        themeId: formData.themeId,
        date: formData.date!,
        timeSlot: formData.timeSlot!,
        location: formData.location,
        guestCount: formData.guestCount,
        budgetRange: formData.budgetRange,
        addons: formData.addons,
        customerInfo: formData.customerInfo
      };

      await onSubmit(bookingData);
      showSuccessToast('Booking submitted successfully! 🎉');
      setCurrentStep(7); // Move to confirmation step
    } catch (error) {
      console.error('Booking submission error:', error);
      const message = 'Failed to submit booking. Please try again.';
      setErrors({ submit: message });
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update price when relevant data changes
  useEffect(() => {
    if (formData.occasionType && formData.themeId && formData.guestCount) {
      // Price will be calculated by PriceCalculator component
    }
  }, [formData.occasionType, formData.themeId, formData.guestCount, formData.location, formData.addons]);



  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                Step 1
              </span>
              <p className="text-sm text-gray-500">
                This helps us personalize decorations for your event.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {occasionTypes.map((occasion) => {
                const isSelected = formData.occasionType === occasion.value;
                return (
                  <motion.button
                    key={occasion.value}
                    type="button"
                    onClick={() => updateFormData({ occasionType: occasion.value })}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${isSelected
                      ? 'border-pink-500 bg-pink-50/50 shadow-md ring-2 ring-pink-200 ring-offset-2'
                      : 'border-gray-100 bg-white hover:border-pink-200 hover:shadow-lg hover:-translate-y-1'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Checkmark for selected state */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-pink-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    <div className={`text-4xl mb-4 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {occasion.icon}
                    </div>
                    <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {occasion.label}
                    </div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      Event Type
                    </div>
                  </motion.button>
                );
              })}
            </div>
            {errors.occasionType && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-center font-medium bg-red-50 py-2 rounded-lg"
              >
                ⚠️ {errors.occasionType}
              </motion.p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Choose your perfect theme
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredThemes.map((theme) => (
                <motion.div
                  key={theme.id}
                  className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${formData.themeId === theme.id
                    ? 'border-pink-500 shadow-lg'
                    : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                    }`}
                  onClick={() => updateFormData({ themeId: theme.id })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="aspect-video bg-gray-200 relative">
                    {theme.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={theme.images[0]}
                        alt={theme.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-pink-600">
                      ₹{theme.basePrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{theme.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{theme.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Setup: {theme.setupTime} min</span>
                      <span>{theme.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {errors.themeId && (
              <p className="text-red-600 text-center">{errors.themeId}</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Where should we set up?
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Address *
                </label>
                <textarea
                  value={formData.location.address}
                  onChange={(e) => updateFormData({
                    location: { ...formData.location, address: e.target.value }
                  })}
                  placeholder="Enter the complete venue address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  rows={3}
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={formData.location.city}
                    onChange={(e) => updateFormData({
                      location: { ...formData.location, city: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Select City</option>
                    {tricityCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.location.pincode}
                    onChange={(e) => updateFormData({
                      location: { ...formData.location, pincode: e.target.value }
                    })}
                    placeholder="Enter pincode"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  {errors.pincode && <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              When do you need us?
            </h2>
            <AvailabilityChecker
              selectedDate={formData.date}
              selectedTimeSlot={formData.timeSlot}
              location={memoizedLocation}
              onDateChange={(date) => updateFormData({ date })}
              onTimeSlotChange={(timeSlot) => updateFormData({ timeSlot })}
              onAvailableSlotsChange={setAvailableSlots}
            />
            {errors.date && <p className="text-red-600 text-center">{errors.date}</p>}
            {errors.timeSlot && <p className="text-red-600 text-center">{errors.timeSlot}</p>}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Tell us more about your event
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Guest Count *
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.guestCount}
                  onChange={(e) => updateFormData({ guestCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {errors.guestCount && <p className="text-red-600 text-sm mt-1">{errors.guestCount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => updateFormData({ specialRequests: e.target.value })}
                  placeholder="Any special requirements or requests for your event?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              How can we reach you?
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.customerInfo.name}
                  onChange={(e) => updateFormData({
                    customerInfo: { ...formData.customerInfo, name: e.target.value }
                  })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={(e) => updateFormData({
                    customerInfo: { ...formData.customerInfo, email: e.target.value }
                  })}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.customerInfo.phone}
                  onChange={(e) => updateFormData({
                    customerInfo: { ...formData.customerInfo, phone: e.target.value }
                  })}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <BookingConfirmation
            formData={formData}
            selectedTheme={availableThemes.find(t => t.id === formData.themeId)}
            totalPrice={totalPrice}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Stepper - Enhanced */}
      <div className="mb-10 px-2">
        {/* Desktop Stepper */}
        <div className="hidden md:flex items-center justify-between relative z-0">
          {/* Connector Line */}
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10" />

          {steps.slice(0, 6).map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center group cursor-default">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-4 ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white scale-100'
                    : isActive
                      ? 'bg-white border-pink-500 text-pink-600 scale-110 shadow-lg'
                      : 'bg-white border-gray-200 text-gray-400'
                    }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`mt-2 text-xs font-semibold tracking-wide uppercase transition-colors duration-300 ${isActive ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper - Simplified */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <div className="text-sm font-semibold text-gray-500">
            Step {currentStep} of 6
          </div>
          <div className="flex gap-1">
            {steps.slice(0, 6).map(step => (
              <div key={step.id} className={`h-1.5 rounded-full transition-all duration-300 ${currentStep >= step.id ? 'w-6 bg-pink-500' : 'w-2 bg-gray-200'
                }`} />
            ))}
          </div>
        </div>

        {/* Step Header & Microcopy */}
        <div className="text-center md:mt-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {steps[currentStep - 1]?.title}
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 mb-24 md:mb-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Price Calculator */}
        {currentStep >= 2 && currentStep < 7 && formData.themeId && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <PriceCalculator
              occasionType={formData.occasionType as EventCategory}
              selectedTheme={availableThemes.find(t => t.id === formData.themeId)}
              guestCount={formData.guestCount}
              location={formData.location}
              addons={formData.addons}
              onPriceChange={handlePriceChange}
            />
          </div>
        )}

        {/* Navigation Buttons - Sticky Mobile */}
        {currentStep < 7 && (
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0 md:mt-10 flex items-center justify-between gap-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3.5 rounded-xl font-medium transition-all duration-200 ${currentStep === 1
                ? 'opacity-0 pointer-events-none'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                }`}
            >
              Back
            </button>

            {currentStep === 6 ? (
              <LoadingButton
                type="button"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Processing..."
                className="flex-1 md:flex-none px-8 py-3.5 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Complete Booking
              </LoadingButton>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                // Determine if next is allowed based on validation
                disabled={!isStepValid(currentStep)}
                className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:grayscale"
              >
                Next Step
              </button>
            )}
          </div>
        )}

        {errors.submit && (
          <p className="text-red-600 text-center mt-4">{errors.submit}</p>
        )}
      </div>
    </div>
  );
}