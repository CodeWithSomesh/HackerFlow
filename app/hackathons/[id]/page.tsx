'use client'

import { useState, useEffect, use } from "react";
import { 
    ArrowLeft, 
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
    Building,
    CalendarClock,
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
import Image from "next/image";
import { mockHackathons, Hackathon, } from "@/lib/mockHackathons"; // Adjust path if different
import { IconUserStar } from "@tabler/icons-react";
import TrophyImage from "@/assets/Trophy Prize.png"
import PrizeImage from "@/assets/Prize Box.png"
import CertificateImage from "@/assets/Certificate.png"
import { motion} from "framer-motion"
import { fetchHackathonById, getHackathonTeamCount, getHackathonParticipantCount } from "@/lib/actions/createHackathon-actions";


interface HackathonDetailsProps {
  params: Promise<{ id: string; }>
}

export default function HackathonDetails({ params }: HackathonDetailsProps) {
  const resolvedParams = use(params);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState<number>(0);


  

  useEffect(() => {
    loadHackathon();
  }, [resolvedParams.id]);

  const loadHackathon = async () => {
    setLoading(true);
    try {
      // Try to fetch from database first
      const dbResult = await fetchHackathonById(resolvedParams.id);

      if (dbResult.success && dbResult.data) {
        // Fetch actual team count and participant count
        const [teamCountResult, participantCountResult] = await Promise.all([
          getHackathonTeamCount(resolvedParams.id),
          getHackathonParticipantCount(resolvedParams.id)
        ]);

        if (teamCountResult.success) {
          setTeamCount(teamCountResult.count);
        }

        if (participantCountResult.success) {
          setParticipantCount(participantCountResult.count);
        }

        // Transform DB data to match Hackathon interface
        const transformedData: Hackathon = {
          id: dbResult.data.id,
          title: dbResult.data.title,
          description: dbResult.data.about || 'No description available',
          detailedDescription: dbResult.data.about,
          organizer: dbResult.data.organization, // DB uses 'organization'
          websiteUrl: dbResult.data.website_url || null, 
          startDate: dbResult.data.registration_start_date, // DB uses snake_case
          endDate: dbResult.data.registration_end_date,
          location: dbResult.data.location || 'Online',
          mode: dbResult.data.mode as "Online" | "Hybrid" | "Physical",
          participants: dbResult.data.participants || 0,
          maxParticipants: dbResult.data.max_registrations, // DB uses 'max_registrations'
          totalPrizePool: dbResult.data.total_prize_pool || '$0',
          tags: dbResult.data.categories || [],
          image: dbResult.data.banner_url || '/api/placeholder/400/200', // DB uses 'banner_url'
          logo: dbResult.data.logo_url || '/api/placeholder/100/100', // DB uses 'logo_url'
          status: calculateStatus(dbResult.data) as "Open" | "Closing Soon" | "Full",
          timeLeft: calculateTimeLeft(dbResult.data.registration_start_date, dbResult.data.registration_end_date).text,
          featured: false,
          colorTheme: getRandomTheme(),
          category: dbResult.data.categories?.[0] || 'General',
          level: dbResult.data.eligibility?.includes('Professionals') ? 'Advanced' : 
                 dbResult.data.eligibility?.includes('Students') ? 'Intermediate' : 'Beginner',
          prizeValue: parsePrizeValue(dbResult.data.total_prize_pool),
          eligibility: dbResult.data.eligibility || [],
          requirements: dbResult.data.requirements || [],
          prizes: (() => {
            const parsed = safeJSONParse(dbResult.data.prizes, []);
            console.log('Parsed prizes:', parsed); // Debug log
            return Array.isArray(parsed) ? parsed.map((prize: any) => ({
              position: prize.position || '',
              amount: prize.amount || '',
              type: prize.type || 'cash',
              description: prize.description || ''
            })) : [];
          })(),
          timeline: safeJSONParse(dbResult.data.timeline, []),
          importantDates: (() => {
            const parsed = safeJSONParse(dbResult.data.important_dates, []);
            console.log('Parsed important dates:', parsed); // Debug log
            return Array.isArray(parsed) ? parsed.map((date: any) => ({
              title: date.title || '',
              date: date.date || '',
              time: date.time || '',
              description: date.description || ''
            })) : [];
          })(),
          faq: (() => {
            const parsed = safeJSONParse(dbResult.data.faq, []);
            console.log('Parsed FAQ:', parsed); // Debug log
            return Array.isArray(parsed) ? parsed.map((item: any) => ({
              question: item.question || '',
              answer: item.answer || ''
            })) : [];
          })(),        
          organizers: (() => {
            const parsed = safeJSONParse(dbResult.data.organizers, []);
            console.log('Parsed Organizers:', parsed); // Debug log
            return Array.isArray(parsed) ? parsed.map((org: any) => ({
              name: org.name || '',
              role: org.role || '',
              email: org.email || '',
              phone: org.phone || '',
              photo: org.photo || '',
              profileUrl: org.profileUrl || ''
            })) : [];
          })(),
          sponsors: (() => {
            const parsed = safeJSONParse(dbResult.data.sponsors, []);
            console.log('Parsed Sponsors:', parsed); // Debug log
            return Array.isArray(parsed) ? parsed.map((sponsor: any) => ({
              name: sponsor.name || '',
              logo: sponsor.logo || '',
              website: sponsor.website || '',
              tier: sponsor.tier || '', // Add tier field
              description: sponsor.description || '' // Add description field
            })) : [];
          })(),
        };
        
        setHackathon(transformedData);
      } else {
        // Fallback to mock data
        const foundHackathon = mockHackathons.find(h => h.id === resolvedParams.id);
        setHackathon(foundHackathon || null);
      }
    } catch (error) {
      console.error('Error loading hackathon:', error);
      const foundHackathon = mockHackathons.find(h => h.id === resolvedParams.id);
      setHackathon(foundHackathon || null);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (hack: any): string => {
    const now = new Date();
    const endDate = new Date(hack.registration_end_date);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const currentParticipants = hack.participants || 0;
    const maxParticipants = hack.max_registrations || 1000; // Changed from max_participants
    
    if (currentParticipants >= maxParticipants) return "Full";
    if (daysLeft <= 3 && daysLeft > 0) return "Closing Soon";
    if (daysLeft < 0) return "Full";
    return "Open";
  };

  const safeJSONParse = (jsonString: string | null | undefined, fallback: any = []) => {
    if (!jsonString) return fallback;
    if (typeof jsonString === 'object') return jsonString; // Already parsed
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON parse error:', error);
      return fallback;
    }
  };

  const calculateTimeLeft = (startDate: string, endDate: string): { text: string; label: string } => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If current date is before registration start
    if (now < start) {
      const diffTime = start.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysLeft === 0) return { text: "Starts today", label: "Registration Opens" };
      if (daysLeft === 1) return { text: "1 day", label: "Until Registration Opens" };
      if (daysLeft < 7) return { text: `${daysLeft} days`, label: "Until Registration Opens" };
      if (daysLeft < 30) return { text: `${Math.ceil(daysLeft / 7)} weeks`, label: "Until Registration Opens" };
      return { text: `${Math.ceil(daysLeft / 30)} months`, label: "Until Registration Opens" };
    }
    
    // If current date is after registration start, show time until end
    const diffTime = end.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: "Ended", label: "Registration Closed" };
    if (daysLeft === 0) return { text: "Ends today", label: "Registration Closes" };
    if (daysLeft === 1) return { text: "1 day", label: "Until Registration Closes" };
    if (daysLeft < 7) return { text: `${daysLeft} days`, label: "Until Registration Closes" };
    if (daysLeft < 30) return { text: `${Math.ceil(daysLeft / 7)} weeks`, label: "Until Registration Closes" };
    return { text: `${Math.ceil(daysLeft / 30)} months`, label: "Until Registration Closes" };
  };

  const getRandomTheme = () => {
    const themes = ['purple', 'teal', 'pink', 'green', 'yellow', 'cyan'];
    return themes[Math.floor(Math.random() * themes.length)];
  };

  const parsePrizeValue = (prizeStr: string): number => {
    if (!prizeStr) return 0;
    const numStr = prizeStr.replace(/[^0-9,]/g, '').replace(/,/g, '');
    return parseInt(numStr) || 0;
  };

  // Enhanced function to determine date status
  type DateStatus = {
    type: string;
    label: string;
    color: "blue" | "green" | "red" | "gray";
  };
  const getDateStatus = (dateStr: string, allDates?: { date: string }[]): DateStatus => {
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
  const getDateStyling = (status: DateStatus) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-mono">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-blackops text-white mb-4">Hackathon Not Found</h1>
          <p className="text-gray-400 font-mono mb-6">The hackathon you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link 
            href="/hackathons"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg transition-all font-mono font-bold"
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
    } as const;
    type ThemeKey = keyof typeof themes;

    return themes[(theme as ThemeKey)] || themes.purple;
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }


  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Floating Register Button - Mobile */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Link
          href={hackathon.status === "Full" ? "#" : `/hackathons/${hackathon.id}/register`}
          className={`group relative px-8 py-4 rounded-2xl font-blackops text-lg shadow-2xl transition-all duration-300 inline-block ${
            hackathon.status === "Full"
              ? "bg-gray-700 text-gray-400 cursor-not-allowed border-2 border-gray-600 pointer-events-none"
              : "bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white hover:scale-110 hover:shadow-purple-500/50 border-2 border-transparent hover:border-white/20"
          }`}
        >
          {hackathon.status === "Full" ? (
            "FULL"
          ) : (
            <>
              <span className="relative z-10">REGISTER NOW</span>
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </>
          )}
        </Link>
      </div>

      {/* Enhanced Header Navigation */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-b-2 border-gray-700 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/hackathons"
              className="group flex items-center gap-3 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 hover:from-purple-500/30 hover:via-blue-500/30 hover:to-teal-500/30 border-2 border-purple-500/40 hover:border-teal-400 text-white px-6 py-3 rounded-xl font-blackops transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-lg">BACK</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`group relative p-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                  isBookmarked 
                    ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400 text-yellow-300 shadow-yellow-500/30' 
                    : 'bg-gray-800/50 hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20 border-gray-600 hover:border-yellow-400 text-gray-300 hover:text-yellow-300'
                }`}
              >
                <Bookmark className={`w-6 h-6 transition-all ${isBookmarked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-mono px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-xl">
                  {isBookmarked ? 'Bookmarked ✓' : 'Bookmark Event'}
                </div>
              </button>
              
              <button className="group relative p-3 rounded-xl font-semibold bg-gray-800/50 hover:bg-gradient-to-r hover:from-green-500/20 hover:to-teal-500/20 border-2 border-gray-600 hover:border-green-400 text-gray-300 hover:text-green-300 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/30">
                <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-mono px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-xl">
                  Share Event
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Banner Image with Gradient Overlay */}
      <div className="mt-4 max-w-7xl mx-auto px-6">
        <div className="relative max-h-full border-2 border-gray-700 rounded-2xl overflow-hidden group">
          {hackathon.image !== "/api/placeholder/400/200" && (
            <>
              <Image
                src={hackathon.image}
                alt={hackathon.title}
                width={1200}
                height={500}
                unoptimized 
                className="object-cover w-full object-top rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-6">
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Enhanced Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 shadow-2xl">
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 animate-puls`}></div>

              <div className="relative z-10 p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="rounded-xl w-24 h-24 flex-shrink-0 overflow-hidden border-2 border-gray-700 shadow-lg hover:scale-105 transition-transform">
                    <Image
                      src={hackathon.image}
                      alt={hackathon.title}
                      width={100}
                      height={100}
                      unoptimized
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 leading-tight flex-1">
                    {hackathon.title}
                  </h1>
                </div>

                {/* Enhanced Organizer Info */}
                <div className="mb-6 space-y-3">
                  <div className="flex gap-2 items-center text-gray-200 font-mono bg-gray-800/50 backdrop-blur rounded-xl px-4 py-3 border border-gray-700 hover:border-gray-600 transition-all w-full">
                    <Building className="w-5 h-5 text-blue-400" />
                    <p className="font-medium">Organized by{" "}
                      {hackathon?.websiteUrl ? (
                        <a 
                          href={hackathon.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:italic font-blackops text-lg text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                        >
                          {hackathon.organizer}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="font-blackops text-lg text-blue-400">{hackathon.organizer}</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 items-center text-gray-200 font-mono bg-gray-800/50 backdrop-blur rounded-xl px-4 py-3 border border-gray-700 hover:border-gray-600 transition-all w-full">
                    <CalendarClock className="w-5 h-5 text-teal-400" />
                    <p className="font-medium">Updated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Enhanced Key Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: Users, value: participantCount || hackathon.participants, label: 'Participants', color: 'from-blue-500 to-blue-700', glow: 'shadow-blue-500/20' },
                    { icon: Trophy, value: hackathon.totalPrizePool, label: 'Prize Pool', color: 'from-yellow-500 to-yellow-700', glow: 'shadow-yellow-500/20' },
                    {
                      icon: Clock,
                      value: calculateTimeLeft(hackathon.startDate, hackathon.endDate).text,
                      label: calculateTimeLeft(hackathon.startDate, hackathon.endDate).label,
                      color: 'from-green-500 to-green-700',
                      glow: 'shadow-green-500/20'
                    },
                    { icon: MapPin, value: hackathon.mode.charAt(0).toUpperCase() + hackathon.mode.slice(1), label: hackathon.location.split(',')[0], color: 'from-purple-500 to-purple-700', glow: 'shadow-purple-500/20' }
                  ].map((stat, idx) => (
                    <div key={idx} className={`bg-gradient-to-br ${stat.color} backdrop-blur border border-white/20 rounded-xl p-3 text-center hover:scale-105 transition-all ${stat.glow} shadow-lg group`}>
                      <stat.icon className="w-5 h-5 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-blackops text-white drop-shadow-lg leading-tight">{stat.value}</div>
                      <div className="text-xs text-white/90 font-mono mt-1 font-bold uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Enhanced Eligibility */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur border-2 border-orange-500/30 rounded-2xl p-6 hover:scale-[1.01] transition-all shadow-lg hover:shadow-orange-500/20">
                  <div className="flex w-fit gap-3 items-center mb-4">
                    <Sparkles className="w-7 h-7 text-orange-400" />
                    <h2 className="font-blackops text-3xl text-white">ELIGIBILITY</h2>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 font-mono">
                    {hackathon.eligibility.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-orange-500/20 border-2 border-orange-500/40 rounded-lg text-orange-300 font-bold text-sm hover:bg-orange-500/30 transition-all"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Requirements */}
            {hackathon.requirements && hackathon.requirements.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 shadow-2xl hover:shadow-green-500/10 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-9 h-9 text-green-400" />
                  <h2 className="text-4xl font-blackops text-white">REQUIREMENTS</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hackathon.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-4 px-5 py-4 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl border-2 border-gray-700/50 hover:border-green-500/30 transition-all group">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-sm font-blackops flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <span className="text-gray-200 font-geist leading-relaxed text-lg">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced About Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 shadow-2xl hover:shadow-blue-500/10 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Info className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-4xl font-blackops text-white">ABOUT THIS HACKATHON</h2>
              </div>
              
              {/* Enhanced Tags */}
              <div className="flex flex-wrap gap-3 mb-6">
                {hackathon.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-5 py-2.5 rounded-xl text-sm font-blackops bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white border-2 border-white/20 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 transition-all cursor-pointer"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
              
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-300 font-geist text-lg leading-relaxed bg-gray-800/30 rounded-xl p-6 border border-gray-700"
                  dangerouslySetInnerHTML={{ __html: hackathon.detailedDescription || hackathon.description }}
                />
              </div>
            </div>

            {/* Enhanced Timeline - keep your existing timeline code but update styling */}
            {hackathon.timeline && hackathon.timeline.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 shadow-2xl hover:shadow-teal-500/10 transition-all">
                <div className="flex items-center gap-3 mb-8">
                  <CalendarClock className="w-9 h-9 text-teal-400" />
                  <h2 className="text-4xl font-blackops text-white">STAGES & TIMELINE</h2>
                </div>

                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-[21%] w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-teal-500 rounded-full"></div>

                  <div className="space-y-8">
                    {hackathon.timeline.map((stage, index) => (
                      <div key={index} className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 font-mono w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-teal-500 rounded-xl flex flex-col items-center justify-center relative z-10 shadow-lg hover:scale-110 transition-transform">
                          <div className="text-xl font-blackops text-white">{new Date(stage.startDate).getDate()}</div>
                          <div className="h-[1px] my-1 w-full bg-teal-400"></div>
                          <div className="text-xs text-teal-400 font-bold">{new Date(stage.startDate).toLocaleString('default', { month: 'short' })}</div>
                        </div>

                        <div className="flex-1 bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-2 border-gray-700/50 rounded-2xl px-6 py-5 hover:border-teal-500/30 transition-all group hover:scale-[1.02]">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between font-mono">
                              <h3 className="text-2xl font-blackops text-white group-hover:text-teal-400 transition-colors">{stage.title}</h3>
                              {stage.isActive && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border-2 border-red-500 font-blackops text-red-400 text-sm rounded-xl animate-">
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                                  LIVE
                                </div>
                              )}
                            </div>

                            <p className="text-gray-300 font-geist text-lg leading-relaxed">{stage.description}</p>

                            {(stage.startDate || stage.endDate) && (
                              <div className="flex flex-wrap gap-6 pt-4 border-t-2 border-gray-600/50">
                                {stage.startDate && (
                                  <div className="font-mono flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <span className="text-gray-400 font-bold">Start:</span>
                                    <span className="text-white font-bold">{new Date(stage.startDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {stage.endDate && (
                                  <div className="font-mono flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-teal-400" />
                                    <span className="text-gray-400 font-bold">End:</span>
                                    <span className="text-white font-bold">{new Date(stage.endDate).toLocaleDateString()}</span>
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
            )}

            {/* Important Dates & Deadlines */}
            {hackathon.importantDates && hackathon.importantDates.length > 0 && (
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
            )}

            {/* Prizes */}
            {hackathon.prizes && hackathon.prizes.length > 0 && (
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
                      
                      {/* Prize content */}
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
                              {prize.position}
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

            {/* Enhanced FAQ Section - Using DB Data */}
            {hackathon.faq && hackathon.faq.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 shadow-2xl hover:shadow-pink-500/10 transition-all">
                <div className="flex items-center gap-3 mb-8">
                  <MessageCircleQuestionIcon className="w-9 h-9 text-pink-400" /> 
                  <h2 className="text-4xl font-blackops text-white">FREQUENTLY ASKED QUESTIONS</h2>
                </div>
                <div className="space-y-4">
                {hackathon.faq.map((faq: { question: string; answer: string }, index: number) => (
                    <div key={index} className="border-2 border-gray-700 rounded-2xl bg-gray-800/30 overflow-hidden hover:border-pink-500/30 transition-all group">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                      >
                        <span className="font-blackops text-white text-xl group-hover:text-pink-400 transition-colors pr-4">{faq.question}</span>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center border-2 border-pink-500/30 group-hover:bg-pink-500/30 transition-all">
                          {expandedFaq === index ? (
                            <ChevronUp className="w-5 h-5 text-pink-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-pink-400" />
                          )}
                        </div>
                      </button>
                      {expandedFaq === index && (
                        <div className="px-6 pb-5 border-t-2 border-gray-700/50 bg-gray-800/50">
                          <p className="text-gray-300 font-geist text-lg leading-relaxed pt-5">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Organizers */}
            {hackathon.organizers && hackathon.organizers.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 shadow-2xl hover:shadow-cyan-500/10 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <IconUserStar className="w-9 h-9 text-cyan-400" /> 
                  <h2 className="text-4xl font-blackops text-white">THE ORGANIZERS</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {hackathon.organizers.map((organizer, index) => (
                    <div key={index} className="px-6 py-5 bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-2 border-gray-700/50 rounded-2xl hover:border-cyan-500/30 transition-all group hover:scale-[1.02]">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-xl flex items-center justify-center font-blackops text-xl border-2 border-cyan-500/30 group-hover:scale-110 transition-transform">
                        {organizer.photo ? (
                          <Image
                            src={organizer.photo}
                            alt={organizer.name}
                            width={64}
                            height={64}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          getInitials(organizer.name)
                        )}
                        </div>

                        <div className="flex-1 font-mono">
                          <h3 className="text-xl font-blackops text-white group-hover:text-cyan-400 transition-colors">{organizer.name}</h3>
                          <p className="text-sm text-cyan-400 font-bold">{organizer.role}</p>
                        </div>
                      </div>

                      <div className="space-y-3 font-mono">
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-all">
                          <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <a
                            href={`mailto:${organizer.email}`}
                            className="text-gray-300 hover:text-cyan-400 transition-colors text-sm truncate"
                          >
                            {organizer.email}
                          </a>
                        </div>

                        {organizer.phone && (
                          <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-all">
                            <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                            <a
                              href={`tel:${organizer.phone}`}
                              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                            >
                              {organizer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Sponsors */}
            {hackathon.sponsors && hackathon.sponsors.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 shadow-2xl hover:shadow-lime-500/10 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <HandCoins className="w-9 h-9 text-lime-400" /> 
                  <h2 className="text-4xl font-blackops text-white">OUR SPONSORS</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {hackathon.sponsors.map((sponsor, index) => (
                    <div
                      key={index}
                      className="py-5 px-4 bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-2 border-gray-700/50 rounded-2xl transition-all hover:border-lime-500/30 hover:scale-105 group"
                    >
                      <div className="space-y-4">
                        <div className="text-center space-y-3">
                          {sponsor.logo ? (
                            <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-gray-700 group-hover:border-lime-500/30 transition-all">
                              <Image
                                src={sponsor.logo}
                                alt={sponsor.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-contain bg-white p-2"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-lime-500/20 to-green-500/20 text-lime-400 rounded-xl flex items-center justify-center font-blackops text-2xl border-2 border-lime-500/30 group-hover:scale-110 transition-transform">
                              {getInitials(sponsor.name)}
                            </div>
                          )}
                          
                          <h3 className="font-blackops text-lg text-white group-hover:text-lime-400 transition-colors">
                            {sponsor.name}
                          </h3>

                        </div>

                        {sponsor.website && (
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-lime-500/30 text-gray-300 hover:text-lime-400 transition-all font-mono text-sm group-hover:scale-105"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Visit Site</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar - Streamlined and Sticky */}
        <div className="order-2 lg:order-2 lg:sticky lg:top-28 lg:self-start lg:w-[350px]">
            <div className="relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-500/20 to-teal-500/20 animate-pulse"></div>
              
              {/* Main container with gradient border */}
              <div className="relative bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 p-[2px] rounded-md">
                <div className="bg-gray-900 rounded-md p-6 space-y-5">
                  
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
                    <Link
                      href={hackathon.status === "Full" ? "#" : `/hackathons/${hackathon.id}/register`}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 relative block text-center ${
                        hackathon.status === "Full"
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600 pointer-events-none"
                          : "bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white hover:scale-105 hover:shadow-2xl shadow-lg border-0"
                      }`}
                    >
                      <span className="relative z-10 font-geist">
                        {hackathon.status === "Full" ? "Registration Closed" : "Register Now"}
                      </span>
                    </Link>
                  </div>

                  {/* Stats Grid - Non-repetitive data */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Teams Registered */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all">
                      <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white font-mono">{teamCount}</div>
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
                      <span className="text-white font-bold font-mono">{participantCount || hackathon.participants}/{hackathon.maxParticipants}</span>
                    </div>

                    {/* Enhanced progress bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-teal-500 transition-all duration-700 relative"
                          style={{ width: `${((participantCount || hackathon.participants) / hackathon.maxParticipants) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-400 font-mono mt-2 font-medium">
                        {Math.round(((participantCount || hackathon.participants) / hackathon.maxParticipants) * 100)}% Full
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