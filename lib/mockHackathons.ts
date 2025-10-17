// lib/mockHackathons.ts

import { StaticImageData } from "next/image";
import hackathonPicture1 from '@/assets/hackathonPic1.webp';
import hackathonPicture2 from '@/assets/hackathonPic2.webp';
import hackathonPicture3 from '@/assets/hackathonPic3.webp';

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  websiteUrl: string, 
  organizer: string;
  startDate: string;
  endDate: string;
  location: string;
  mode: "Online" | "Hybrid" | "Physical";
  participants: number;
  maxParticipants: number;
  totalPrizePool: string;
  tags: string[];
  image: string | StaticImageData;
  logo: string | StaticImageData;
  status: "Open" | "Closing Soon" | "Full";
  timeLeft: string;
  featured: boolean;
  colorTheme: string;
  category: string;
  level: string;
  prizeValue: number;
  eligibility: string[];
  requirements: string[];
  prizes: Array<{ position: string; amount: string; description: string; type: string }>;
  timeline: Array<{ title: string; startDate: string; endDate: string; description: string; isActive?: boolean }>;
  importantDates: Array<{ title: string; date: string; time: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  organizers: Array<{ name: string; role: string; email: string; phone: string; profileUrl: string; photo: string }>;
  sponsors: Array<{ name: string; tier: string; website: string; logo: string; description: string }>;
}

export const mockHackathons: Hackathon[] = [
  {
    id: "1",
    title: "Genesis Season One Hackathon 2025",
    description: "Submit your web3 project, graduate, and compete for 1M $TKAI plus Pro Plans from Cursor, Vercel, and more.",
    detailedDescription: "Genesis Season One is the ultimate Web3 hackathon experience designed for builders who want to push the boundaries of decentralized technology...",
    websiteUrl: "",
    organizer: "Genesis DAO",
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    location: "Kuala Lumpur, Malaysia",
    mode: "Hybrid",
    participants: 1250,
    maxParticipants: 2000,
    totalPrizePool: "1,000,000 $TKAI",
    tags: ["Blockchain", "Web3", "DeFi", "Smart Contracts"],
    image: hackathonPicture1,
    logo: hackathonPicture1,
    status: "Open",
    timeLeft: "28 days left",
    featured: true,
    colorTheme: "purple",
    category: "Blockchain",
    level: "Advanced",
    prizeValue: 1000000,
    eligibility: ["Engineering Students", "MBA Students", "Undergraduate", "Postgraduate"],
    requirements: [
      "Must be 18+ years old",
      "Team of 2-4 members",
      "Open source project submission",
      "Must use blockchain technology",
      "Original work only"
    ],
    prizes: [
      {
        position: "Winner",
        amount: "$50,000",
        type: "cash",
        description: "Chance for a coveted internship with the Tata Group..."
      },
      {
        position: "First Runner Up",
        amount: "$25,000",
        type: "cash",
        description: "Chance for a coveted internship with the Tata Group..."
      },
      {
        position: "Second Runner Up",
        amount: "$15,000",
        type: "cash",
        description: "Chance for a coveted internship with the Tata Group..."
      },
      {
        position: "Winner",
        amount: "",
        type: "certificate",
        description: "MacBook Pro M3, Certificate of Innovation"
      },
      {
        position: "Winner",
        amount: "",
        type: "other",
        description: "iPad Pro, Apple Pencil, Certificate"
      },
      {
        position: "Winner",
        amount: "",
        type: "other",
        description: "Gaming setup, community recognition"
      }
    ],
    timeline: [
      {
        title: "Registration Opens",
        startDate: "2025-01-15T09:00:00Z",
        endDate: "2025-01-20T23:59:00Z",
        description: "Team formation and idea submission.",
        isActive: true
      },
      {
        title: "Kickoff Event",
        startDate: "2025-01-20T10:00:00Z",
        endDate: "2025-01-20T18:00:00Z",
        description: "Workshops and mentorship sessions."
      },
      {
        title: "Submission Deadline",
        startDate: "2025-02-10T23:59:00Z",
        endDate: "",
        description: "Final project submissions due."
      },
      {
        title: "Final Judging & Awards",
        startDate: "2025-02-15T09:00:00Z",
        endDate: "2025-02-15T20:00:00Z",
        description: "Pitch presentations and awards."
      }
    ],
    importantDates: [
      {
        title: "Registration Deadline",
        date: "2025-09-20",
        time: "11:59 PM GMT",
        description: "Last chance to register your team.",
      },
      {
        title: "Team Formation Deadline",
        date: "2025-09-21",
        time: "11:59 PM GMT",
        description: "Submit team member details."
      },
      {
        title: "Project Submission Opens",
        date: "2025-09-23",
        time: "12:00 AM GMT",
        description: "Submission portal opens."
      },
      {
        title: "Final Submission Deadline",
        date: "2025-11-10",
        time: "11:59 PM GMT",
        description: "Hard deadline. No extensions."
      }
    ],
    faq: [],
    organizers: [
      {
        name: "Alex Chen",
        role: "Lead Organizer",
        email: "alex@genesisdao.org",
        phone: "+1-555-0123",
        profileUrl: "https://genesisdao.org/alex",
        photo: "/images/organizers/alex.jpg"
      },
      {
        name: "Sarah Kim",
        role: "Technical Coordinator",
        email: "sarah@genesisdao.org",
        phone: "+1-555-0124",
        profileUrl: "https://genesisdao.org/sarah",
        photo: "/images/organizers/sarah.jpg"
      }
    ],
    sponsors: [
      {
        name: "Genesis DAO",
        tier: "title",
        website: "https://genesisdao.org",
        logo: "/logos/genesisdao.png",
        description: "Leading Web3 innovation platform"
      },
      {
        name: "Cursor",
        tier: "platinum",
        website: "https://cursor.sh",
        logo: "/logos/cursor.png",
        description: "AI-powered code editor"
      }
    ]
  },
  {
    id: "2",
    title: "Hyperliquid Community Hackathon",
    description: "Building on the blockchain to house all of finance. Create innovative solutions for decentralized finance.",
    detailedDescription: "The Hyperliquid Community Hackathon is an intensive 3-day event focused on building the future of decentralized finance...",
    organizer: "Hyperliquid Labs",
    websiteUrl: "",
    startDate: "2025-01-20",
    endDate: "2025-01-22",
    location: "Penang, Malaysia",
    mode: "Physical",
    participants: 484,
    maxParticipants: 500,
    totalPrizePool: "250,000 USDT",
    tags: ["Blockchain", "DeFi", "Trading", "Liquidity"],
    image: hackathonPicture2,
    logo: hackathonPicture2,
    status: "Closing Soon",
    timeLeft: "12 hours left",
    featured: false,
    colorTheme: "teal",
    category: "FinTech",
    level: "Intermediate",
    prizeValue: 250000,
    eligibility: ["Open For All"],
    requirements: [
      "Experience with DeFi protocols",
      "Team of 1-5 members",
      "Must integrate with Hyperliquid",
      "Live demo required"
    ],
    prizes: [
      {

        position: "Winner",
        amount: "$50,000",
        type: "cash",
        description: "Cash prize, mentorship program, and certificate."
      },
      {
        position: "First Runner Up",
        amount: "$25,000",
        type: "cash",
        description: "Cash prize, Pro Plan access, and certificate."
      },
      {
        position: "Second Runner Up",
        amount: "$15,000",
        type: "cash",
        description: "Cash prize and startup credits."
      },
      {
        position: "Winner",
        amount: "",
        type: "other",
        description: "MacBook Pro M3, Certificate of Innovation"
      }
    ],
    timeline: [
      {
        title: "Opening Ceremony",
        startDate: "2025-01-20T09:00:00Z",
        endDate: "2025-01-20T12:00:00Z",
        description: "Welcome, team formation, and technical briefings."
      },
      {
        title: "Development Day",
        startDate: "2025-01-21T09:00:00Z",
        endDate: "2025-01-21T21:00:00Z",
        description: "Full day of coding with mentor support and workshops."
      },
      {
        title: "Demo Day",
        startDate: "2025-01-22T10:00:00Z",
        endDate: "2025-01-22T16:00:00Z",
        description: "Project presentations and judging."
      }
    ],
    importantDates: [
      {
        title: "Hackathon Starts",
        date: "2025-09-20",
        time: "09:00 AM GMT",
        description: "Opening ceremony and team formation."
      },
      {
        title: "Submission Deadline",
        date: "2025-09-22",
        time: "02:00 PM GMT",
        description: "Final deadline for all project submissions."
      }
    ],
    faq: [],
    organizers: [
      {
        name: "David Liu",
        role: "Event Coordinator",
        email: "david@hyperliquid.xyz",
        phone: "+1-555-0456",
        profileUrl: "https://hyperliquid.xyz/david",
        photo: "/images/organizers/david.jpg"
      }
    ],
    sponsors: [
      {
        name: "Hyperliquid Labs",
        tier: "title",
        website: "https://hyperliquid.xyz",
        logo: "/logos/hyperliquid.png",
        description: "Advanced DeFi trading infrastructure"
      },
      {
        name: "Binance Labs",
        tier: "platinum",
        website: "https://labs.binance.com",
        logo: "/logos/binance.png",
        description: "Blockchain incubator and investment arm of Binance"
      }
    ]
  },
  {
    id: "3",
    title: "CopernicusLAC Panama Hackathon 2025",
    description: "Resolución de problemas en ALC sobre reducción del riesgo de desastres con datos de Copernicus.",
    detailedDescription: "Join the CopernicusLAC Panama Hackathon 2025, where technology meets environmental science to address critical disaster risk reduction challenges...",
    organizer: "ESA & Copernicus",
    websiteUrl: "",
    startDate: "2025-02-01",
    endDate: "2025-02-05",
    location: "Selangor, Malaysia",
    mode: "Online",
    participants: 314,
    maxParticipants: 1000,
    totalPrizePool: "RM100,000",
    tags: ["Space Tech", "Agriculture", "Sustainability", "Climate"],
    image: hackathonPicture3,
    logo: hackathonPicture3,
    status: "Open",
    timeLeft: "45 days left",
    featured: false,
    colorTheme: "green",
    category: "Space & Science",
    level: "Beginner",
    prizeValue: 100000,
    eligibility: ["Engineering Students", "MBA Students", "Undergraduate", "Postgraduate"],
    requirements: [
      "Open to all skill levels",
      "Teams of 2-6 members",
      "Focus on LAC region challenges",
      "Must use Copernicus data"
    ],
    prizes: [
      {
        position: "Winner",
        amount: "$50,000",
        type: "cash",
        description: "Cash prize, mentorship, and certificate of excellence."
      },
      {
        position: "First Runner Up",
        amount: "$25,000",
        type: "cash",
        description: "Cash prize, pro tools access, and certificate."
      },
      {
        position: "Second Runner Up",
        amount: "$15,000",
        type: "certificate",
        description: "Cash prize and startup credits."
      }
    ],
    timeline: [
      {
        title: "Virtual Kickoff",
        startDate: "2025-02-01T10:00:00Z",
        endDate: "2025-02-01T12:00:00Z",
        description: "Introduction to Copernicus data and challenge briefing."
      },
      {
        title: "Development Phase",
        startDate: "2025-02-02T09:00:00Z",
        endDate: "2025-02-04T20:00:00Z",
        description: "Team coding with daily check-ins and mentor sessions."
      },
      {
        title: "Final Presentations",
        startDate: "2025-02-05T10:00:00Z",
        endDate: "2025-02-05T17:00:00Z",
        description: "Project demos and expert panel judging."
      }
    ],
    importantDates: [
      {
        title: "Kickoff & Challenge Briefing",
        date: "2025-10-01",
        time: "10:00 AM GMT",
        description: "Overview of hackathon tracks and Copernicus data tools."
      },
      {
        title: "Submission Deadline",
        date: "2025-11-05",
        time: "09:00 AM GMT",
        description: "Final submission of projects and documentation."
      }
    ],
    faq: [],
    organizers: [
      {
        name: "Maria Rodriguez",
        role: "Program Manager",
        email: "maria@esa.int",
        phone: "+34-555-0678",
        profileUrl: "https://esa.int/maria",
        photo: "/images/organizers/maria.jpg"
      }
    ],
    sponsors: [
      {
        name: "European Space Agency",
        tier: "title",
        website: "https://esa.int",
        logo: "/logos/esa.png",
        description: "European leader in Earth observation and space missions"
      },
      {
        name: "Copernicus Programme",
        tier: "platinum",
        website: "https://copernicus.eu",
        logo: "/logos/copernicus.png",
        description: "Global Earth observation program by the EU"
      }
    ]
  }    
];


export const faqData = [
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
