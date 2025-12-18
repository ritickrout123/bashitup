import { motion } from 'framer-motion';

interface IconProps {
  className?: string;
  animate?: boolean;
}

export function PlayIcon({ className = "w-6 h-6", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      animate={animate ? { scale: [1, 1.1, 1] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity } : undefined}
    >
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </motion.svg>
  );
}

export function ArrowRightIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      animate={animate ? { x: [0, 5, 0] } : undefined}
      transition={animate ? { duration: 1.5, repeat: Infinity } : undefined}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </motion.svg>
  );
}

export function CheckIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      animate={animate ? { scale: [1, 1.2, 1] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity } : undefined}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </motion.svg>
  );
}

export function StarIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      animate={animate ? { rotate: [0, 10, -10, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity } : undefined}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </motion.svg>
  );
}

export function PhoneIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      animate={animate ? { rotate: [0, 10, -10, 0] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity } : undefined}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </motion.svg>
  );
}

export function ClockIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      animate={animate ? { rotate: 360 } : undefined}
      transition={animate ? { duration: 8, repeat: Infinity, ease: "linear" } : undefined}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </motion.svg>
  );
}

export function LocationIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      animate={animate ? { y: [0, -3, 0] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity } : undefined}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </motion.svg>
  );
}

export function HeartIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      animate={animate ? { scale: [1, 1.2, 1] } : undefined}
      transition={animate ? { duration: 1.5, repeat: Infinity } : undefined}
    >
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </motion.svg>
  );
}

export function SparkleIcon({ className = "w-5 h-5", animate = false }: IconProps) {
  return (
    <motion.svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      animate={animate ? { rotate: [0, 180, 360] } : undefined}
      transition={animate ? { duration: 4, repeat: Infinity } : undefined}
    >
      <path d="M12 0l3.09 6.26L22 9.27l-6.91 3.01L12 24l-3.09-11.72L2 9.27l6.91-3.01L12 0z" />
    </motion.svg>
  );
}