import hackathonPicture1 from '@/assets/hackathonPic1.webp';
import hackathonPicture2 from '@/assets/hackathonPic2.webp';
import hackathonPicture3 from '@/assets/hackathonPic3.webp';
import hackathonPicture4 from '@/assets/hackathonPic4.webp';
import hackathonPicture5 from '@/assets/hackathonPic5.webp';
import hackathonPicture6 from '@/assets/hackathonPic6.webp';
import { StaticImageData } from 'next/image';

export interface Hackathon {
    id: string;
    title: string;
    description: string;
    organizer: string;
    startDate: string;
    endDate: string;
    location: string;
    mode: "online" | "hybrid" | "offline";
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
    level: string[];
    prizeValue: number;
    teamCount?: number;
  }

export const mockHackathons: Hackathon[] = [
    {
      id: "1",
      title: "Genesis Season One",
      description: "Submit your web3 project, graduate, and compete for 1M $TKAI plus Pro Plans from Cursor, Vercel, and more.",
      organizer: "Genesis DAO",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      location: "Kuala Lumpur, Malaysia",
      mode: "hybrid",
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
      level: ["Professionals"],
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
      mode: "offline",
      participants: 484,
      maxParticipants: 500,
      prize: "250,000 USDT",
      tags: ["Blockchain", "DeFi", "Trading"],
      image: hackathonPicture2,
      status: "Closing Soon",
      timeLeft: "12 hours left",
      colorTheme: "teal",
      category: "FinTech",
      level: ["Uni/College Students"],
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
      mode: "online",
      participants: 314,
      maxParticipants: 1000,
      prize: "8,000 EUR",
      tags: ["Space Tech", "Agriculture", "Sustainability"],
      image: hackathonPicture3,
      status: "Open",
      timeLeft: "45 days left",
      colorTheme: "green",
      category: "Space & Science",
      level: ["High School Students"],
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
      mode: "hybrid",
      participants: 892,
      maxParticipants: 1500,
      prize: "150,000 MYR",
      tags: ["FinTech", "AI", "Mobile"],
      image: hackathonPicture4,
      status: "Open",
      timeLeft: "18 days left",
      colorTheme: "pink",
      category: "FinTech",
      level: ["Uni/College Students", "Professionals"],
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
      mode: "offline",
      participants: 320,
      maxParticipants: 400,
      prize: "50,000 EUR",
      tags: ["Blockchain", "Privacy", "DeFi"],
      image: hackathonPicture5,
      status: "Open",
      timeLeft: "52 days left",
      colorTheme: "yellow",
      category: "Blockchain",
      level: ["Everyone"],
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
      mode: "hybrid",
      participants: 220,
      maxParticipants: 300,
      prize: "25,000 USD",
      tags: ["Blockchain", "AI", "Cloud Gaming"],
      image: hackathonPicture6,
      status: "Open",
      timeLeft: "60 days left",
      colorTheme: "cyan",
      category: "Gaming",
      level: ["Everyone"],
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
      mode: "hybrid",
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
      level: ["Uni/College Students", "High School Students"],
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
      mode: "offline",
      participants: 484,
      maxParticipants: 500,
      prize: "250,000 USDT",
      tags: ["Blockchain", "DeFi", "Trading"],
      image: "/api/placeholder/400/200",
      status: "Closing Soon",
      timeLeft: "12 hours left",
      colorTheme: "teal",
      category: "FinTech",
      level: ["Everyone"],
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
      mode: "online",
      participants: 314,
      maxParticipants: 1000,
      prize: "8,000 EUR",
      tags: ["Space Tech", "Agriculture", "Sustainability"],
      image: "/api/placeholder/400/200",
      status: "Open",
      timeLeft: "45 days left",
      colorTheme: "green",
      category: "Space & Science",
      level: ["Everyone"],
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
      mode: "hybrid",
      participants: 892,
      maxParticipants: 1500,
      prize: "150,000 MYR",
      tags: ["FinTech", "AI", "Mobile"],
      image: "/api/placeholder/400/200",
      status: "Open",
      timeLeft: "18 days left",
      colorTheme: "pink",
      category: "FinTech",
      level: ["Freshers"],
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
      mode: "offline",
      participants: 320,
      maxParticipants: 400,
      prize: "50,000 EUR",
      tags: ["Blockchain", "Privacy", "DeFi"],
      image: "/api/placeholder/400/200",
      status: "Open",
      timeLeft: "52 days left",
      colorTheme: "yellow",
      category: "Blockchain",
      level: ["Freshers", "Uni/College Students"],
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
      mode: "hybrid",
      participants: 220,
      maxParticipants: 300,
      prize: "25,000 USD",
      tags: ["Blockchain", "AI", "Cloud Gaming"],
      image: "/api/placeholder/400/200",
      status: "Open",
      timeLeft: "60 days left",
      colorTheme: "cyan",
      category: "Gaming",
      level: ["Professionals", "Freshers"],
      prizeValue: 25000
    }
  ];