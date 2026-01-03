import React, { ButtonHTMLAttributes } from 'react';
import { Loader } from './Loader';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function LoadingButton({
    isLoading = false,
    loadingText,
    variant = 'primary',
    fullWidth = false,
    className = '',
    disabled,
    children,
    ...props
}: LoadingButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg focus:ring-purple-500',
        secondary: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-lg focus:ring-pink-500',
        outline: 'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes}
        ${widthClass}
        ${className}
      `}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader size="sm" color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} className="mr-2" />
                    {loadingText || children}
                </>
            ) : (
                children
            )}
        </button>
    );
}
