import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              'block w-10 h-6 rounded-full transition-colors',
              checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
          <div
            className={cn(
              'absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform',
              checked && 'transform translate-x-4'
            )}
          />
        </div>
        {label && (
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
