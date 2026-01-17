import React from 'react';
import { cn } from '@/lib/utils';

export function SakinaLogo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-10 h-10", className)}
        >
            {/* Background shape - soft rounded square */}
            <rect x="5" y="5" width="90" height="90" rx="20" className="fill-primary" />

            {/* Abstract 'S' / Calm Wave shape */}
            <path
                d="M30 40 C 30 25, 70 25, 70 40 C 70 65, 30 65, 30 80 C 30 95, 70 85, 70 80"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
            />
            {/* Upper dot for balance */}
            <circle cx="70" cy="30" r="6" className="fill-primary-foreground" />
        </svg>
    );
}
