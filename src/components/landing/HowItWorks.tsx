const steps = [
  {
    number: "01",
    title: "Share how you feel",
    description: "Record a voice note or type a quick reflection. No labels, no menus—just your honest words.",
  },
  {
    number: "02",
    title: "Sakina listens",
    description: "Our AI analyzes tone, patterns, and silence to understand when you're overwhelmed.",
  },
  {
    number: "03",
    title: "Get timely support",
    description: "A gentle nudge arrives exactly when you need it: \"You sound worn down. Let's pause.\"",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Sakina works
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple by design. Relief exactly when it's needed.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute left-[60px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-success" />

            {/* Step Items */}
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-8 items-start group">
                  {/* Step Number */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-[120px] h-[120px] rounded-3xl bg-card shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                      <span className="text-4xl font-bold text-primary">{step.number}</span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="pt-6 md:pt-10">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
