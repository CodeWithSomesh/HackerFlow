'use client'

import { useState } from "react";
import { Search, Filter, MapPin, Calendar, Users, Trophy, Clock, Star, ExternalLink, ChevronRight } from "lucide-react";
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
    colorTheme: "purple"
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
    colorTheme: "teal"
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
    colorTheme: "green"
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
    colorTheme: "pink"
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
    colorTheme: "yellow"
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
    colorTheme: "cyan"
  }
];

const Hackathons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredHackathons = mockHackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMode = selectedMode === "all" || hackathon.mode.toLowerCase() === selectedMode;
    const matchesStatus = selectedStatus === "all" || hackathon.status.toLowerCase().replace(" ", "-") === selectedStatus;
    
    return matchesSearch && matchesMode && matchesStatus;
  });

  const getCardStyles = (theme: string) => {
    const themes = {
      purple: "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200",
      teal: "bg-gradient-to-br from-teal-100 to-teal-50 border-teal-200", 
      green: "bg-gradient-to-br from-green-100 to-green-50 border-green-200",
      pink: "bg-gradient-to-br from-pink-100 to-pink-50 border-pink-200",
      yellow: "bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200",
      cyan: "bg-gradient-to-br from-cyan-100 to-cyan-50 border-cyan-200"
    };
    return themes[theme] || themes.purple;
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Open": 
        return "bg-emerald-500 text-white";
      case "Closing Soon": 
        return "bg-red-500 text-white animate-pulse";
      case "Full": 
        return "bg-gray-500 text-white";
      default: 
        return "bg-gray-500 text-white";
    }
  };

  const getModeConfig = (mode: string) => {
    switch (mode) {
      case "Online": return { icon: "🌐", color: "bg-blue-100 text-blue-800" };
      case "Physical": return { icon: "🏢", color: "bg-purple-100 text-purple-800" };
      case "Hybrid": return { icon: "🔄", color: "bg-orange-100 text-orange-800" };
      default: return { icon: "📍", color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-3">
              Discover Hackathons
            </h1>
            <p className="text-gray-400 text-lg">Find and join amazing hackathons across Malaysia and beyond</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hackathons, organizers, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex gap-3">
              <select 
                value={selectedMode} 
                onChange={(e) => setSelectedMode(e.target.value)}
                className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Modes</option>
                <option value="online">Online</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </select>
              
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closing-soon">Closing Soon</option>
                <option value="full">Full</option>
              </select>
              
              <button className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 hover:bg-gray-800/50 transition-all duration-200">
                <Filter className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hackathon Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => {
            const modeConfig = getModeConfig(hackathon.mode);
            
            return (
              <div 
                key={hackathon.id} 
                className={`group relative overflow-hidden rounded-2xl border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${getCardStyles(hackathon.colorTheme)}`}
              >
                {/* Header Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                  {/* <div className="text-4xl opacity-40">🚀</div> */}

                  <Image
                    src={hackathon.image}
                    alt="Hackathon banner"
                    width={600}
                    height={300}
                    />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyles(hackathon.status)}`}>
                      {hackathon.status}
                    </div>
                  </div>
                  
                  {/* Featured Badge */}
                  {hackathon.featured && (
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                        <Star className="h-3 w-3" />
                        Featured
                      </div>
                    </div>
                  )}
                  
                  {/* Mode Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${modeConfig.color}`}>
                      <span>{modeConfig.icon}</span>
                      {hackathon.mode}
                    </div>
                  </div>
                  
                  {/* Participants Count */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/20 text-white px-2 py-1 rounded-full text-xs">
                    <Users className="h-3 w-3" />
                    {hackathon.participants}
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-5 text-gray-900">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                      {hackathon.title}
                    </h2>
                    <p className="text-xs text-gray-600 mb-2">by {hackathon.organizer}</p>
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                      {hackathon.description}
                    </p>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2 mb-4 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span>{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-green-600" />
                      <span>{hackathon.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-orange-600" />
                      <span>{hackathon.timeLeft}</span>
                    </div>
                  </div>
                  
                  {/* Prize */}
                  <div className="flex items-center gap-2 mb-4 p-2 bg-white/50 rounded-lg">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="font-bold text-gray-900">{hackathon.prize}</span>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {hackathon.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-300 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(hackathon.participants / hackathon.maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {Math.round((hackathon.participants / hackathon.maxParticipants) * 100)}% filled
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200">
                      <ExternalLink className="h-3 w-3" />
                      Details
                    </button>
                    <button 
                      disabled={hackathon.status === "Full"}
                      className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        hackathon.status === "Full" 
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      }`}
                    >
                      {hackathon.status === "Full" ? "Full" : "Join"}
                      {hackathon.status !== "Full" && <ChevronRight className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredHackathons.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 opacity-30">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-4">No hackathons found</h3>
            <p className="text-gray-400 text-lg">Try adjusting your search terms or filters to discover more events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hackathons;