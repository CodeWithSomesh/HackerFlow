import { ArrowRight, Github, Heart, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    step: "01",
    icon: Github,
    title: "Connect Your GitHub",
    description: "Link your GitHub profile to showcase your skills, experience, and coding style to potential teammates.",
    gradient: "from-cyan-400 to-teal-500",
    shadowColor: "shadow-cyan-500/25"
  },
  {
    step: "02", 
    icon: Heart,
    title: "Smart Matching",
    description: "Our AI analyzes your profile and suggests compatible teammates based on complementary skills and experience levels.",
    gradient: "from-pink-500 to-purple-600",
    shadowColor: "shadow-pink-500/25"
  },
  {
    step: "03",
    icon: Rocket,
    title: "Build & Win",
    description: "Form your perfect team, join hackathons across Malaysia, and build amazing projects together.",
    gradient: "from-yellow-400 to-orange-500",
    shadowColor: "shadow-yellow-500/25"
  }
]

export function HowItWorks() {
  return (
    <>
      {/* Top Gradient */}
      <div className="absolute bottom-100 left-0 right-0 h-32 bg-gradient-to-b from-teal-400 to-transparent" />

      <section id="how-it-works" className="py-20  ">
        <div className="container mx-auto px-4">
          <div className="text-center my-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              How HackerFlow Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              Three simple steps to find your perfect hackathon teammates and start building incredible projects.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className={`text-center p-8 border-0 bg-white/80 backdrop-blur-md hover:bg-white/95 hover:scale-105 transition-all duration-500 group ${step.shadowColor} hover:shadow-2xl dark:bg-white/5 dark:hover:bg-white/10 shadow-lg hover:shadow-xl`}>
                  <CardContent className="space-y-6">
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                        <step.icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shadow-md dark:bg-white dark:text-gray-900">
                        {step.step}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-800 transition-colors dark:text-white dark:group-hover:text-gray-100">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors dark:text-gray-300 dark:group-hover:text-gray-200">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Animated Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center animate-pulse dark:from-purple-500 dark:to-pink-500">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 dark:from-pink-500 dark:to-purple-600"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
     </> 
  )
}