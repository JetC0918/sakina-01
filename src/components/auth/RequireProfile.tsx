import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RequireProfile({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const { data: profile, isLoading, isError, error } = useUserProfile({
        enabled: !authLoading && !!user,
    });
    const navigate = useNavigate();
    const location = useLocation();

    const [showTimeout, setShowTimeout] = React.useState(false);

    useEffect(() => {
        console.log('[RequireProfile] State:', { isLoading, isError, hasProfile: !!profile, error });
    }, [isLoading, isError, profile, error]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                setShowTimeout(true);
            }
        }, 5000); // 5 seconds timeout

        return () => clearTimeout(timer);
    }, [isLoading]);

    const errorMessage = error instanceof Error ? error.message : '';
    const isMissingProfile = errorMessage.toLowerCase().includes('user not found');

    useEffect(() => {
        if (!isLoading && isError && isMissingProfile) {
            console.log('[RequireProfile] Profile missing, redirecting to onboarding.');
            navigate('/onboarding', { state: { from: location } });
        }
    }, [isLoading, isError, isMissingProfile, navigate, location]);

    if (authLoading || isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                {showTimeout && (
                    <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-muted-foreground">This is taking longer than expected...</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm text-primary hover:underline hover:text-primary/80 font-medium"
                        >
                            Reload Page
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (isError && !isMissingProfile) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-3 text-center px-6">
                <p className="text-muted-foreground">We couldn't load your profile.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-primary hover:underline hover:text-primary/80 font-medium"
                >
                    Reload Page
                </button>
            </div>
        );
    }

    if (isError) {
        return null; // Redirecting to onboarding
    }

    return <>{children}</>;
}
