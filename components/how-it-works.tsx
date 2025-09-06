import { ArrowRight, Github, Heart, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    step: "01",
    icon: Github,
    title: "Connect Your GitHub",
    description: "Link your GitHub profile to showcase your skills, experience, and coding style to potential teammates.",
    color: "text-blue-500"
  },
  {
    step: "02", 
    icon: Heart,
    title: "Smart Matching",
    description: "Our AI analyzes your profile and suggests compatible teammates based on complementary skills and experience levels.",
    color: "text-pink-500"
  },
  {
    step: "03",
    icon: Rocket,
    title: "Build & Win",
    description: "Form your perfect team, join hackathons across Malaysia, and build amazing projects together.",
    color: "text-green-500"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How HackerFlow Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to find your perfect hackathon teammates and start building incredible projects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              <Card className="text-center p-8 border-0 bg-card/30 backdrop-blur-sm">
                <CardContent className="space-y-6">
                  <div className="relative">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center ${step.color}`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-muted text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" className="group">
            Get Started Now
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}