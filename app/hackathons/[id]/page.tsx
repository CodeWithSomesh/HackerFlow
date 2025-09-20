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
    HandCoins
} from "lucide-react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { mockHackathons, Hackathon } from "@/lib/mockHackathons"; // Adjust path if different
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconQuestionMark, IconUserStar } from "@tabler/icons-react";


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
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/hackathons"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Hackathons
            </Link>
            <div className="flex items-center gap-2">
              {/* <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-all ${isLiked ? 'text-red-500 bg-red-500/10 scale-110' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10 hover:scale-110'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button> */}
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-all ${isBookmarked ? 'text-blue-500 bg-blue-500/10 scale-110' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 hover:scale-110'}`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all hover:scale-110">
                <Share2 className="w-5 h-5" />
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

                      <h1 className="text-4xl lg:text-5xl font-black font-blackops text-white leading-tight">{hackathon.title}</h1>
                    </div>
                  </div>
                </div>

                {/* Organizer & Updated Date */}
                <div className="mb-2 flex flex-col gap-1 w-fit pr-4">
                  <div className="flex gap-1 items-center">
                    <Building className="w-5 h-5" />
                    <p className="text- text-gray-100 font-medium">Organized by {""}
                      <span className="underline hover:italic">{hackathon.organizer}</span>
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
                    <div className="text-2xl font-bold text-white font-mono">{hackathon.prize.split(' ')[0]}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1">Prize Pool</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-3 text-center hover:bg-black/60 transition-all">
                    <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white font-mono">{hackathon.timeLeft.split(' ')[0]}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1">Days Left</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-3 text-center hover:bg-black/60 transition-all">
                    <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white font-mono">{hackathon.mode}</div>
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
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-600"></div>

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
                {hackathon.importantDates?.map((date, index) => (
                  <div
                    key={index}
                    className={`p-6 bg-gray-800/30 border rounded-xl transition-all hover:bg-gray-700/30 ${
                      date.isUrgent ? "border-red-500/50 bg-red-500/5" : "border-gray-700/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          date.isUrgent ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {date.isUrgent ? <AlertCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-mono underline font-semibold text-white">{date.title}</h3>
                          {date.isUrgent && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                              Urgent
                            </span>
                          )}
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
                ))}
              </div>
            </div>

            {/* Prizes */}
            {hackathon.prizes && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 px-8 py-6">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  Prize Pool Distribution
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {hackathon.prizes.map((prize, index) => (
                    <div key={index} className="relative group">
                      <div className={`absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        'bg-gradient-to-br from-orange-400 to-orange-600'
                      }`}></div>
                      <div className="relative border border-gray-600 rounded-2xl p-6 bg-gray-800/30 hover:bg-gray-700/30 transition-all">
                        <div className="text-center mb-4">
                          <Trophy className={`w-12 h-12 mx-auto mb-2 ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-400' :
                            'text-orange-400'
                          }`} />
                          <div className="font-bold text-white text-lg">{prize.position}</div>
                        </div>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-black text-white">{prize.amount}</div>
                        </div>
                        {prize.benefits && (
                          <div className="space-y-2">
                            {prize.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        )}
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

                    <div className="space-y-2 px-3 mt-3 font-mono">
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
                    className="py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl transition-all hover:bg-gray-700/30 hover:scale-105 group"
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
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 p-6 shadow-2xl">
              {/* Prize & Status */}
              <div className="text-center mb-6 pb-6 border-b border-gray-700">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                  {hackathon.prize}
                </div>
                <div className="text-sm text-gray-400 font-medium">Total Prize Pool</div>
                <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(hackathon.status)}`}>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  {hackathon.status}
                </div>
              </div>
              
              {/* CTA Button */}
              <button 
                disabled={hackathon.status === "Full"}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg mb-6 transition-all duration-300 ${
                  hackathon.status === "Full" 
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                    : `${theme.gradient} text-white hover:scale-105 hover:shadow-2xl shadow-lg`
                }`}
              >
                {hackathon.status === "Full" ? "Registration Closed" : "Register Now"}
              </button>
              
              {/* Quick Stats */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Participants</span>
                  <span className="text-white font-bold">{hackathon.participants}/{hackathon.maxParticipants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Time Left</span>
                  <span className="text-white font-bold">{hackathon.timeLeft}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Mode</span>
                  <span className="text-white font-bold">{hackathon.mode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Level</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getLevelColor(hackathon.level)}`}>
                    {hackathon.level}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-3 font-medium">
                  <span>Registration Progress</span>
                  <span>{Math.round((hackathon.participants / hackathon.maxParticipants) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${theme.gradient} relative`}
                    style={{ width: `${(hackathon.participants / hackathon.maxParticipants) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="space-y-3">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Key Dates
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-blue-400">Registration Starts</div>
                      <div className="text-sm text-white truncate">{new Date(hackathon.startDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-red-400">Deadline</div>
                      <div className="text-sm text-white truncate">{new Date(hackathon.endDate).toLocaleDateString()}</div>
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