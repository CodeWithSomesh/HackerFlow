"use client"

import { HeroSection } from "@/components/hero-section";
import { HackersBentoGrid } from "@/components/hackers-bento-grid";
import { OrganizersBentoGrid } from "@/components/organizers-bento-grid";
import PlasmaBackground from "@/components/ui/shadcn-io/plasma-background";
import { useEffect, useState } from "react";

export default function Home() {
  const colors = ['#ed07ea', '#fbff05', '#EE82EE', '#08f8a5', '#00FFFF', '#15f4ee', '#3F00FF'];
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setColor(randomColor);
  }, [colors]);

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Flowing background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <PlasmaBackground
          className="w-full h-full"
          opacity={0.3}
          speed={1}
          scale={1.5}
          color={color}
          mouseInteractive={true}
        />
      </div>

      <main className="relative z-10">
        <HeroSection />
        <HackersBentoGrid />
        <OrganizersBentoGrid />
      </main>
    </div>
  );
}
