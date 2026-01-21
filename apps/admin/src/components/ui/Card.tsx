import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm",
                    className
                )}
                {...props}
            >
                {title && (
                    <div className="flex flex-col space-y-1.5 p-6 pb-2">
                        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                    </div>
                )}
                <div className={cn("p-6", title && "pt-0")}>
                    {children}
                </div>
            </div>
        );
    }
);
Card.displayName = "Card";
