import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      
      <div className="container relative z-10 mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-soft px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-foreground">Now available in Saudi Arabia</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight mb-6">
          Your calm companion that notices{" "}
          <span className="text-accent">before you crash</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Sakina detects emotional exhaustion through voice and journaling, 
          then steps in with timely support—so you never have to ask for help.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button variant="hero" size="xl">
            Download Free
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="xl">
            <Play className="w-5 h-5" />
            See How It Works
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {String.fromCharCode(64 + i)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Trusted by <span className="font-semibold text-foreground">2,500+</span> young professionals
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
