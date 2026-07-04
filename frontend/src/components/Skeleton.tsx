import React from 'react';
import { cn } from '../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export function Skeleton({ className, variant = 'rect', count = 1 }: SkeletonProps) {
  const elements = Array.from({ length: count });

  return (
    <>
      {elements.map((_, idx) => (
        <div
          key={idx}
          className={cn(
            'skeleton',
            variant === 'text' && 'h-4 w-3/4 my-1.5',
            variant === 'rect' && 'h-24 w-full',
            variant === 'circle' && 'h-12 w-12 rounded-full',
            className
          )}
        />
      ))}
    </>
  );
}
