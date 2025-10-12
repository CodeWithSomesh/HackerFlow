'use client'

import { useEffect, useState } from "react";
import { Search, Filter, MapPin, Calendar, Users, Trophy, Clock, Star, ExternalLink, ChevronRight, Globe, Building, X } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { mockHackathons, Hackathon } from "@/lib/mockHackathons2";
import { fetchPublishedHackathons } from "@/lib/actions/createHackathon-actions";



const Hackathons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [prizeRange, setPrizeRange] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dbHackathons, setDbHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    setIsLoading(true);
    try {
      const result = await fetchPublishedHackathons();
      
      if (result.success && result.data) {
        // Transform DB data to match our interface
        const transformedData: Hackathon[] = result.data.map((hack: any, index:number) => ({
          id: hack.id,
          title: hack.title,
          description: hack.about || 'No description available',
          organizer: hack.organization,
          startDate: hack.registration_start_date,
          endDate: hack.registration_end_date,
          location: hack.location || 'Online',
          mode: hack.mode as "online" | "hybrid" | "offline",
          participants: hack.participants || 0,
          maxParticipants: hack.max_participants || 1000,
          prize: hack.total_prize_pool || '$0',
          tags: hack.categories || [],
          image: hack.banner_url || '/api/placeholder/400/200',
          status: calculateStatus(hack),
          timeLeft: calculateTimeLeft(hack.registration_end_date),
          featured: false,
          colorTheme: getRandomTheme(index),
          category: hack.categories?.[0] || 'General',
          level: hack.eligibility?.includes('Professionals') ? 'Advanced' : 
                 hack.eligibility?.includes('Students') ? 'Intermediate' : 'Beginner',
          prizeValue: parsePrizeValue(hack.total_prize_pool)
        }));

        setDbHackathons(transformedData);
      } else {
        console.error('Failed to fetch hackathons:', result.error);
      }
    } catch (error) {
      console.error('Error loading hackathons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStatus = (hack: any): "Open" | "Closing Soon" | "Full" => {
    const now = new Date();
    const endDate = new Date(hack.registration_end_date);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const currentParticipants = hack.participants || 0;
    const maxParticipants = hack.max_participants || 1000;
    
    if (currentParticipants >= maxParticipants) return "Full";
    if (daysLeft <= 3 && daysLeft > 0) return "Closing Soon";
    if (daysLeft < 0) return "Full"; // Treat past deadline as full
    return "Open";
  };

  const calculateTimeLeft = (endDate: string): string => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return "Ended";
    if (daysLeft === 0) return "Ends today";
    if (daysLeft === 1) return "1 day left";
    if (daysLeft < 7) return `${daysLeft} days left`;
    if (daysLeft < 30) return `${Math.ceil(daysLeft / 7)} weeks left`;
    return `${Math.ceil(daysLeft / 30)} months left`;
  };

  const getRandomTheme = (index: number) => {
    const themes = ['purple', 'cyan', 'teal', 'green', 'yellow', 'pink'];
    return themes[index % themes.length];
  };

  const parsePrizeValue = (prizeStr: string): number => {
    if (!prizeStr) return 0;
    // Remove currency symbols and extract numbers
    const numStr = prizeStr.replace(/[^0-9,]/g, '').replace(/,/g, '');
    return parseInt(numStr) || 0;
  };

  const allHackathons = [...dbHackathons, ...mockHackathons];

  const filteredHackathons = allHackathons.filter(hackathon => {
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
        gradient: "from-purple-500 to-purple-700",
        border: "border-purple-500/50",
        text: "text-purple-400",
        glow: "shadow-purple-500/20"
      },
      teal: {
        gradient: "from-teal-500 to-teal-700",
        border: "border-teal-500/50", 
        text: "text-teal-400",
        glow: "shadow-teal-500/20"
      },
      pink: {
        gradient: "from-pink-500 to-pink-700",
        border: "border-pink-500/50",
        text: "text-pink-400",
        glow: "shadow-pink-500/20"
      },
      green: {
        gradient: "from-green-500 to-green-700",
        border: "border-green-500/50",
        text: "text-green-400",
        glow: "shadow-green-500/20"
      },
      yellow: {
        gradient: "from-yellow-500 to-yellow-700",
        border: "border-yellow-500/50",
        text: "text-yellow-400",
        glow: "shadow-yellow-500/20"
      },
      cyan: {
        gradient: "from-cyan-500 to-cyan-700",
        border: "border-cyan-500/50",
        text: "text-cyan-400",
        glow: "shadow-cyan-500/20"
      }
    } as const;
    type ThemeKey = keyof typeof themes;
    return themes[(theme as ThemeKey)] || themes.purple;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": 
        return "bg-green-500 border-white text-white";
      case "Closing Soon": 
        return "bg-red-500 border--white text-white animate-pulse";
      case "Full": 
        return "bg-gray-500 border--white text-white";
      default: 
        return "bg-gray-500 border--white text-white";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "online": return <Globe className="w-4 h-4" />;
      case "offline": return <Building className="w-4 h-4" />;
      case "hybrid": return <div className="flex items-center"><Globe className="w-3 h-3" /><Building className="w-3 h-3" /></div>;
      default: return <MapPin className="w-4 h-4" />;
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

  const activeFiltersCount = [selectedMode, selectedStatus, selectedCategory, selectedLevel, prizeRange].filter(f => f !== "all").length;

  return (
    <div className="min-h-screen bg-black mt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-5xl font-blackops text-white drop-shadow-lg">
            Discover Hackathons
          </h1>
          <p className="text-xl text-white/90 font-mono mb-4">
            Join the most exciting coding events around the world 🚀
          </p>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, tags, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-xl pl-6 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all font-mono"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={selectedMode} 
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            >
              <option value="all">All Modes</option>
              <option value="online">🌐 Online</option>
              <option value="offline">🏢 Physical</option>
              <option value="hybrid">🔄 Hybrid</option>
            </select>
            
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            >
              <option value="all">All Status</option>
              <option value="open">✅ Open</option>
              <option value="closing-soon">⚡ Closing Soon</option>
              <option value="full">🔒 Full</option>
            </select>
            
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-lg transition-all font-mono font-bold text-sm flex items-center gap-2 border-2 border-teal-400 shadow-lg hover:shadow-teal-400/50"
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="bg-red-600/80 hover:bg-red-500 border-2 border-red-400 text-white px-4 py-2.5 rounded-lg font-mono font-bold text-sm transition-all flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-gray-900/95 backdrop-blur border-2 mt-2 border-gray-700 rounded-xl p-6 shadow-2xl animate-in slide-in-from-top duration-300">
              <h3 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal-400" />
                Advanced Filters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-300 font-mono font-semibold text-sm mb-2">Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
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
                  <label className="block text-gray-300 font-mono font-semibold text-sm mb-2">Skill Level</label>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                  >
                    <option value="all">All Levels</option>
                    <option value="Beginner">🌱 Beginner</option>
                    <option value="Intermediate">⚡ Intermediate</option>
                    <option value="Advanced">🚀 Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-mono font-semibold text-sm mb-2">Prize Range</label>
                  <select 
                    value={prizeRange} 
                    onChange={(e) => setPrizeRange(e.target.value)}
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                  >
                    <option value="all">All Prizes</option>
                    <option value="free">Free Entry</option>
                    <option value="1k-10k">💰 $1K - $10K</option>
                    <option value="10k-100k">💎 $10K - $100K</option>
                    <option value="100k+">🏆 $100K+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-mono font-semibold text-sm mb-2">Sort By</label>
                  <select className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all">
                    <option>📅 Deadline</option>
                    <option>💰 Prize Amount</option>
                    <option>👥 Participants</option>
                    <option>🆕 Recently Added</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-mono">Loading hackathons...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 font-mono">
                Found <span className="text-teal-400 font-bold">{filteredHackathons.length}</span> hackathons
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredHackathons.map((hackathon) => {
                const theme = getCardTheme(hackathon.colorTheme);
                
                return (
                  <Link 
                    key={hackathon.id} 
                    href={`/hackathons/${hackathon.id}`}
                    className={`group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${theme.border} hover:scale-[1.02] ${theme.glow} h-fit`}
                  >
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      {hackathon.image === "/api/placeholder/400/200" ? (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">🚀</div>
                      ) : (
                        <Image
                          src={hackathon.image}
                          alt={hackathon.title}
                          width={600}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      
                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1.5 rounded-sm text-xs font-bold font-mono border-2 ${getStatusBadge(hackathon.status)} backdrop-blur`}>
                          {hackathon.status}
                        </span>
                      </div>
                      
                      {/* Featured Badge */}
                      {hackathon.featured && (
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold font-mono border-2 border-yellow-300">
                            <Star className="h-3 w-3 fill-current" />
                            FEATURED
                          </div>
                        </div>
                      )}
                      
                      {/* Bottom Info Bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-black/80 backdrop-blur border-2 ${theme.border} ${theme.text}`}>
                          {getModeIcon(hackathon.mode)}
                          {hackathon.mode.toUpperCase()}
                        </div>
                        
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-black/80 backdrop-blur border-2 ${theme.border} ${theme.text}`}>
                          <Users className="h-3 w-3" />
                          {hackathon.participants}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      {/* Title & Organizer */}
                      <div className="mb-4">
                        <h3 className="text-xl font-blackops text-white mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors">
                          {hackathon.title}
                        </h3>
                        <p className="text-sm font-mono font-semibold text-gray-400">
                          by {hackathon.organizer}
                        </p>
                      </div>
                      
                      {/* Details Grid */}
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                          <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{new Date(hackathon.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(hackathon.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                          <MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="truncate">{hackathon.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                          <Clock className="h-4 w-4 text-orange-400 flex-shrink-0" />
                          <span>{hackathon.timeLeft}</span>
                        </div>
                      </div>
                      
                      {/* Prize Display */}
                      <div className={`flex items-center justify-center gap-2 mb-4 p-3 bg-gradient-to-r ${theme.gradient} rounded-xl border-2 border-yellow-400 shadow-lg hover:shadow-yellow-400/50 transition-all`}>
                        <Trophy className="h-5 w-5 text-yellow-300" />
                        <span className="font-blackops text-lg text-white drop-shadow">{hackathon.prize}</span>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hackathon.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2.5 py-1 bg-gray-800/50 backdrop-blur text-gray-300 rounded-md text-xs font-mono font-semibold border-2 border-yellow-400"
                          >
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                          </span>
                        ))}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                          <span>Registration</span>
                          <span className="font-bold">{hackathon.participants}/{hackathon.maxParticipants}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
                          <div 
                            className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-500 relative`}
                            style={{ width: `${Math.min((hackathon.participants / hackathon.maxParticipants) * 100, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-mono font-bold transition-all border-2 border-gray-700 hover:border-gray-600">
                          <ExternalLink className="h-4 w-4" />
                          View Details
                        </button>
                        <button 
                          disabled={hackathon.status === "Full"}
                          className={`flex-1 inline-flex items-center font-blackops justify-center gap-2 px-4 py-2.5 rounded-md text-sm transition-all border-2 ${
                            hackathon.status === "Full" 
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700" 
                              : `bg-gradient-to-r ${theme.gradient} shadow-yellow-400 hover:shadow-lg ${theme.glow} text-white border-transparent`
                          }`}
                        >
                          {hackathon.status === "Full" ? "FULL" : "JOIN NOW"}
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
                <h3 className="text-2xl font-blackops text-white mb-2">No hackathons found</h3>
                <p className="text-gray-400 font-mono">Try adjusting your filters or search terms</p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-6 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg font-mono font-bold transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Hackathons;