'use client'

import { useState, useEffect, use } from "react";
import { 
    ArrowLeft, 
    Heart, 
    Bookmark, 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    Trophy, 
    ChevronDown,
    Share2,
    CheckCircle,
    AlertCircle,
    Info,
    ChevronUp,
    BadgeInfo,
    Building2,
    Building,
    CalendarClock,
    Dot,
    Sparkles,
    Mail,
    Phone,
    ExternalLink,
    ClockAlert,
    MessageCircleQuestionIcon,
    HandCoins,
    DollarSign,
    Award
} from "lucide-react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { mockHackathons, Hackathon } from "@/lib/mockHackathons"; // Adjust path if different
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconUserStar } from "@tabler/icons-react";
import TrophyImage from "@/assets/Trophy Prize.png"
import PrizeImage from "@/assets/Prize Box.png"
import CertificateImage from "@/assets/Certificate.png"
import { motion} from "framer-motion"


interface HackathonDetailsProps {
  params: Promise<{ id: string; }>
}

export default function HackathonDetails({ params }: HackathonDetailsProps) {
  const resolvedParams = use(params);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // FAQ data
  const faqData = [
    {
      question: "What is the team size requirement?",
      answer: "Teams should consist of 2-4 members maximum. Individual participation is also allowed for certain categories."
    },
    {
      question: "What should I bring to the hackathon?",
      answer: "Please bring your laptop, charger, ID card, any other devices you need, and lots of energy! We'll provide food, drinks, and workspace."
    },
    {
      question: "Are there any specific technology requirements?",
      answer: "While we encourage innovation with any technology stack, projects must align with the hackathon's theme and judging criteria."
    },
    {
      question: "Will there be mentorship available?",
      answer: "Yes! We have industry experts and experienced developers available throughout the event to help guide your project development."
    },
    {
      question: "What about accommodation and food?",
      answer: "All registered participants will be provided with accommodation and meals during the hackathon period. Details will be shared after registration."
    }
  ];

  // Enhanced function to determine date status
  const getDateStatus = (dateStr: string, allDates?: any[]) => {
    if (!allDates) return { type: 'upcoming', label: 'Upcoming', color: 'blue' };
  
    const today = new Date();
    const dateObj = new Date(dateStr);
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { type: 'completed', label: 'Completed', color: 'gray' };
    } else if (diffDays === 0) {
      return { type: 'ongoing', label: 'Today', color: 'green' };
    } else if (diffDays <= 3) {
      // Find the nearest upcoming date
      const upcomingDates = allDates
        .filter(d => {
          const dObj = new Date(d.date);
          return dObj.getTime() > today.getTime();
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const nearestDate = upcomingDates[0];
      const isNearest = nearestDate && nearestDate.date === dateStr;
      
      return isNearest 
        ? { type: 'urgent', label: 'Urgent', color: 'red' }
        : { type: 'upcoming', label: 'Upcoming', color: 'blue' };
    } else {
      return { type: 'upcoming', label: 'Upcoming', color: 'blue' };
    }
  };

  // Enhanced styling function
  const getDateStyling = (status: any) => {
    switch (status.color) {
      case 'red': // Urgent
        return {
          border: "border-red-500/50 bg-red-500/5",
          icon: "bg-red-500/20 text-red-400",
          badge: "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border-red-500/50 animate-pulse",
          glow: "shadow-red-500/20"
        };
      case 'green': // Ongoing/Today
        return {
          border: "border-green-500/50 bg-green-500/5",
          icon: "bg-green-500/20 text-green-400",
          badge: "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/50 animate-pulse",
          glow: "shadow-green-500/20"
        };
      case 'gray': // Completed
        return {
          border: "border-gray-600/50 bg-gray-500/5",
          icon: "bg-gray-500/20 text-gray-400",
          badge: "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/50",
          glow: "shadow-gray-500/10"
        };
      default: // Upcoming
        return {
          border: "border-blue-500/50 bg-blue-500/5",
          icon: "bg-blue-500/20 text-blue-400",
          badge: "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/50",
          glow: "shadow-blue-500/20"
        };
    }
  };

  useEffect(() => {
    // Simulate API call - replace with actual API call
    const foundHackathon = mockHackathons.find(h => h.id === resolvedParams.id);
    setHackathon(foundHackathon || null);
    setLoading(false);
  }, [resolvedParams.id]);

  if (loading || !hackathon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-white mb-4">Hackathon Not Found</h1>
          <p className="text-gray-400 mb-6">The hackathon you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/hackathons"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hackathons
          </Link>
        </div>
      </div>
    );
  }

  const getCardTheme = (theme: string) => {
    const themes = {
      purple: {
        gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
        border: "border-purple-500",
        text: "text-purple-400",
        bg: "bg-purple-500/10"
      },
      teal: {
        gradient: "bg-gradient-to-br from-teal-400 to-teal-600",
        border: "border-teal-500",
        text: "text-teal-400",
        bg: "bg-teal-500/10"
      },
      green: {
        gradient: "bg-gradient-to-br from-green-400 to-green-600",
        border: "border-green-500",
        text: "text-green-400",
        bg: "bg-green-500/10"
      }
    };
    return themes[theme] || themes.purple;
  };

  const theme = getCardTheme(hackathon.colorTheme);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": 
        return "bg-green-500 text-white";
      case "Closing Soon": 
        return "bg-red-500 text-white animate-pulse";
      case "Full": 
        return "bg-gray-500 text-white";
      default: 
        return "bg-gray-500 text-white";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-500 text-white";
      case "Intermediate": return "bg-yellow-500 text-black";
      case "Advanced": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Floating Register Button - Mobile */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <button 
          disabled={hackathon.status === "Full"}
          className={`px-6 py-3 rounded-full font-semibold shadow-2xl transition-all ${
            hackathon.status === "Full" 
              ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
              : `${theme.gradient} text-white hover:scale-105`
          }`}
        >
          {hackathon.status === "Full" ? "Full" : "Register"}
        </button>
      </div>

      {/* Header Navigation */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-b-2 border-gray-700 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button - Enhanced */}
            <Link 
              href="/hackathons"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/40 hover:border-blue-400 text-white hover:text-blue-300 px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
              <span className="text-lg">Back to Hackathons</span>
            </Link>
            
            {/* Action Buttons - Enhanced */}
            <div className="flex items-center gap-3">
              {/* Bookmark Button */}
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`group relative p-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                  isBookmarked 
                    ? 'bg-gradient-to-r from-blue-500/30 to-blue-600/30 border-blue-400 text-blue-300 shadow-blue-500/20' 
                    : 'bg-gray-800/50 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-300'
                }`}
              >
                <Bookmark className={`w-6 h-6 transition-all ${isBookmarked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                  {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                </div>
              </button>
              
              {/* Share Button */}
              <button className="group relative p-3 rounded-xl font-semibold bg-gray-800/50 hover:bg-gradient-to-r hover:from-green-500/20 hover:to-teal-500/20 border-2 border-gray-600 hover:border-green-400 text-gray-300 hover:text-green-300 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/20">
                <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                  Share Event
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 max-w-7xl mx-auto px-6">
        <div className="  max-h-full border border-gray-400 rounded-md flex mx-auto overflow-hidden">
          {hackathon.image !== "/api/placeholder/400/200" && (
            <Image
              src={hackathon.image}
              alt={hackathon.title}
              className="object-cover w-full object-top rounded-md"
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 px-6">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Hero Section - More compact */}
            <div className="relative rounded-md overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700">
              {/* <div className="absolute inset-0 opacity-20">
                {hackathon.image !== "/api/placeholder/400/200" && (
                  <Image
                    src={hackathon.image}
                    alt={hackathon.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div> */}
              
              {/* Decorative gradient overlay */}
              <div className={`absolute inset-0 ${theme.gradient} opacity-75`}></div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {/* <div className="flex items-center gap-3 mb-4">
                      {hackathon.featured && (
                        <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-md text-sm font-bold">
                          <Star className="h-4 w-4 fill-current" />
                          Featured
                        </div>
                      )}
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${getStatusBadge(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                      <span className={`px-3 py-1.5 rounded-md text-sm font-bold ${getLevelColor(hackathon.level)}`}>
                        {hackathon.level}
                      </span>
                    </div> */}
                    <div className="grid grid-cols-[15%_80%] gap-3">
                      <div className="rounded-md h-fit grid overflow-hidden">
                        <Image
                          src={hackathon.image}
                          alt={hackathon.title}
                          className="object-cover h-[100px]"
                        />
                      </div>

                      <h1 className="text-4xl lg:text-5xl font-black font-blackops text-white">{hackathon.title}</h1>
                    </div>
                  </div>
                </div>

                {/* Organizer & Updated Date */}
                <div className="my-4 flex flex-col gap-1 w-fit pr-4 font-mono">
                  <div className="flex gap-1 items-center">
                    <Building className="w-5 h-5" />
                    <p className="text- text-gray-100 font-medium">Organized by {""}
                      <span className="underline hover:italic font-blackops text-lg">{hackathon.organizer}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-1 items-center">
                    <CalendarClock className="w-5 h-5" />
                    <p className="text- text-gray-100 font-medium">Updated On: 16th Sept, 2025</p>
                  </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-3 text-center hover:bg-black/60 transition-all">
                    <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white font-mono">{hackathon.participants}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1">Participants</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-3 text-center hover:bg-black/60 transition-all">
                    <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white font-mono">{hackathon.totalPrizePool.split(' ')[0]}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1">Prize Pool</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-3 text-center hover:bg-black/60 transition-all">
                    <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white font-mono">{hackathon.timeLeft.split(' ')[0]}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1">Days Left</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-3 text-center hover:bg-black/60 transition-all">
                    <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white font-mono">{hackathon.mode}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1">{hackathon.location.split(',')[0]}</div>
                  </div>
                </div>
                
                {/* Eligibility */}
                <div className="mt-3 bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-5 hover:bg-black/60 transition-all">
                  <div className="flex w-fit gap-2 items-center">
                    <Sparkles className="w-6 h-6 text-orange-400 ml-1" />
                    <h1 className="font-geist text-2xl font-bold text-white">Eligibility</h1>
                  </div>
                  
                  {/* Who are Eligible */}
                  <div className="flex flex-wrap gap-2 mb- font-mono">
                    {hackathon.eligibility.map((tag, index) => (
                      <span 
                        key={index}
                        className="mt-2 text-gray-300 flex text-sm items-center"
                      >
                        <Dot />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Requirements */}
            {hackathon.requirements && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
                <div className="text-white mb-6 flex items-center gap-3">
                  <CheckCircle className={`w-9 h-9 ${theme.text}`} />
                  <h1 className="text-3xl font-bold font-blackops mt-1">REQUIREMENTS</h1>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {hackathon.requirements.map((req, index) => (
                    <div key={index} className="flex items-center font-geist gap-4 px-4 py-2.5 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-300 leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
              <div className=" mb-6 flex items-center gap-3">
               <Info className={`h-9 w-9 ${theme.gradient} rounded-full`} />
                <h2 className="text-3xl font-bold font-blackops text-white mt-1">ABOUT THIS HACKATHON</h2>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-6">
                {hackathon.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-bold font-mono bg-gradient-to-r from-purple-400 to-pink-400 text-white  border-gray-300 hover:scale-90 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-300 font-geist  eading-relaxed text-lg whitespace-pre-line">
                  {hackathon.detailedDescription || hackathon.description}
                </p>
              </div>
            </div>

            {/* Timeline */}
            {/* {hackathon.timeline && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-blue-400" />
                  Timeline
                </h2>
                <div className="space-y-4">
                  {hackathon.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm ${theme.gradient}`}>
                        {event.date.split(' ')[1] || event.date.split(' ')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* Stages & Timeline - Second Design */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
              <div className="flex items-center gap-3 mb-8">
                <CalendarClock className={`w-9 h-9 ${theme.text}`} />
                <h2 className="text-3xl font-bold text-white font-blackops mt-1">STAGES & TIMELINE</h2>
              </div>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-[21%] w-0.5 bg-gray-600"></div>

                <div className="space-y-8">
                  {hackathon.timeline?.map((stage, index) => (
                    <div key={index} className="relative flex items-start gap-6">
                      {/* Date circle */}
                      <div className="flex-shrink-0 font-mono w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-lg flex flex-col items-center justify-center relative z-10">
                        <div className="text-xl font-bold text-white">{stage.date.split(" ")[0]}</div>
                        <div className="h-[1px] my-[3px] w-full bg-gray-400"></div>
                        <div className="text-sm text-gray-300">{`${stage.date.split(" ")[1]}`}</div>
                      </div>

                      {/* Content card */}
                      <div className="flex-1 bg-gray-800/30 border border-gray-700/50 rounded-xl px-6 py-3 hover:bg-gray-700/30 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between font-mono">
                            <h3 className="text-xl font-semibold text-white underline">{stage.title}</h3>
                            {stage.isActive && (
                              <div className="flex items-center gap-1 px-3 py-1 bg-gray-900 nimate-pulse font-bold font-geist text-red-400 text-sm rounded-full border border-blue-500/30">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <h1>Live</h1>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-300 font-geist eading-relaxed">{stage.description}</p>

                          {(stage.startDate || stage.endDate) && (
                            <div className="flex flex-col sm:flex-row gap-10 pt-3 border-t border-gray-600/50">
                              {stage.startDate && (
                                <div className="font-mono flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-blue-400" />
                                  <span className="text-gray-400">Start:</span>
                                  <span className="text-white font-medium">{stage.startDate}</span>
                                </div>
                              )}
                              {stage.endDate && (
                                <div className="font-mono flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-blue-400" />
                                  <span className="text-gray-400">End:</span>
                                  <span className="text-white font-medium">{stage.endDate}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Important Dates & Deadlines */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
              <div className="flex items-center gap-3 mb-8">
                <ClockAlert className={`w-9 h-9 ${theme.text}`} />
                <h2 className="text-3xl font-bold text-white mt-1 font-blackops">IMPORTANT DATES & DEADLINES</h2>
              </div>

              <div className="grid gap-4">
                {hackathon.importantDates?.map((date, index) => {
                  const status = getDateStatus(date.date, hackathon.importantDates);
                  const styling = getDateStyling(status);
                  
                  return (
                    <div
                      key={index}
                      className={`p-6 border rounded-xl transition-all hover:bg-gray-700/30 hover:scale-[1.02] ${styling.border} ${styling.glow} shadow-lg`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg relative ${styling.icon}`}>
                          {/* Animated ring for urgent/ongoing items */}
                          {(status.type === 'urgent' || status.type === 'ongoing') && (
                            <div className={`absolute inset-0 rounded-lg border-2 ${
                              status.type === 'urgent' ? 'border-red-400/60' : 'border-green-400/60'
                            } animate-ping`}></div>
                          )}
                          
                          {status.type === 'urgent' && <AlertCircle className="w-5 h-5 relative z-10" />}
                          {status.type === 'ongoing' && <Clock className="w-5 h-5 relative z-10" />}
                          {status.type === 'completed' && <CheckCircle className="w-5 h-5 relative z-10" />}
                          {status.type === 'upcoming' && <Calendar className="w-5 h-5 relative z-10" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-mono underline font-semibold text-white">{date.title}</h3>
                            
                            {/* Enhanced status badge */}
                            <div className={`px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide ${styling.badge}`}>
                              <div className="flex items-center gap-1.5">
                                {status.type === 'urgent' && <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>}
                                {status.type === 'ongoing' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>}
                                {status.type === 'completed' && <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>}
                                {status.type === 'upcoming' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                                {status.label}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm mt-1">
                            <div className="flex items-center gap-2 font-mono">
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-medium">{date.date}</span>
                            </div>
                            {date.time && (
                              <div className="flex items-center gap-2 font-mono">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="text-white font-medium">{date.time}</span>
                              </div>
                            )}
                          </div>

                          {date.description && <p className="text-gray-300 font-geist text- mt-4">{date.description}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prizes */}
            {hackathon.prizes && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h1 className="text-3xl font-bold text-white font-blackops mt-1">PRIZE POOL DISTRIBUTION</h1>
                </div>

                <div className="relative mb-8 overflow-hidden">
                  {/* Background gradient with animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-orange-500/20 to-red-500/20 animate-pulse"></div>
                  
                  {/* Animated border */}
                  <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-[2px] rounded-2xl">
                    <div className="bg-gray-900 rounded-2xl p-8">
                      {/* Floating icons */}
                      <div className="absolute top-4 left-4 text-yellow-400 animate-bounce">
                        <DollarSign className="w-6 h-6 opacity-60" />
                      </div>
                      <div className="absolute top-4 right-4 text-orange-400 animate-bounce" style={{animationDelay: '0.5s'}}>
                        <Award className="w-6 h-6 opacity-60" />
                      </div>
                      
                      {/* Main content */}
                      <div className="text-center relative">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold font-mono text-gray-300 mb-3 tracking-wide">
                            🏆 TOTAL PRIZE POOL 🏆
                          </h3>
                          
                          {/* Animated prize amount */}
                          <div className="relative inline-block">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 blur-lg opacity-30 animate-pulse"></div>
                            
                            {/* Main text */}
                            <div className="relative text-6xl md:text-7xl font-blackops font-black bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent animate-gradient-x">
                              {hackathon.totalPrizePool}
                            </div>
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="flex justify-center items-center gap-2 mt-4">
                          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent flex-1"></div>
                          <div className="px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full border border-yellow-400/20">
                            <span className="text-sm font-medium text-yellow-200 tracking-wider">
                              UP FOR GRABS
                            </span>
                          </div>
                          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent flex-1"></div>
                        </div>
                        
                        {/* Sparkle effects */}
                        <div className="absolute -top-2 left-1/4 text-yellow-300 animate-ping">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="absolute -bottom-2 right-1/4 text-orange-300 animate-ping" style={{animationDelay: '1s'}}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
          

                <div className="grid gap-4">
                  {hackathon.prizes.map((prize, index) => (
                    <div key={index} className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-">
                          <div className="space-y-">
                            <h3 className="font-semibold text-white text-lg font-mono underline">
                              {prize.category}: {prize.position}
                            </h3>
                            {prize.amount && <p className="text-2xl mt-1 font-bold font-mono text-yellow-400">{prize.amount}</p>}
                            <p className="mt-3 font-geist">{prize?.description}</p>
                          </div>
                        </div>

                        <div className="ml-6 flex-shrink-0">
                          <div>
                            {prize.type === "cash" ? (
                              <motion.div
                                className="w-28 h-28"
                                drag
                                initial={{ translateY: 0 }}
                                dragSnapToOrigin={true}
                              >
                                <Image
                                  src={TrophyImage}
                                  alt="3D Illustration of Trophy"
                                  className="rotate-6 hover:rotate-45 transition-all"
                                  draggable="false"
                                />
                              </motion.div>
                            ) : prize.type === "certificate" ? (
                              <motion.div
                                className="w-32 h-32"
                                drag
                                initial={{ translateY: 0 }}
                                dragSnapToOrigin={true}
                              >
                                <Image
                                  src={CertificateImage}
                                  alt="3D Illustration of Certificate"
                                  className="ml-2 rotate-6 hover:rotate-45 transition-all"
                                  draggable="false"
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                className="w-36 h-36"
                                drag
                                initial={{ translateY: 0 }}
                                dragSnapToOrigin={true}
                              >
                                <Image
                                  src={PrizeImage}
                                  alt="3D Illustration of Prize Box"
                                  className="ml-4 rotate-6 hover:rotate-45 transition-all"
                                  draggable="false"
                                />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
              <div className=" mb-8 flex items-center gap-2">
                <MessageCircleQuestionIcon className={`w-9 h-9 ${theme.text}`} /> 
                <h1 className="text-3xl font-bold text-white font-blackops mt-1">FREQUENTLY ASKED QUESTIONS</h1>
              </div>
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="border border-gray-700 rounded-2xl bg-gray-800/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/20 transition-colors"
                    >
                      <span className="font-semibold font-mono text-white text-lg">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4 border-t border-gray-700/50">
                        <p className="text-gray-300 font-geist leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Organizers */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
              <div className="flex items-center gap-3 mb-5">
                <IconUserStar className={`w-9 h-9 ${theme.text}`} /> 
                <h2 className="text-3xl font-bold font-blackops text-white mt-1">THE ORGANIZERS</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {hackathon.organizers?.map((organizer, index) => (
                  <div key={index} className="px-6 py-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-700/30 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-semibold border border-blue-500/30">
                        {organizer.image ? (
                          <Image
                            src={organizer.image || "/placeholder.svg"}
                            alt={organizer.name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          getInitials(organizer.name)
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="font-mono">
                          <h3 className="text-lg font-semibold text-white">{organizer.name}</h3>
                          <p className="text-sm text-blue-400 font-medium">{organizer.role}</p>
                        </div>
                      </div>  
                    </div>

                    <div className="space-y-2 px-1 mt-3 font-mono">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <a
                          href={`mailto:${organizer.email}`}
                          className="text-gray-300 hover:text-blue-400 transition-colors"
                        >
                          {organizer.email}
                        </a>
                      </div>

                      {organizer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-blue-400" />
                          <a
                            href={`tel:${organizer.phone}`}
                            className="text-gray-300 hover:text-blue-400 transition-colors"
                          >
                            {organizer.phone}
                          </a>
                        </div>
                      )}

                      {/* {organizer.websiteLink && (
                        <button className="w-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                          <a href={organizer.websiteLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4 text-blue-400" />
                            Visit Website
                          </a>
                        </button>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sponsors */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
              <div className="flex items-center gap-3 mb-5">
                <HandCoins className={`w-9 h-9 ${theme.text}`} /> 
                <h2 className="text-3xl font-bold text-white font-blackops mt-1">OUR SPONSORS</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {hackathon.sponsors?.map((sponsor, index) => (
                  <div
                    key={index}
                    className="py-3 px-2 bg-gray-800/30 border border-gray-700/50 rounded-xl transition-all hover:bg-gray-700/30 hover:scale-105 group"
                  >
                    <div className="space-y-">
                      <div className="text-center space-y-">
                        {sponsor.logo ? (
                          <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-lg flex items-center justify-center border border-gray-600 group-hover:border-blue-400/30 transition-colors">
                            <img
                              src={sponsor.logo || "/placeholder.svg"}
                              alt={sponsor.name}
                              className="max-w-12 max-h-12 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 mx-auto bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-lg border border-blue-500/30">
                            {sponsor.name.charAt(0)}
                          </div>
                        )}

                        <h4 className="font-semibold font-mono text-white text-lg mt-1">{sponsor.name}</h4>

                        {sponsor.description && (
                          <p className="text-sm text-gray-300 line-clamp-4 font-geist mt-3">{sponsor.description}</p>
                        )}
                      </div>

                      {sponsor.websiteLink && (
                        <button className="w-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-xs">
                          <a href={sponsor.websiteLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Visit
                          </a>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Streamlined and Sticky */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-500/20 to-teal-500/20 animate-pulse"></div>
              
              {/* Main container with gradient border */}
              <div className="relative bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 p-[2px] rounded-2xl">
                <div className="bg-gray-900 rounded-2xl p-6 space-y-5">
                  
                  {/* Floating decorative elements */}
                  <div className="absolute top-4 right-4 text-purple-400 animate-bounce opacity-30">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="absolute bottom-4 left-4 text-blue-400 animate-bounce opacity-30" style={{animationDelay: '1s'}}>
                    <Users className="w-5 h-5" />
                  </div>

                  {/* Prize Pool Section */}
                  <div className="text-center relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 blur-xl opacity-20 animate-pulse"></div>
                    
                    <div className="relative">
                      <div className="text-4xl font-black font-blackops text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 animate-gradient-x mb-1">
                        {hackathon.totalPrizePool}
                      </div>
                      <div className="text-md text-gray-300 font-mono font-medium tracking-wide">🏆TOTAL PRIZE POOL🏆</div>
                      
                      {/* Status badge with enhanced styling */}
                      <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg text-sm font-bold border-2 ${getStatusBadge(hackathon.status)} relative`}>
                        {/* Animated ring for active status */}
                        {hackathon.status !== "Full" && (
                          <div className="absolute inset-0 rounded-lg border-2 border-current opacity-50 animate-ping"></div>
                        )}
                        <div className="w-2.5 h-2.5 bg-current rounded-lg animate-pulse relative z-10"></div>
                        <span className="relative font-mono z-10">{hackathon.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent flex-1"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent flex-1"></div>
                  </div>

                  {/* CTA Button */}
                  <div className="relative">
                    {hackathon.status !== "Full" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 blur-md opacity-30 animate-pulse"></div>
                    )}
                    <button 
                      disabled={hackathon.status === "Full"}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 relative ${
                        hackathon.status === "Full" 
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600" 
                          : "bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white hover:scale-105 hover:shadow-2xl shadow-lg border-0"
                      }`}
                    >
                      <span className="relative z-10 font-geist">
                        {hackathon.status === "Full" ? "Registration Closed" : "Register Now"}
                      </span>
                    </button>
                  </div>

                  {/* Stats Grid - Non-repetitive data */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Teams Registered */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all">
                      <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white font-mono">{Math.ceil(hackathon.participants / 4)}</div>
                      <div className="text-xs text-gray-300 font-medium">TEAMS</div>
                    </div>

                    {/* Team Size */}
                    <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all">
                      <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white font-mono">2-4</div>
                      <div className="text-xs text-gray-300 font-medium">TEAM SIZE</div>
                    </div>

                    {/* Registration Fee */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all">
                      <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-lg font-bold text-white font-mono">Free</div>
                      <div className="text-xs text-gray-300 font-medium">ENTRY FEE</div>
                    </div>

                    {/* Duration */}
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all">
                      <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-lg font-bold text-white font-mono">48H</div>
                      <div className="text-xs text-gray-300 font-medium">DURATION</div>
                    </div>
                  </div>

                  {/* Participants Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-300 font-mono">Participants</span>
                      <span className="text-white font-bold font-mono">{hackathon.participants}/{hackathon.maxParticipants}</span>
                    </div>
                    
                    {/* Enhanced progress bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-teal-500 transition-all duration-700 relative"
                          style={{ width: `${(hackathon.participants / hackathon.maxParticipants) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-400 font-mono mt-2 font-medium">
                        {Math.round((hackathon.participants / hackathon.maxParticipants) * 100)}% Full
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );}