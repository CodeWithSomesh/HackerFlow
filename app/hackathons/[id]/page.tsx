'use client'

import { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Heart, 
    Bookmark, 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    Trophy, 
    Mail, 
    ExternalLink, 
    Eye,
    User,
    Globe,
    Star,
    ChevronDown,
    Share2,
    CheckCircle,
    AlertCircle,
    Info,
    ChevronUp,
    BadgeInfo,
    Building2,
    Building,
    CalendarClock
} from "lucide-react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import hackathonPicture1 from '@/assets/hackathonPic1.webp';
import hackathonPicture2 from '@/assets/hackathonPic2.webp';
import hackathonPicture3 from '@/assets/hackathonPic3.webp';
import hackathonPicture4 from '@/assets/hackathonPic4.webp';
import hackathonPicture5 from '@/assets/hackathonPic5.webp';
import hackathonPicture6 from '@/assets/hackathonPic6.webp';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  organizer: string;
  startDate: string;
  endDate: string;
  location: string;
  mode: "Online" | "Hybrid" | "Physical";
  participants: number;
  maxParticipants: number;
  prize: string;
  tags: string[];
  image: string | StaticImageData;
  status: "Open" | "Closing Soon" | "Full";
  timeLeft: string;
  featured?: boolean;
  colorTheme: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  prizeValue: number;
  detailedDescription?: string;
  requirements?: string[];
  judgesCriteria?: string[];
  timeline?: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  prizes?: Array<{
    position: string;
    amount: string;
    benefits?: string[];
  }>;
  sponsors?: string[];
  contacts?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

const mockHackathons: Hackathon[] = [
  {
    id: "1",
    title: "Genesis Season One Hackathon 2025",
    description: "Submit your web3 project, graduate, and compete for 1M $TKAI plus Pro Plans from Cursor, Vercel, and more.",
    detailedDescription: "Genesis Season One is the ultimate Web3 hackathon experience designed for builders who want to push the boundaries of decentralized technology. Over the course of one month, participants will have access to cutting-edge tools, mentorship from industry experts, and the opportunity to compete for substantial prizes.\n\nThis hackathon focuses on real-world applications of blockchain technology, DeFi protocols, and innovative Web3 solutions. Whether you're building the next DeFi protocol, creating NFT marketplaces, or developing cross-chain applications, Genesis Season One provides the perfect platform to showcase your skills.\n\nParticipants will receive exclusive access to premium development tools including Cursor Pro, Vercel Pro plans, and direct mentorship from Genesis DAO core contributors. The judging process emphasizes innovation, technical excellence, and real-world applicability.",
    organizer: "Genesis DAO",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    location: "Kuala Lumpur, Malaysia",
    mode: "Hybrid",
    participants: 1250,
    maxParticipants: 2000,
    prize: "1,000,000 $TKAI",
    tags: ["Blockchain", "Web3", "DeFi", "Smart Contracts"],
    image: hackathonPicture1,
    status: "Open",
    timeLeft: "28 days left",
    featured: true,
    colorTheme: "purple",
    category: "Blockchain",
    level: "Advanced",
    prizeValue: 1000000,
    requirements: [
      "Must be 18+ years old",
      "Team of 2-4 members",
      "Open source project submission",
      "Must use blockchain technology",
      "Original work only"
    ],
    judgesCriteria: [
      "Innovation and Creativity (30%)",
      "Technical Implementation (25%)",
      "User Experience & Design (20%)",
      "Business Viability (15%)",
      "Code Quality & Documentation (10%)"
    ],
    timeline: [
      {
        date: "Jan 15",
        title: "Registration Opens",
        description: "Registration period begins. Team formation and idea submission."
      },
      {
        date: "Jan 20",
        title: "Kickoff Event",
        description: "Official launch with workshops, mentorship sessions, and networking."
      },
      {
        date: "Feb 10",
        title: "Submission Deadline",
        description: "Final project submissions due. No extensions allowed."
      },
      {
        date: "Feb 15",
        title: "Final Judging & Awards",
        description: "Pitch presentations, judging, and award ceremony."
      }
    ],
    prizes: [
      {
        position: "1st Place",
        amount: "500,000 $TKAI",
        benefits: ["Cursor Pro Plan (1 year)", "Vercel Pro Plan (1 year)", "Direct mentorship"]
      },
      {
        position: "2nd Place", 
        amount: "300,000 $TKAI",
        benefits: ["Cursor Pro Plan (6 months)", "Vercel Pro Plan (6 months)"]
      },
      {
        position: "3rd Place",
        amount: "200,000 $TKAI",
        benefits: ["Cursor Pro Plan (3 months)", "Vercel Pro Plan (3 months)"]
      }
    ],
    sponsors: ["Genesis DAO", "Cursor", "Vercel", "Ethereum Foundation"],
    contacts: [
      {
        name: "Alex Chen",
        email: "alex@genesisdao.org",
        role: "Lead Organizer"
      },
      {
        name: "Sarah Kim",
        email: "sarah@genesisdao.org", 
        role: "Technical Coordinator"
      }
    ]
  },
  {
    id: "2",
    title: "Hyperliquid Community Hackathon",
    description: "Building on the blockchain to house all of finance. Create innovative solutions for decentralized finance.",
    detailedDescription: "The Hyperliquid Community Hackathon is a intensive 3-day event focused on building the future of decentralized finance. Participants will work with Hyperliquid's cutting-edge infrastructure to create innovative DeFi solutions.\n\nThis hackathon emphasizes high-performance trading systems, liquidity protocols, and user-friendly DeFi interfaces. Teams will have access to Hyperliquid's APIs, extensive documentation, and direct support from the core development team.\n\nWith a focus on real-world trading applications, participants are encouraged to build solutions that can handle institutional-grade volume and complexity while maintaining the decentralized principles that make DeFi revolutionary.",
    organizer: "Hyperliquid Labs",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    location: "Penang, Malaysia",
    mode: "Physical",
    participants: 484,
    maxParticipants: 500,
    prize: "250,000 USDT",
    tags: ["Blockchain", "DeFi", "Trading", "Liquidity"],
    image: hackathonPicture2,
    status: "Closing Soon",
    timeLeft: "12 hours left",
    colorTheme: "teal",
    category: "FinTech",
    level: "Intermediate",
    prizeValue: 250000,
    requirements: [
      "Experience with DeFi protocols",
      "Team of 1-5 members",
      "Must integrate with Hyperliquid",
      "Live demo required"
    ],
    judgesCriteria: [
      "Technical Excellence (35%)",
      "Innovation (25%)",
      "User Experience (20%)",
      "Integration Quality (20%)"
    ],
    timeline: [
      {
        date: "Jan 20",
        title: "Opening Ceremony",
        description: "Welcome, team formation, and technical briefings."
      },
      {
        date: "Jan 21",
        title: "Development Day",
        description: "Full day of coding with mentor support and workshops."
      },
      {
        date: "Jan 22",
        title: "Demo Day",
        description: "Project presentations and judging."
      }
    ],
    prizes: [
      {
        position: "1st Place",
        amount: "150,000 USDT"
      },
      {
        position: "2nd Place",
        amount: "70,000 USDT"
      },
      {
        position: "3rd Place",
        amount: "30,000 USDT"
      }
    ],
    sponsors: ["Hyperliquid Labs", "Binance Labs"],
    contacts: [
      {
        name: "David Liu",
        email: "david@hyperliquid.xyz",
        role: "Event Coordinator"
      }
    ]
  },
  {
    id: "3",
    title: "CopernicusLAC Panama Hackathon 2025",
    description: "Resolución de problemas en ALC sobre reducción del riesgo de desastres con datos de Copernicus.",
    detailedDescription: "Join the CopernicusLAC Panama Hackathon 2025, where technology meets environmental science to address critical disaster risk reduction challenges in Latin America and the Caribbean.\n\nThis unique hackathon leverages Copernicus satellite data and Earth observation technologies to create innovative solutions for natural disaster prevention, monitoring, and response. Participants will work with real satellite imagery, climate data, and advanced analytics tools.\n\nThe event brings together developers, data scientists, environmental experts, and policy makers to create practical solutions that can be implemented across the LAC region. All skill levels are welcome, with extensive mentorship and technical support provided.",
    organizer: "ESA & Copernicus",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    location: "Selangor, Malaysia",
    mode: "Online",
    participants: 314,
    maxParticipants: 1000,
    prize: "8,000 EUR",
    tags: ["Space Tech", "Agriculture", "Sustainability", "Climate"],
    image: hackathonPicture3,
    status: "Open",
    timeLeft: "45 days left",
    colorTheme: "green",
    category: "Space & Science",
    level: "Beginner",
    prizeValue: 8000,
    requirements: [
      "Open to all skill levels",
      "Teams of 2-6 members",
      "Focus on LAC region challenges",
      "Must use Copernicus data"
    ],
    timeline: [
      {
        date: "Feb 1",
        title: "Virtual Kickoff",
        description: "Introduction to Copernicus data and challenge briefing."
      },
      {
        date: "Feb 2-4",
        title: "Development Phase",
        description: "Team coding with daily check-ins and mentor sessions."
      },
      {
        date: "Feb 5",
        title: "Final Presentations",
        description: "Project demos and expert panel judging."
      }
    ],
    prizes: [
      {
        position: "1st Place",
        amount: "4,000 EUR",
        benefits: ["ESA incubation program invitation"]
      },
      {
        position: "2nd Place",
        amount: "2,500 EUR"
      },
      {
        position: "3rd Place",
        amount: "1,500 EUR"
      }
    ],
    sponsors: ["European Space Agency", "Copernicus Programme"],
    contacts: [
      {
        name: "Maria Rodriguez",
        email: "maria@esa.int",
        role: "Program Manager"
      }
    ]
  }
];

interface HackathonDetailsProps {
  params: {
    id: string;
  };
}

export default function HackathonDetails({ params }: HackathonDetailsProps) {
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
    const foundHackathon = mockHackathons.find(h => h.id === params.id);
    setHackathon(foundHackathon || null);
    setLoading(false);
  }, [params.id]);

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
        <div className="grid lg:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-4 text-center hover:bg-black/60 transition-all">
                    <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{hackathon.participants}</div>
                    <div className="text-sm text-gray-300">Participants</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-4 text-center hover:bg-black/60 transition-all">
                    <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{hackathon.prize.split(' ')[0]}</div>
                    <div className="text-sm text-gray-300">Prize Pool</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-4 text-center hover:bg-black/60 transition-all">
                    <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{hackathon.timeLeft.split(' ')[0]}</div>
                    <div className="text-sm text-gray-300">Days Left</div>
                  </div>
                  <div className="bg-gray-800 hover:scale-75 backdrop-blur border border-white/10 rounded-2xl p-4 text-center hover:bg-black/60 transition-all">
                    <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">{hackathon.mode}</div>
                    <div className="text-sm text-gray-300">{hackathon.location.split(',')[0]}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
               <Info className={`h-9 w-9 ${theme.gradient} rounded-full`} />
                About This Hackathon
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                  {hackathon.detailedDescription || hackathon.description}
                </p>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-3 mt-8">
                {hackathon.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white border border-gray-300 hover:scale-90 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements & Timeline - Side by side on larger screens */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Requirements */}
              {hackathon.requirements && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <CheckCircle className="w-7 h-7 text-green-400" />
                    Requirements
                  </h2>
                  <div className="space-y-4">
                    {hackathon.requirements.map((req, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-300 leading-relaxed">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {hackathon.timeline && (
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
              )}
            </div>

            {/* Prizes */}
            {hackathon.prizes && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 p-8">
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
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-md border border-gray-700 p-8">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${theme.gradient}`}></div>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="border border-gray-700 rounded-2xl bg-gray-800/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/20 transition-colors"
                    >
                      <span className="font-semibold text-white text-lg">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4 border-t border-gray-700/50">
                        <p className="text-gray-300 leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
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