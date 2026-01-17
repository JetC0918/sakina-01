import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

export default function RequireProfile({ children }: { children: React.ReactNode }) {
    const { data: profile, isLoading, isError, error } = useUserProfile();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && isError) {
            // Check if error is 404 (or generic error from apiRequest which might not expose status easily, but missing profile implies onboarding needed)
            // Assuming 404 triggers strict onboarding
            // But verify if error object has status. 
            // For now, if we can't fetch profile, we assume user needs setup.
            navigate('/onboarding', { state: { from: location } });
        }
    }, [isLoading, isError, navigate, location]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return null; // Redirecting...
    }

    return <>{children}</>;
}
