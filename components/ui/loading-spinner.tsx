import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

/**
 * Loading spinner component with customizable size
 */
export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  // Determine size class
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }[size];
  
  return (
    <div className={`relative ${className}`}>
      <div
        className={`animate-spin rounded-full border-solid border-blue-600 border-t-transparent ${sizeClass}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
} 