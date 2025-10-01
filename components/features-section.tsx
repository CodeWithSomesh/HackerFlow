import { Brain, Search, Calendar, Users2, Zap, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
// import { HackersBentoGrid } from "./hackers-features-bento"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Our algorithm analyzes GitHub profiles, skills, and project history to find your ideal teammates.",
    gradient: "from-pink-500 to-purple-600",
    shadowColor: "shadow-pink-500/25"
  },
  {
    icon: Search,
    title: "Hackathon Discovery", 
    description: "Find all hackathons across Malaysia in one place. No more missing out on opportunities.",
    gradient: "from-cyan-400 to-teal-500",
    shadowColor: "shadow-cyan-500/25"
  },
  {
    icon: Users2,
    title: "Team Formation",
    description: "Swipe through potential teammates like Tinder, but based on technical compatibility.",
    gradient: "from-purple-500 to-pink-500",
    shadowColor: "shadow-purple-500/25"
  },
  {
    icon: Calendar,
    title: "Event Management", 
    description: "Organizers get powerful tools to manage participants, track registrations, and analyze success.",
    gradient: "from-yellow-400 to-orange-500",
    shadowColor: "shadow-yellow-500/25"
  },
  {
    icon: Zap,
    title: "Real-time Collaboration",
    description: "Chat with potential teammates, share project ideas, and build connections before the event.",
    gradient: "from-green-400 to-cyan-500",
    shadowColor: "shadow-green-500/25"
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "GitHub integration ensures authentic profiles and showcases real coding experience.",
    gradient: "from-indigo-500 to-purple-500",
    shadowColor: "shadow-indigo-500/25"
  }
]

export function FeaturesSection() {
  return (
    <>
      {/* Top Gradient */}
      <div className="absolute bottom-100 left-0 right-0 h-32 bg-gradient-to-b from-cyan-300 to-transparent " />

      <section id="features" className="pt-20  dark:from-black dark:to-black">
        <div className="container mx-auto px-4">
          <div className="text-center my-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Why Developers Choose HackerFlow
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-300">
              From AI-powered team matching to centralized event discovery, we solve every pain point in the hackathon experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className={`group hover:shadow-2xl ${feature.shadowColor} transition-all duration-500 border-0 bg-white/80 backdrop-blur-md hover:bg-white/95 hover:scale-105 dark:bg-white/5 dark:hover:bg-white/10 shadow-lg hover:shadow-xl`}
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <CardContent className="p-8 space-y-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-800 transition-colors dark:text-white dark:group-hover:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors dark:text-gray-300 dark:group-hover:text-gray-200">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* <div className="mt-4">
         <HackersBentoGrid />
        </div> */}
        

        {/* Bottom Gradient */}
        <div className="mt-4 h-32 bg-gradient-to-t from-teal-400 to-transparent " />
      </section>

      
    </>
    
  )
}