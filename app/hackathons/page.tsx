'use client'

import { useState } from "react";
import { Search, Filter, MapPin, Calendar, Users, Trophy, Clock, Star, ExternalLink, ChevronRight } from "lucide-react";
import hackathonPicture1 from '@/assets/hackathonPic1.webp';
import hackathonPicture2 from '@/assets/hackathonPic2.webp';
import hackathonPicture3 from '@/assets/hackathonPic3.webp';
import hackathonPicture4 from '@/assets/hackathonPic4.webp';
import hackathonPicture5 from '@/assets/hackathonPic5.webp';
import hackathonPicture6 from '@/assets/hackathonPic6.webp';
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

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
}

const mockHackathons: Hackathon[] = [
  {
    id: "1",
    title: "Genesis Season One",
    description: "Submit your web3 project, graduate, and compete for 1M $TKAI plus Pro Plans from Cursor, Vercel, and more.",
    organizer: "Genesis DAO",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    location: "Kuala Lumpur, Malaysia",
    mode: "Hybrid",
    participants: 1250,
    maxParticipants: 2000,
    prize: "1,000,000 $TKAI",
    tags: ["Blockchain", "Web3", "DeFi"],
    image: hackathonPicture1,
    status: "Open",
    timeLeft: "28 days left",
    featured: true,
    colorTheme: "purple",
    category: "Blockchain",
    level: "Advanced",
    prizeValue: 1000000
  },
  {
    id: "2",
    title: "Hyperliquid Community Hackathon",
    description: "Building on the blockchain to house all of finance. Create innovative solutions for decentralized finance.",
    organizer: "Hyperliquid Labs",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    location: "Penang, Malaysia",
    mode: "Physical",
    participants: 484,
    maxParticipants: 500,
    prize: "250,000 USDT",
    tags: ["Blockchain", "DeFi", "Trading"],
    image: hackathonPicture2,
    status: "Closing Soon",
    timeLeft: "12 hours left",
    colorTheme: "teal",
    category: "FinTech",
    level: "Intermediate",
    prizeValue: 250000
  },
  {
    id: "3",
    title: "CopernicusLAC Panama Hackathon 2025",
    description: "Resolución de problemas en ALC sobre reducción del riesgo de desastres con datos de Copernicus.",
    organizer: "ESA & Copernicus",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    location: "Selangor, Malaysia",
    mode: "Online",
    participants: 314,
    maxParticipants: 1000,
    prize: "8,000 EUR",
    tags: ["Space Tech", "Agriculture", "Sustainability"],
    image: hackathonPicture3,
    status: "Open",
    timeLeft: "45 days left",
    colorTheme: "green",
    category: "Space & Science",
    level: "Beginner",
    prizeValue: 8000
  },
  {
    id: "4",
    title: "FinTech Innovation Challenge",
    description: "Revolutionize financial services with cutting-edge technology solutions. Build the future of digital banking.",
    organizer: "Maybank & CIMB",
    startDate: "2024-01-25",
    endDate: "2024-01-28",
    location: "Cyberjaya, Malaysia",
    mode: "Hybrid",
    participants: 892,
    maxParticipants: 1500,
    prize: "150,000 MYR",
    tags: ["FinTech", "AI", "Mobile"],
    image: hackathonPicture4,
    status: "Open",
    timeLeft: "18 days left",
    colorTheme: "pink",
    category: "FinTech",
    level: "Intermediate",
    prizeValue: 150000
  },
  {
    id: "5",
    title: "ETHRome 2025",
    description: "The hackathon for builders by builders. Rome, 17-19 October. Privacy, AI and DeFi tracks.",
    organizer: "ETH Rome",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    location: "Rome, Italy",
    mode: "Physical",
    participants: 320,
    maxParticipants: 400,
    prize: "50,000 EUR",
    tags: ["Blockchain", "Privacy", "DeFi"],
    image: hackathonPicture5,
    status: "Open",
    timeLeft: "52 days left",
    colorTheme: "yellow",
    category: "Blockchain",
    level: "Advanced",
    prizeValue: 50000
  },
  {
    id: "6",
    title: "ETHAccra Hackathon 2025",
    description: "ETHAccra fosters innovation and collaboration through events, workshops, strong community.",
    organizer: "ETH Accra",
    startDate: "2024-02-15",
    endDate: "2024-02-18",
    location: "Accra, Ghana",
    mode: "Hybrid",
    participants: 220,
    maxParticipants: 300,
    prize: "25,000 USD",
    tags: ["Blockchain", "AI", "Cloud Gaming"],
    image: hackathonPicture6,
    status: "Open",
    timeLeft: "60 days left",
    colorTheme: "cyan",
    category: "Gaming",
    level: "Beginner",
    prizeValue: 25000
  },
  {
    id: "7",
    title: "Genesis Season One",
    description: "Submit your web3 project, graduate, and compete for 1M $TKAI plus Pro Plans from Cursor, Vercel, and more.",
    organizer: "Genesis DAO",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    location: "Kuala Lumpur, Malaysia",
    mode: "Hybrid",
    participants: 1250,
    maxParticipants: 2000,
    prize: "1,000,000 $TKAI",
    tags: ["Blockchain", "Web3", "DeFi"],
    image: "/api/placeholder/400/200",
    status: "Open",
    timeLeft: "28 days left",
    featured: true,
    colorTheme: "purple",
    category: "Blockchain",
    level: "Advanced",
    prizeValue: 1000000
  },
  {
    id: "8",
    title: "Hyperliquid Community Hackathon",
    description: "Building on the blockchain to house all of finance. Create innovative solutions for decentralized finance.",
    organizer: "Hyperliquid Labs",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    location: "Penang, Malaysia",
    mode: "Physical",
    participants: 484,
    maxParticipants: 500,
    prize: "250,000 USDT",
    tags: ["Blockchain", "DeFi", "Trading"],
    image: "/api/placeholder/400/200",
    status: "Closing Soon",
    timeLeft: "12 hours left",
    colorTheme: "teal",
    category: "FinTech",
    level: "Intermediate",
    prizeValue: 250000
  },
  {
    id: "9",
    title: "CopernicusLAC Panama Hackathon 2025",
    description: "Resolución de problemas en ALC sobre reducción del riesgo de desastres con datos de Copernicus.",
    organizer: "ESA & Copernicus",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    location: "Selangor, Malaysia",
    mode: "Online",
    participants: 314,
    maxParticipants: 1000,
    prize: "8,000 EUR",
    tags: ["Space Tech", "Agriculture", "Sustainability"],
    image: "/api/placeholder/400/200",
    status: "Open",
    timeLeft: "45 days left",
    colorTheme: "green",
    category: "Space & Science",
    level: "Beginner",
    prizeValue: 8000
  },
  {
    id: "10",
    title: "FinTech Innovation Challenge",
    description: "Revolutionize financial services with cutting-edge technology solutions. Build the future of digital banking.",
    organizer: "Maybank & CIMB",
    startDate: "2024-01-25",
    endDate: "2024-01-28",
    location: "Cyberjaya, Malaysia",
    mode: "Hybrid",
    participants: 892,
    maxParticipants: 1500,
    prize: "150,000 MYR",
    tags: ["FinTech", "AI", "Mobile"],
    image: "/api/placeholder/400/200",
    status: "Open",
    timeLeft: "18 days left",
    colorTheme: "pink",
    category: "FinTech",
    level: "Intermediate",
    prizeValue: 150000
  },
  {
    id: "11",
    title: "ETHRome 2025",
    description: "The hackathon for builders by builders. Rome, 17-19 October. Privacy, AI and DeFi tracks.",
    organizer: "ETH Rome",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    location: "Rome, Italy",
    mode: "Physical",
    participants: 320,
    maxParticipants: 400,
    prize: "50,000 EUR",
    tags: ["Blockchain", "Privacy", "DeFi"],
    image: "/api/placeholder/400/200",
    status: "Open",
    timeLeft: "52 days left",
    colorTheme: "yellow",
    category: "Blockchain",
    level: "Advanced",
    prizeValue: 50000
  },
  {
    id: "12",
    title: "ETHAccra Hackathon 2025",
    description: "ETHAccra fosters innovation and collaboration through events, workshops, strong community.",
    organizer: "ETH Accra",
    startDate: "2024-02-15",
    endDate: "2024-02-18",
    location: "Accra, Ghana",
    mode: "Hybrid",
    participants: 220,
    maxParticipants: 300,
    prize: "25,000 USD",
    tags: ["Blockchain", "AI", "Cloud Gaming"],
    image: "/api/placeholder/400/200",
    status: "Open",
    timeLeft: "60 days left",
    colorTheme: "cyan",
    category: "Gaming",
    level: "Beginner",
    prizeValue: 25000
  }
];

const Hackathons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [prizeRange, setPrizeRange] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredHackathons = mockHackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMode = selectedMode === "all" || hackathon.mode.toLowerCase() === selectedMode;
    const matchesStatus = selectedStatus === "all" || hackathon.status.toLowerCase().replace(" ", "-") === selectedStatus;
    const matchesCategory = selectedCategory === "all" || hackathon.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || hackathon.level === selectedLevel;
    
    let matchesPrize = true;
    if (prizeRange === "free") matchesPrize = hackathon.prizeValue === 0;
    else if (prizeRange === "1k-10k") matchesPrize = hackathon.prizeValue >= 1000 && hackathon.prizeValue <= 10000;
    else if (prizeRange === "10k-100k") matchesPrize = hackathon.prizeValue >= 10000 && hackathon.prizeValue <= 100000;
    else if (prizeRange === "100k+") matchesPrize = hackathon.prizeValue > 100000;
    
    return matchesSearch && matchesMode && matchesStatus && matchesCategory && matchesLevel && matchesPrize;
  });

  const getCardTheme = (theme: string) => {
    const themes = {
      purple: {
        gradient: "bg-gradient-to-br from-purple-300 to-purple-600",
        border: "border-purple-400",
        text: "text-purple-400"
      },
      teal: {
        gradient: "bg-gradient-to-br from-teal-300 to-teal-600",
        border: "border-teal-400", 
        text: "text-teal-400"
      },
      pink: {
        gradient: "bg-gradient-to-br from-pink-300 to-pink-600",
        border: "border-pink-400",
        text: "text-pink-400"
      },
      green: {
        gradient: "bg-gradient-to-br from-green-300 to-green-600",
        border: "border-green-400",
        text: "text-green-400"
      },
      yellow: {
        gradient: "bg-gradient-to-br from-yellow-300 to-yellow-600",
        border: "border-yellow-400",
        text: "text-yellow-400"
      },
      cyan: {
        gradient: "bg-gradient-to-br from-cyan-300 to-cyan-600",
        border: "border-cyan-400",
        text: "text-cyan-400"
      }
    }as const;
    type ThemeKey = keyof typeof themes;

    return themes[(theme as ThemeKey)] || themes.purple;
  };

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

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "Online": return "🌐";
      case "Physical": return "🏢";
      case "Hybrid": return "🔄";
      default: return "📍";
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedMode("all");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setPrizeRange("all");
  };

  return (
    <div className="min-h-screen bg-black mt-4" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-400 to-yellow-400 shadow-lg borde border-gray-00">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-2">
          <div className="mb-4">
            <h1 className="text-4xl font-bold font-blackops text-white -2">
              Discover Hackathons
            </h1>
            <p className="text-xl text-white">
              Join the most exciting coding events around the world
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select 
                value={selectedMode} 
                onChange={(e) => setSelectedMode(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Modes</option>
                <option value="online">Online</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </select>
              
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closing-soon">Closing Soon</option>
                <option value="full">Full</option>
              </select>
              
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Advanced Filters</h3>
                <button 
                  onClick={clearAllFilters}
                  className="bg-red-600 hover:bg-red-700 border border-red-500 px-4 py-2 text-white text-sm rounded-lg font-medium transition-all duration-200"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium text-sm mb-2">Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="FinTech">FinTech</option>
                    <option value="Space & Science">Space & Science</option>
                    <option value="Gaming">Gaming</option>
                    <option value="AI/ML">AI/ML</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-medium text-sm mb-2">Level</label>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-medium text-sm mb-2">Prize Range</label>
                  <select 
                    value={prizeRange} 
                    onChange={(e) => setPrizeRange(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Prizes</option>
                    <option value="free">Free</option>
                    <option value="1k-10k">$1K - $10K</option>
                    <option value="10k-100k">$10K - $100K</option>
                    <option value="100k+">$100K+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-medium text-sm mb-2">Sort By</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Registration Deadline</option>
                    <option>Prize Amount</option>
                    <option>Participants Count</option>
                    <option>Recently Added</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => {
              const theme = getCardTheme(hackathon.colorTheme);
              
              return (
                <Link 
                  key={hackathon.id} href={`/hackathons/${hackathon.id}`}
                  className="bg-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-400 hover:scale-105 h-fit"
                >
                  {/* Header with gradient background */}
                  <div className={`relative h-56 ${theme.gradient} flex items-center justify-center overflow-hidden`}>
                    {hackathon.image === "/api/placeholder/400/200" ? <div className="text-6xl opacity-80">🚀</div> 
                    : 
                    <Image
                      src={hackathon.image}
                      alt="Hackathon banner"
                      width={600}
                      title="Hackathon Image"
                      height={500}
                      />
                    }
                    
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                    </div>
                    
                    {/* Featured Badge */}
                    {hackathon.featured && (
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                          <Star className="h-4 w-4" />
                          Featured
                        </div>
                      </div>
                    )}
                    
                    {/* Mode Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${theme.text} bg-black border border-white`}>
                        <span>{getModeIcon(hackathon.mode)}</span>
                        {hackathon.mode}
                      </div>
                    </div>
                    
                    {/* Participants Count */}
                    <div className="absolute bottom-4 right-4">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${theme.text} bg-black border border-white`}> 
                        <Users className="h-4 w-4" />
                        {hackathon.participants}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                        {hackathon.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-400 mb-3">
                        by {hackathon.organizer}
                      </p>
                      {/* <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                        {hackathon.description}
                      </p> */}
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <MapPin className="h-4 w-4 text-green-400" />
                        <span>{hackathon.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <span>{hackathon.timeLeft}</span>
                      </div>
                    </div>
                    
                    {/* Prize */}
                    <div className={`flex items-center justify-center gap-3 mb-4 p-3 bg-yellow-400/10 border-2 border-yellow-500 shadow-xl transition-all hover:animate-pulse hover:shadow-yellow-400 rounded-lg`}>
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <span className="font-bold text-lg text-yellow-400">{hackathon.prize}</span>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hackathon.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium border border-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Participants</span>
                        <span>{hackathon.participants}/{hackathon.maxParticipants}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${theme.gradient}`}
                          style={{ width: `${(hackathon.participants / hackathon.maxParticipants) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 border border-gray-700">
                        <ExternalLink className="h-4 w-4" />
                        Details
                      </button>
                      <button 
                        disabled={hackathon.status === "Full"}
                        className={`flex-1 inline-flex items-center font-bold justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          hackathon.status === "Full" 
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600" 
                            : `${theme.gradient} hover:bg-white hover:text-black text-white hover:italic`
                        }`}
                      >
                        {hackathon.status === "Full" ? "Full" : "Join Now"}
                        {hackathon.status !== "Full" && <ChevronRight className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
        
        {filteredHackathons.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No hackathons found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hackathons;