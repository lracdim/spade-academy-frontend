import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showLogo?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    className,
    size = 'md',
    showLogo = true
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-20 h-20',
        xl: 'w-32 h-32'
    };

    const logoSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
        xl: 'w-16 h-16'
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Outer Spinner Ring */}
            <div className={cn(
                "border-4 border-gray-100 border-t-[#d0a868] rounded-full animate-spin",
                sizeClasses[size]
            )}></div>

            {/* Logo in the center */}
            {showLogo && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img
                        src="/logo.jpg"
                        alt="Spade Academy Logo"
                        className={cn("rounded-full object-cover", logoSizeClasses[size])}
                    />
                </div>
            )}
        </div>
    );
};

export default LoadingSpinner;
