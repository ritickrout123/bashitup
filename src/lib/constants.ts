// Application Constants

export const OCCASION_TYPES = [
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'other', label: 'Other Celebration' },
] as const;

export const BUDGET_RANGES = [
  { value: '0-5000', label: '₹0 - ₹5,000', min: 0, max: 5000 },
  { value: '5000-10000', label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { value: '10000-20000', label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
  { value: '20000-50000', label: '₹20,000 - ₹50,000', min: 20000, max: 50000 },
  { value: '50000+', label: '₹50,000+', min: 50000, max: 999999 },
] as const;

export const TIME_SLOTS = [
  { startTime: '09:00', endTime: '13:00', label: 'Morning (9 AM - 1 PM)' },
  { startTime: '14:00', endTime: '18:00', label: 'Afternoon (2 PM - 6 PM)' },
  { startTime: '19:00', endTime: '23:00', label: 'Evening (7 PM - 11 PM)' },
] as const;

export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
] as const;

export const USP_FEATURES = [
  {
    icon: '⚡',
    title: '60-Minute Setup',
    description: 'Lightning-fast decoration setup'
  },
  {
    icon: '💰',
    title: 'Affordable Packages',
    description: 'Budget-friendly celebration options'
  },
  {
    icon: '🎨',
    title: 'Custom Themes',
    description: 'Personalized decoration themes'
  },
  {
    icon: '🏙️',
    title: 'Pan-City Service',
    description: 'Available across major cities'
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Choose Occasion',
    description: 'Select your celebration type',
    icon: '🎉'
  },
  {
    step: 2,
    title: 'Pick Theme',
    description: 'Browse and select your favorite theme',
    icon: '🎨'
  },
  {
    step: 3,
    title: 'Confirm Details',
    description: 'Set date, time, and location',
    icon: '📅'
  },
  {
    step: 4,
    title: 'Team Arrives',
    description: 'Our experts set up everything',
    icon: '🚚'
  },
  {
    step: 5,
    title: 'Celebrate',
    description: 'Enjoy your perfect celebration',
    icon: '🎊'
  },
] as const;