import { Button } from "@/components/ui/button";
import { Apple, Smartphone, Star } from "lucide-react";

const Download = () => {
  return (
    <section id="download" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Content */}
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Start feeling noticed today
          </h2>
          <p className="text-lg text-secondary-foreground/80 mb-8 max-w-xl mx-auto">
            Download Sakina free and discover support that arrives before you crash. 
            Premium subscription available for deeper, personalized care.
          </p>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              variant="default"
              size="xl"
              className="min-w-[200px]"
            >
              <Apple className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs opacity-80">Download on the</div>
                <div className="font-semibold">App Store</div>
              </div>
            </Button>
            <Button 
              variant="outline"
              size="xl"
              className="min-w-[200px] border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <Smartphone className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs opacity-80">Get it on</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </Button>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-secondary-foreground/80 text-sm">
              4.9 rating • 1,200+ reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
