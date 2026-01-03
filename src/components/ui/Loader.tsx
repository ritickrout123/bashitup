
interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    color?: 'white' | 'primary' | 'gray';
}

export function Loader({
    className = "",
    size = 'md',
    color = 'primary'
}: LoaderProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
    };

    const colorClasses = {
        white: 'border-white border-t-transparent',
        primary: 'border-purple-600 border-t-transparent',
        gray: 'border-gray-400 border-t-transparent',
    };

    return (
        <div
            className={`
        inline-block animate-spin rounded-full
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
      `}
            role="status"
            aria-label="loading"
        />
    );
}
