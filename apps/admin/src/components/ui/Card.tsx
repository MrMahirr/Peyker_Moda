import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card = ({ children, className, padding = true }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-slate-200/80 shadow-sm",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ title, description, action, className }: CardHeaderProps) => {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
};
