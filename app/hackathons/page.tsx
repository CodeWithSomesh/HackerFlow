'use client'

import { useEffect, useState } from "react";
import { Search, Filter, MapPin, Calendar, Users, Trophy, Clock, Star, ExternalLink, ChevronRight, Globe, Building, X, ChevronDown, PersonStanding, User } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
// import { mockHackathons, Hackathon } from "@/lib/mockHackathons2";
import { Hackathon } from "@/lib/mockHackathons2";
import { fetchPublishedHackathons } from "@/lib/actions/createHackathon-actions";
import { IconUserStar } from "@tabler/icons-react";



const Hackathons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedPrizeRanges, setSelectedPrizeRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("deadline");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState<string>("Status");
  const [dbHackathons, setDbHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Temporary filter states (for modal)
  const [tempSelectedModes, setTempSelectedModes] = useState<string[]>([]);
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempSelectedLevels, setTempSelectedLevels] = useState<string[]>([]);
  const [tempSelectedPrizeRanges, setTempSelectedPrizeRanges] = useState<string[]>([]);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    setIsLoading(true);
    try {
      const result = await fetchPublishedHackathons();
      
      if (result.success && result.data) {
        // Filter only verified hackathons
        const verifiedHackathons = result.data.filter((hack: any) => hack.verification_status === 'verified');

        // Transform DB data to match our interface
        const transformedData: Hackathon[] = verifiedHackathons.map((hack: any, index:number) => ({
          id: hack.id,
          title: hack.title,
          description: hack.about || 'No description available',
          organizer: hack.organization,
          startDate: hack.registration_start_date,
          endDate: hack.registration_end_date,
          location: hack.location || 'Online',
          mode: hack.mode as "online" | "hybrid" | "offline",
          participants: hack.participant_count || 0, // Use actual participant count from server
          maxParticipants: hack.max_participants || 1000,
          prize: hack.total_prize_pool || '$0',
          tags: hack.categories || [],
          image: hack.banner_url || '/api/placeholder/400/200',
          status: calculateStatus(hack),
          timeLeft: calculateTimeLeft(hack.registration_end_date),
          featured: false,
          colorTheme: getRandomTheme(index),
          category: hack.categories?.[0] || 'General',
          level: hack.eligibility?.[0] || 'Meow', // Use the first eligibility option
          prizeValue: parsePrizeValue(hack.total_prize_pool),
          teamCount: hack.team_count || 0 // Add team count from server
        }));

        setDbHackathons(transformedData);

        // Extract unique categories from all hackathons
        const categories = new Set<string>();
        verifiedHackathons.forEach((hack: any) => {
          if (hack.categories && Array.isArray(hack.categories)) {
            hack.categories.forEach((cat: string) => {
              // Convert to proper camel case (each word capitalized)
              const camelCase = cat.split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              categories.add(camelCase);
            });
          }
        });
        console.log('Available categories:', Array.from(categories));
        setAvailableCategories(Array.from(categories).sort());
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

    // Past dates should be Closed
    if (daysLeft < 0) return "Full";

    // Full capacity
    if (currentParticipants >= maxParticipants) return "Full";

    // Less than 1 week (7 days) to expire should be Closing Soon
    if (daysLeft <= 7 && daysLeft > 0) return "Closing Soon";

    // More than 1 week should be Open
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

  // Comment out mock data - only showing verified hackathons from DB
  // const allHackathons = [...dbHackathons, ...mockHackathons];
  const allHackathons = [...dbHackathons];

  const filteredHackathons = allHackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = selectedModes.length === 0 ||
                       selectedModes.some(mode => hackathon.mode.toLowerCase() === mode);

    const matchesStatus = selectedStatuses.length === 0 ||
                         selectedStatuses.some(status => hackathon.status.toLowerCase().replace(" ", "-") === status);

    // Check if any selected category exists in hackathon.tags array
    // Setting it to lower case because tags are saved as lower case in DB
    const matchesCategory = selectedCategories.length === 0 ||
                           selectedCategories.some(cat => hackathon.tags.includes(cat.toLowerCase()));

    const matchesLevel = selectedLevels.length === 0 ||
                          selectedLevels.some(level => hackathon.level.includes(level));

    let matchesPrize = true;
    if (selectedPrizeRanges.length > 0) {
      matchesPrize = selectedPrizeRanges.some(range => {
        if (range === "0") return hackathon.prizeValue === 0;
        else if (range === "1k-10k") return hackathon.prizeValue >= 1000 && hackathon.prizeValue <= 10000;
        else if (range === "10k-100k") return hackathon.prizeValue >= 10000 && hackathon.prizeValue <= 100000;
        else if (range === "100k+") return hackathon.prizeValue > 100000;
        return true;
      });
    }

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
    setSelectedModes([]);
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedPrizeRanges([]);
  };

  const clearTempFilters = () => {
    setTempSelectedModes([]);
    setTempSelectedStatuses([]);
    setTempSelectedCategories([]);
    setTempSelectedLevels([]);
    setTempSelectedPrizeRanges([]);
  };

  const applyFilters = () => {
    setSelectedModes(tempSelectedModes);
    setSelectedStatuses(tempSelectedStatuses);
    setSelectedCategories(tempSelectedCategories);
    setSelectedLevels(tempSelectedLevels);
    setSelectedPrizeRanges(tempSelectedPrizeRanges);
    setShowFiltersModal(false);
  };

  const openFiltersModal = () => {
    // Sync temp filters with current filters
    setTempSelectedModes(selectedModes);
    setTempSelectedStatuses(selectedStatuses);
    setTempSelectedCategories(selectedCategories);
    setTempSelectedLevels(selectedLevels);
    setTempSelectedPrizeRanges(selectedPrizeRanges);
    setShowFiltersModal(true);
  };

  const activeFiltersCount = [
    selectedModes.length > 0 ? 1 : 0,
    selectedStatuses.length > 0 ? 1 : 0,
    selectedCategories.length > 0 ? 1 : 0,
    selectedLevels.length > 0 ? 1 : 0,
    selectedPrizeRanges.length > 0 ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-black mt-4">
      <style jsx>{`
        select option {
          background-color: #1f2937;
          color: white;
          padding: 8px;
        }
        select option:hover {
          background-color: #374151;
        }
        select::-ms-expand {
          display: none;
        }
      `}</style>
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
          <div className="flex flex-wrap gap-2 md:gap-3">
            {/* Main Filters Button */}
            <button
              onClick={openFiltersModal}
              className="bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-white font-mono text-xs md:text-sm hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Status Badge - Shows count if statuses selected */}
            {selectedStatuses.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-gray-900/80 backdrop-blur border-2 border-teal-400 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-white font-mono text-xs md:text-sm">
                <span className="text-teal-400">{selectedStatuses.length} Status</span>
              </div>
            )}

            {/* User Type Badge - Shows count if levels selected */}
            {selectedLevels.length > 0 && (
              <div className="hidden md:flex items-center gap-2 bg-gray-900/80 backdrop-blur border-2 border-teal-400 rounded-lg px-4 py-2.5 text-white font-mono text-sm">
                <span className="text-teal-400">{selectedLevels.length} User Types</span>
              </div>
            )}

            {/* Category Badge - Shows count if categories selected */}
            {selectedCategories.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-gray-900/80 backdrop-blur border-2 border-teal-400 rounded-lg px-4 py-2.5 text-white font-mono text-sm">
                <span className="text-teal-400">{selectedCategories.length} Categories</span>
              </div>
            )}

            {/* Event Type Badge - Shows count if modes selected */}
            {selectedModes.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-gray-900/80 backdrop-blur border-2 border-teal-400 rounded-lg px-4 py-2.5 text-white font-mono text-sm">
                <span className="text-teal-400">{selectedModes.length} Event Types</span>
              </div>
            )}

            {/* Prize Range Badge - Shows count if prize ranges selected */}
            {selectedPrizeRanges.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-gray-900/80 backdrop-blur border-2 border-teal-400 rounded-lg px-4 py-2.5 text-white font-mono text-sm">
                <span className="text-teal-400">{selectedPrizeRanges.length} Prize Ranges</span>
              </div>
            )}

            {/* Sort By Dropdown */}
            <div className="relative group ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-2.5 text-white font-mono text-xs md:text-sm hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all cursor-pointer"
              >
                <option value="deadline">Sort: Deadline</option>
                <option value="prize">Sort: Prize</option>
                <option value="participants">Sort: Participants</option>
                <option value="recent">Sort: Recent</option>
              </select>
              <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 h-3 md:h-4 w-3 md:w-4 text-gray-400 pointer-events-none" />
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="bg-red-600/80 hover:bg-red-500 border-2 border-red-400 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-mono font-bold text-xs md:text-sm transition-all flex items-center gap-2"
              >
                <X className="h-3 md:h-4 w-3 md:w-4" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
          </div>

          {/* Filters Modal */}
          {showFiltersModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-gray-900 border-2 border-teal-400 rounded-xl sm:rounded-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl shadow-teal-400/20">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-gray-800">
                  <h2 className="text-2xl sm:text-3xl font-blackops text-white">Filters</h2>
                  <button
                    onClick={() => setShowFiltersModal(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-400 hover:text-white" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex h-[400px] sm:h-[500px]">
                  {/* Sidebar */}
                  <div className="w-32 sm:w-40 md:w-52 bg-gray-950/50 border-r-2 border-gray-800 p-2 sm:p-3 md:p-4 overflow-y-auto">
                    <div className="space-y-1 sm:space-y-2">
                      {[
                        { full: "Status", short: "Status" },
                        { full: "Event Type", short: "Event" },
                        { full: "User Type", short: "User" },
                        { full: "Category", short: "Category" },
                        { full: "Prize Rewards Range", short: "Prize" }
                      ].map((section) => (
                        <button
                          key={section.full}
                          onClick={() => setActiveFilterSection(section.full)}
                          className={`w-full text-left px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all ${
                            activeFilterSection === section.full
                              ? "bg-teal-500/20 text-teal-400 border-2 border-teal-400"
                              : "text-gray-400 hover:bg-gray-800 border-2 border-transparent"
                          }`}
                        >
                          <span className="hidden sm:inline">{section.full}</span>
                          <span className="sm:hidden">{section.short}</span>
                          {section.full === "Status" && tempSelectedStatuses.length > 0 && (
                            <span className="ml-2 w-2 h-2 bg-teal-400 rounded-full inline-block"></span>
                          )}
                          {section.full === "Event Type" && tempSelectedModes.length > 0 && (
                            <span className="ml-2 w-2 h-2 bg-teal-400 rounded-full inline-block"></span>
                          )}
                          {section.full === "User Type" && tempSelectedLevels.length > 0 && (
                            <span className="ml-2 w-2 h-2 bg-teal-400 rounded-full inline-block"></span>
                          )}
                          {section.full === "Category" && tempSelectedCategories.length > 0 && (
                            <span className="ml-2 w-2 h-2 bg-teal-400 rounded-full inline-block"></span>
                          )}
                          {section.full === "Prize Rewards Range" && tempSelectedPrizeRanges.length > 0 && (
                            <span className="ml-2 w-2 h-2 bg-teal-400 rounded-full inline-block"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Options */}
                  <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-gray-900">
                    {/* Status Section */}
                    {activeFilterSection === "Status" && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-blackops text-white">
                            Status
                            {tempSelectedStatuses.length > 0 && (
                              <span className="ml-2 text-sm text-teal-400">({tempSelectedStatuses.length} selected)</span>
                            )}
                          </h3>
                          <button
                            onClick={() => setTempSelectedStatuses([])}
                            className="text-sm text-teal-400 hover:text-teal-300 font-mono font-bold"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-3">
                          {[
                            { value: "open", label: "Live" },
                            { value: "closing-soon", label: "Closing Soon" },
                            { value: "full", label: "Closed" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-teal-400/30"
                            >
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={tempSelectedStatuses.includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTempSelectedStatuses([...tempSelectedStatuses, option.value]);
                                  } else {
                                    setTempSelectedStatuses(tempSelectedStatuses.filter(s => s !== option.value));
                                  }
                                }}
                                className="w-4 h-4 text-teal-400 focus:ring-2 focus:ring-teal-400 bg-gray-800 border-gray-600 rounded"
                              />
                              <span className="text-gray-200 font-mono font-semibold">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Event Type Section */}
                    {activeFilterSection === "Event Type" && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-blackops text-white">
                            Event Type
                            {tempSelectedModes.length > 0 && (
                              <span className="ml-2 text-sm text-teal-400">({tempSelectedModes.length} selected)</span>
                            )}
                          </h3>
                          <button
                            onClick={() => setTempSelectedModes([])}
                            className="text-sm text-teal-400 hover:text-teal-300 font-mono font-bold"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-3">
                          {[
                            { value: "online", label: "Online" },
                            { value: "offline", label: "Physical" },
                            { value: "hybrid", label: "Hybrid" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-teal-400/30"
                            >
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={tempSelectedModes.includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTempSelectedModes([...tempSelectedModes, option.value]);
                                  } else {
                                    setTempSelectedModes(tempSelectedModes.filter(m => m !== option.value));
                                  }
                                }}
                                className="w-4 h-4 text-teal-400 focus:ring-2 focus:ring-teal-400 bg-gray-800 border-gray-600 rounded"
                              />
                              <span className="text-gray-200 font-mono font-semibold">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Type Section */}
                    {activeFilterSection === "User Type" && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-blackops text-white">
                            User Type
                            {tempSelectedLevels.length > 0 && (
                              <span className="ml-2 text-sm text-teal-400">({tempSelectedLevels.length} selected)</span>
                            )}
                          </h3>
                          <button
                            onClick={() => setTempSelectedLevels([])}
                            className="text-sm text-teal-400 hover:text-teal-300 font-mono font-bold"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-3">
                          {[
                            { value: "Professionals", label: "Professionals" },
                            { value: "Uni/College Students", label: "Uni/College Students" },
                            { value: "High School Students", label: "High School Students" },
                            { value: "Freshers", label: "Freshers" },
                            { value: "Everyone", label: "Everyone" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-teal-400/30"
                            >
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={tempSelectedLevels.includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTempSelectedLevels([...tempSelectedLevels, option.value]);
                                  } else {
                                    setTempSelectedLevels(tempSelectedLevels.filter(l => l !== option.value));
                                  }
                                }}
                                className="w-4 h-4 text-teal-400 focus:ring-2 focus:ring-teal-400 bg-gray-800 border-gray-600 rounded"
                              />
                              <span className="text-gray-200 font-mono font-semibold">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Section - Multi-select */}
                    {activeFilterSection === "Category" && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-blackops text-white">
                            Category
                            {tempSelectedCategories.length > 0 && (
                              <span className="ml-2 text-sm text-teal-400">({tempSelectedCategories.length} selected)</span>
                            )}
                          </h3>
                          <button
                            onClick={() => setTempSelectedCategories([])}
                            className="text-sm text-teal-400 hover:text-teal-300 font-mono font-bold"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-3">
                          {availableCategories.length > 0 ? (
                            availableCategories.map((category) => (
                              <label
                                key={category}
                                className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-teal-400/30"
                              >
                                <input
                                  type="checkbox"
                                  value={category}
                                  checked={tempSelectedCategories.includes(category)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTempSelectedCategories([...tempSelectedCategories, category]);
                                    } else {
                                      setTempSelectedCategories(tempSelectedCategories.filter(c => c !== category));
                                    }
                                  }}
                                  className="w-4 h-4 text-teal-400 focus:ring-2 focus:ring-teal-400 bg-gray-800 border-gray-600 rounded"
                                />
                                <span className="text-gray-200 font-mono font-semibold">{category}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-gray-400 font-mono text-sm">No categories available</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prize Rewards Range Section */}
                    {activeFilterSection === "Prize Rewards Range" && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-blackops text-white">
                            Prize Rewards Range
                            {tempSelectedPrizeRanges.length > 0 && (
                              <span className="ml-2 text-sm text-teal-400">({tempSelectedPrizeRanges.length} selected)</span>
                            )}
                          </h3>
                          <button
                            onClick={() => setTempSelectedPrizeRanges([])}
                            className="text-sm text-teal-400 hover:text-teal-300 font-mono font-bold"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-3">
                          {[
                            { value: "0", label: "No Prize" },
                            { value: "1k-10k", label: "RM1000 - RM10,000" },
                            { value: "10k-100k", label: "RM10,000 - RM100,000" },
                            { value: "100k+", label: "RM100,000+" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-teal-400/30"
                            >
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={tempSelectedPrizeRanges.includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTempSelectedPrizeRanges([...tempSelectedPrizeRanges, option.value]);
                                  } else {
                                    setTempSelectedPrizeRanges(tempSelectedPrizeRanges.filter(p => p !== option.value));
                                  }
                                }}
                                className="w-4 h-4 text-teal-400 focus:ring-2 focus:ring-teal-400 bg-gray-800 border-gray-600 rounded"
                              />
                              <span className="text-gray-200 font-mono font-semibold">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-t-2 border-gray-800 bg-gray-950/50">
                  <button
                    onClick={clearTempFilters}
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-mono font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear Filter
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-mono font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-teal-400/50 border-2 border-teal-400"
                  >
                    Apply Filter
                    <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4" />
                  </button>
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

                        <div className="flex items-center gap-2">
                          {hackathon.teamCount !== undefined && hackathon.teamCount > 0 && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-black/80 backdrop-blur border-2 ${theme.border} ${theme.text}`}>
                              <Users className="h-3 w-3" />
                              {hackathon.teamCount} Teams
                            </div>
                          )}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-black/80 backdrop-blur border-2 ${theme.border} ${theme.text}`}>
                            <User className="h-3 w-3" />
                            {hackathon.participants}
                          </div>
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
                          <span className="truncate">
                            {hackathon.mode === 'online' ? 
                            hackathon.mode.charAt(0).toUpperCase() + hackathon.mode.slice(1) :
                            `${hackathon.location} (${hackathon.mode === 'offline' ? "Physical" : hackathon.mode.charAt(0).toUpperCase() + hackathon.mode.slice(1)})`
                          }
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                          <User className="h-4 w-4 text-pink-400 flex-shrink-0" />
                          <span>{Array.isArray(hackathon.level) ? hackathon.level.join(', ') : hackathon.level}</span>
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