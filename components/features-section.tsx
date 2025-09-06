import { Brain, Search, Calendar, Users2, Zap, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Our algorithm analyzes GitHub profiles, skills, and project history to find your ideal teammates.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Search,
    title: "Hackathon Discovery",
    description: "Find all hackathons across Malaysia in one place. No more missing out on opportunities.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Users2,
    title: "Team Formation",
    description: "Swipe through potential teammates like Tinder, but based on technical compatibility.",
    gradient: "from-green-500 to-teal-500"
  },
  {
    icon: Calendar,
    title: "Event Management",
    description: "Organizers get powerful tools to manage participants, track registrations, and analyze success.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Zap,
    title: "Real-time Collaboration",
    description: "Chat with potential teammates, share project ideas, and build connections before the event.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "GitHub integration ensures authentic profiles and showcases real coding experience.",
    gradient: "from-indigo-500 to-purple-500"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Developers Choose HackerFlow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From AI-powered team matching to centralized event discovery, we solve every pain point in the hackathon experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}