import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Download from "@/components/landing/Download";
import Footer from "@/components/landing/Footer";
import { AuthModal } from "@/components/AuthModal";

const Index = () => {
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check if we were redirected from a protected route
  useEffect(() => {
    const state = location.state as { showAuth?: boolean } | null;
    if (state?.showAuth) {
      setAuthModalOpen(true);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Download />
      </main>
      <Footer />

      {/* Auth Modal for protected route redirects */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab="signin"
      />
    </div>
  );
};

export default Index;
