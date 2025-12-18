'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
  videoUrl?: string;
}

interface HowItWorksProps {
  steps?: Step[];
  title?: string;
  subtitle?: string;
  showVideo?: boolean;
}

const defaultSteps: Step[] = [
  {
    id: '1',
    number: 1,
    title: 'Choose Occasion',
    description: 'Select your celebration type and preferred date',
    icon: '🎉',
    details: [
      'Pick from birthday, anniversary, baby shower, or corporate events',
      'Choose your preferred date and time slot',
      'Tell us about your guest count and venue'
    ]
  },
  {
    id: '2',
    number: 2,
    title: 'Pick Theme & Package',
    description: 'Browse our curated themes and select your package',
    icon: '🎨',
    details: [
      'Explore 50+ professionally designed themes',
      'Choose from Basic, Premium, or Luxury packages',
      'Customize with add-ons like photography, cake, etc.'
    ]
  },
  {
    id: '3',
    number: 3,
    title: 'Confirm Date & Location',
    description: 'Finalize your booking details and location',
    icon: '📍',
    details: [
      'Confirm your venue address and accessibility',
      'Schedule the setup time (we need Few Minutes)',
      'Provide any special requirements or preferences'
    ]
  },
  {
    id: '4',
    number: 4,
    title: 'Team Arrives & Sets Up',
    description: 'Our professional team transforms your space',
    icon: '⚡',
    details: [
      'Expert decorators arrive with all materials',
      'Complete setup in exactly Few Minutes',
      'Quality check and final touches before handover'
    ]
  },
  {
    id: '5',
    number: 5,
    title: 'Celebrate!',
    description: 'Enjoy your perfectly decorated celebration',
    icon: '🎊',
    details: [
      'Your space is ready for the perfect celebration',
      'Capture memories with our professional setup',
      'Optional cleanup service after your event'
    ]
  }
];

export function HowItWorks({
  steps = defaultSteps,
  title = "How It Works",
  subtitle = "From booking to celebration in 5 simple steps",
  showVideo = true
}: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState<string>(steps[0]?.id || '1');
  const [showVideoModal, setShowVideoModal] = useState(false);

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

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const activeStepData = steps.find(step => step.id === activeStep);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Video CTA */}
          {showVideo && (
            <motion.button
              onClick={() => setShowVideoModal(true)}
              className="group inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-pink-500 text-pink-600 font-semibold rounded-full hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch How It Works (30 sec)
            </motion.button>
          )}
        </motion.div>

        {/* Steps Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.button
              key={step.id}
              variants={stepVariants}
              onClick={() => setActiveStep(step.id)}
              className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                activeStep === step.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Step number */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                activeStep === step.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-pink-100 group-hover:text-pink-600'
              }`}>
                {step.number}
              </div>
              
              {/* Step title */}
              <span className="font-semibold text-sm md:text-base">
                {step.title}
              </span>

              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 w-16 h-0.5 bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                    initial={{ width: '0%' }}
                    animate={{ width: index < steps.findIndex(s => s.id === activeStep) ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Active Step Details */}
        <AnimatePresence mode="wait">
          {activeStepData && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        className="text-6xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        {activeStepData.icon}
                      </motion.div>
                      <div>
                        <div className="text-sm font-semibold text-pink-600 mb-1">
                          Step {activeStepData.number}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                          {activeStepData.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-lg text-gray-600 mb-6">
                      {activeStepData.description}
                    </p>

                    <ul className="space-y-3">
                      {activeStepData.details.map((detail, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mt-2" />
                          <span className="text-gray-700">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className="relative">
                    <motion.div
                      className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        className="text-8xl md:text-9xl opacity-80"
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {activeStepData.icon}
                      </motion.div>
                    </motion.div>

                    {/* Decorative elements */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const quickBookingElement = document.getElementById('quick-booking');
                if (quickBookingElement) {
                  quickBookingElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Book Now
            </motion.button>
            
            <motion.a
              href="tel:+919876543210"
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-pink-500 hover:text-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Call Support
            </motion.a>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            🕐 <strong>60-minute setup guarantee</strong> • 
            📞 <strong>24/7 support</strong> • 
            💯 <strong>100% satisfaction</strong>
          </p>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-2xl w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">How BashItNow Works</h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                {/* Placeholder for video - would be replaced with actual video component */}
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-gray-600">Video player would be embedded here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    (Integration with YouTube/Vimeo or custom video player)
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-br from-pink-200/10 to-purple-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-48 h-48 bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </section>
  );
}