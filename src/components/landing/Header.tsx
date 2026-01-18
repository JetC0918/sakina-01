import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'signin' | 'signup'>('signin');

  const openSignIn = () => {
    setAuthDefaultTab('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthDefaultTab('signup');
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Sakina" className="w-10 h-10" />
              <span className="text-xl font-semibold text-foreground">Sakina</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#download" className="text-muted-foreground hover:text-foreground transition-colors">
                Download
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={openSignIn}>Sign In</Button>
              <Button variant="secondary" onClick={openSignUp}>Get Started</Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#download" className="block text-muted-foreground hover:text-foreground transition-colors">
                Download
              </a>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={openSignIn}>Sign In</Button>
                <Button variant="secondary" className="flex-1" onClick={openSignUp}>Get Started</Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authDefaultTab}
      />
    </>
  );
};

export default Header;
