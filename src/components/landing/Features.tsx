import { Card, CardContent } from "@/components/ui/card";
import { Mic, Brain, Bell, Heart } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice & Text Journaling",
    description: "Express yourself naturally. Just talk or type—Sakina listens without judgment.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Brain,
    title: "Stress Signal Detection",
    description: "AI that notices the subtle signs: tone changes, silence patterns, and emotional fatigue.",
    color: "bg-primary/30 text-foreground",
  },
  {
    icon: Bell,
    title: "Proactive AI Nudges",
    description: "Don't wait to ask. Sakina steps in with gentle support when stress is rising.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Heart,
    title: "Micro-Interventions",
    description: "1-3 minute breathing and grounding exercises designed for your busy workday.",
    color: "bg-warning/10 text-warning",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Support that finds you
          </h2>
          <p className="text-lg text-muted-foreground">
            Unlike other wellness apps, Sakina doesn't wait for you to figure yourself out. 
            It notices when you're struggling and responds like a grounded friend.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 group cursor-pointer">
              <CardContent className="p-0 space-y-4">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
