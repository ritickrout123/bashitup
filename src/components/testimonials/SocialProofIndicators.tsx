'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CalendarDaysIcon, 
  HeartIcon,
  TrophyIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface SocialProofStats {
  totalClients: number;
  totalEvents: number;
  averageRating: number;
  totalReviews: number;
  yearsInBusiness: number;
  citiesServed: number;
  setupTime: number; // in minutes
  satisfactionRate: number; // percentage
}

interface SocialProofIndicatorsProps {
  stats: SocialProofStats;
  animated?: boolean;
  layout?: 'horizontal' | 'grid' | 'compact';
  showIcons?: boolean;
  className?: string;
}

export default function SocialProofIndicators({
  stats,
  animated = true,
  layout = 'grid',
  showIcons = true,
  className = ''
}: SocialProofIndicatorsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    totalClients: 0,
    totalEvents: 0,
    averageRating: 0,
    totalReviews: 0,
    yearsInBusiness: 0,
    citiesServed: 0,
    setupTime: 0,
    satisfactionRate: 0
  });

  // Animate numbers on mount
  useEffect(() => {
    if (!animated) {
      setAnimatedStats(stats);
      return;
    }

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        totalClients: Math.floor(stats.totalClients * easeOutQuart),
        totalEvents: Math.floor(stats.totalEvents * easeOutQuart),
        averageRating: Number((stats.averageRating * easeOutQuart).toFixed(1)),
        totalReviews: Math.floor(stats.totalReviews * easeOutQuart),
        yearsInBusiness: Math.floor(stats.yearsInBusiness * easeOutQuart),
        citiesServed: Math.floor(stats.citiesServed * easeOutQuart),
        setupTime: Math.floor(stats.setupTime * easeOutQuart),
        satisfactionRate: Math.floor(stats.satisfactionRate * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats, animated]);

  const indicators = [
    {
      key: 'totalClients',
      label: 'Happy Clients',
      value: animatedStats.totalClients.toLocaleString(),
      suffix: '+',
      icon: <UserGroupIcon className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      key: 'totalEvents',
      label: 'Events Completed',
      value: animatedStats.totalEvents.toLocaleString(),
      suffix: '+',
      icon: <CalendarDaysIcon className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      key: 'averageRating',
      label: 'Average Rating',
      value: animatedStats.averageRating.toFixed(1),
      suffix: '/5',
      icon: <StarIcon className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      key: 'satisfactionRate',
      label: 'Satisfaction Rate',
      value: animatedStats.satisfactionRate,
      suffix: '%',
      icon: <HeartIcon className="h-6 w-6" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      key: 'setupTime',
      label: 'Setup Time',
      value: animatedStats.setupTime,
      suffix: ' min',
      icon: <ClockIcon className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      key: 'citiesServed',
      label: 'Cities Served',
      value: animatedStats.citiesServed,
      suffix: '+',
      icon: <SparklesIcon className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap justify-center gap-8';
      case 'compact':
        return 'flex flex-wrap justify-center gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6';
    }
  };

  const getItemClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'text-center min-w-[120px]';
      case 'compact':
        return 'text-center min-w-[100px]';
      case 'grid':
      default:
        return 'text-center';
    }
  };

  return (
    <div className={`${className}`}>
      <div className={getLayoutClasses()}>
        {indicators.map((indicator) => (
          <div key={indicator.key} className={getItemClasses()}>
            {showIcons && (
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${indicator.bgColor} mb-3`}>
                <div className={indicator.color}>
                  {indicator.icon}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {indicator.value}
                <span className="text-lg text-gray-600">{indicator.suffix}</span>
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                {indicator.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact version for headers/footers
interface CompactSocialProofProps {
  totalClients: number;
  averageRating: number;
  totalReviews: number;
  className?: string;
}

export function CompactSocialProof({
  totalClients,
  averageRating,
  totalReviews,
  className = ''
}: CompactSocialProofProps) {
  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      {/* Client count */}
      <div className="flex items-center space-x-2">
        <UserGroupIcon className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-semibold text-gray-900">
          {totalClients.toLocaleString()}+ Happy Clients
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-900 ml-1">
            {averageRating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          ({totalReviews.toLocaleString()} reviews)
        </span>
      </div>
    </div>
  );
}

// Live activity indicator
interface LiveActivityProps {
  recentBookings: number;
  timeframe: string;
  className?: string;
}

export function LiveActivity({
  recentBookings,
  timeframe,
  className = ''
}: LiveActivityProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 ${className}`}>
      <div className={`w-2 h-2 bg-green-500 rounded-full transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-30'}`} />
      <span className="text-sm font-medium text-green-800">
        {recentBookings} bookings in the last {timeframe}
      </span>
    </div>
  );
}

// Trust badges
interface TrustBadgesProps {
  badges: Array<{
    name: string;
    icon: React.ReactNode;
    description: string;
  }>;
  className?: string;
}

export function TrustBadges({ badges, className = '' }: TrustBadgesProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-gray-600">
            {badge.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {badge.name}
            </div>
            <div className="text-xs text-gray-600">
              {badge.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}