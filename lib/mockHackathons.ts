// lib/mockHackathons.ts

import { StaticImageData } from "next/image";
import hackathonPicture1 from '@/assets/hackathonPic1.webp';
import hackathonPicture2 from '@/assets/hackathonPic2.webp';
import hackathonPicture3 from '@/assets/hackathonPic3.webp';

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  eligibility: string[];
  organizer: string;
  startDate: string;
  endDate: string;
  location: string;
  mode: "Online" | "Hybrid" | "Physical";
  participants: number;
  maxParticipants: number;
  tags: string[];
  image: string | StaticImageData;
  status: "Open" | "Closing Soon" | "Full";
  timeLeft: string;
  featured?: boolean;
  colorTheme: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  detailedDescription?: string;
  requirements?: string[];
  judgesCriteria?: string[];
  timeline?: Array<{
    date: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    isActive?: boolean;
  }>;
  importantDates?: Array<{
    title: string;
    date: string;
    time: string;
    description: string;
    isUrgent?: boolean;
  }>;
  prizes?: Array<{
    category: string;
    position: string;
    amount?: string;
    items: string[];
    description?: string;
    type: "cash" | "certificate" | "other";
  }>;
  totalPrizePool: string
  sponsors?: Array<{
    name: string;
    logo: string;
    description?: string;
    image?: StaticImageData;
    websiteLink?: string;
  }>;
  organizers?: Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
    image?: StaticImageData;
  }>;
}

export const mockHackathons: Hackathon[] = [
    {
        id: "1",
        title: "Genesis Season One Hackathon 2025",
        description: "Submit your web3 project, graduate, and compete for 1M $TKAI plus Pro Plans from Cursor, Vercel, and more.",
        detailedDescription: "Genesis Season One is the ultimate Web3 hackathon experience designed for builders who want to push the boundaries of decentralized technology. Over the course of one month, participants will have access to cutting-edge tools, mentorship from industry experts, and the opportunity to compete for substantial prizes.\n\nThis hackathon focuses on real-world applications of blockchain technology, DeFi protocols, and innovative Web3 solutions. Whether you're building the next DeFi protocol, creating NFT marketplaces, or developing cross-chain applications, Genesis Season One provides the perfect platform to showcase your skills.\n\nParticipants will receive exclusive access to premium development tools including Cursor Pro, Vercel Pro plans, and direct mentorship from Genesis DAO core contributors. The judging process emphasizes innovation, technical excellence, and real-world applicability.",
        eligibility: ["Engineering Students", "MBA Students", "Undergraduate", "Postgraduate"],
        organizer: "Genesis DAO",
        startDate: "2025-01-15",
        endDate: "2025-02-15",
        location: "Kuala Lumpur, Malaysia",
        mode: "Hybrid",
        participants: 1250,
        maxParticipants: 2000,
        tags: ["Blockchain", "Web3", "DeFi", "Smart Contracts"],
        image: hackathonPicture1,
        status: "Open",
        timeLeft: "28 days left",
        featured: true,
        colorTheme: "purple",
        category: "Blockchain",
        totalPrizePool: "1,000,000 $TKAI",
        level: "Advanced",
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
            date: "15 Jan 2025",
            title: "Registration Opens",
            description:
                "Registration period begins. Team formation and idea submission. Get ready to showcase your innovative Web3 solutions and connect with fellow builders.",
            startDate: "Jan 15, 2025 09:00 AM GMT",
            endDate: "Jan 20, 2025 11:59 PM GMT",
            isActive: true,
            },
            {
            date: "20 Jan 2025",
            title: "Kickoff Event",
            description:
                "Official launch with workshops, mentorship sessions, and networking. Join industry experts for technical deep-dives and strategic guidance sessions.",
            startDate: "Jan 20, 2025 10:00 AM GMT",
            endDate: "Jan 20, 2025 06:00 PM GMT",
            },
            {
            date: "10 Feb 2025",
            title: "Submission Deadline",
            description:
                "Final project submissions due. No extensions allowed. Make sure your project is complete with documentation, demo video, and source code.",
            startDate: "Feb 10, 2025 11:59 PM GMT",
            },
            {
            date: "15 Feb 2025",
            title: "Final Judging & Awards",
            description:
                "Pitch presentations, judging, and award ceremony. Present your project to industry leaders and compete for the grand prize.",
            startDate: "Feb 15, 2025 09:00 AM GMT",
            endDate: "Feb 15, 2025 08:00 PM GMT",
            },
        ],
        
        importantDates: [
            {
            title: "Registration Deadline",
            date: "Sep 20, 2025",
            time: "11:59 PM GMT",
            description: "Last chance to register your team and secure your spot in the hackathon.",
            isUrgent: true,
            },
            {
            title: "Team Formation Deadline",
            date: "Sep 21, 2025",
            time: "11:59 PM GMT",
            description: "Final deadline to form teams and submit team member details.",
            },
            {
            title: "Project Submission Opens",
            date: "Sep 23, 2025",
            time: "12:00 AM GMT",
            description: "Submission portal opens for final project uploads.",
            },
            {
            title: "Final Submission Deadline",
            date: "Nov 10, 2025",
            time: "11:59 PM GMT",
            description: "Hard deadline for all project submissions. No late submissions accepted.",
            isUrgent: true,
            },
        ],
        prizes: [
            {
              category: "Overall",
              position: "Winner",
              amount: "$50,000",
              items: ["Cash Prize", "Mentorship Program", "Certificate of Excellence"],
              type: "cash" as const,
              description: 'Chance for a coveted internship with the Tata Group, a Grand cash prize of INR 2,50,000, a coveted Tata Crucible Trophy and a luxury holiday experience at the Taj Hotels worth INR 50,000.'
            },
            {
              category: "Overall",
              position: "First Runner Up",
              amount: "$25,000",
              items: ["Cash Prize", "Pro Plan Access", "Certificate of Excellence"],
              type: "cash" as const,
              description: 'Chance for a coveted internship** with the Tata Group and a Taj voucher worth INR 20,000*',
            },
            {
              category: "Overall",
              position: "Second Runner Up",
              amount: "$15,000",
              items: ["Cash Prize", "Startup Credits", "Certificate of Excellence"],
              type: "cash" as const,
              description: 'Chance for a coveted internship** with the Tata Group and a Taj voucher worth INR 20,000*'
            },
            {
              category: "Best Innovation",
              position: "Winner",
              items: ["MacBook Pro M3", "Certificate of Innovation", "1-Year Pro Subscription"],
              type: "certificate" as const,
            },
            {
              category: "Best Design",
              position: "Winner",
              items: ["iPad Pro + Apple Pencil", "Design Tool Licenses", "Certificate of Excellence"],
              type: "other" as const,
            },
            {
              category: "People's Choice",
              position: "Winner",
              items: ["Gaming Setup", "Community Recognition", "Certificate of Appreciation"],
              type: "other" as const,
            },
          ],
        organizers: [
            {
            name: "Alex Chen",
            role: "Lead Organizer",
            email: "alex@genesisdao.org",
            phone: "+1-555-0123",
            },
            {
            name: "Sarah Kim",
            role: "Technical Coordinator",
            email: "sarah@genesisdao.org",
            phone: "+1-555-0124",
            },
            {
            name: "Marcus Rodriguez",
            role: "Community Manager",
            email: "marcus@genesisdao.org",
            phone: "+1-555-0125",
            },
            {
            name: "Elena Petrov",
            role: "Partnerships Director",
            email: "elena@genesisdao.org",
            phone: "+1-555-0126",
            },
        ],
        
        sponsors: [
            {
            name: "Genesis DAO",
            logo: "title",
            description: "Leading Web3 innovation platform",
            },
            {
            name: "Cursor",
            logo: "platinum",
            description: "AI-powered code editor",
            },
            {
            name: "Vercel",
            logo: "platinum",
            description: "Frontend cloud platform",
            },
            {
            name: "Ethereum Foundation",
            logo: "gold",
            description: "Supporting Ethereum ecosystem",
            },
            {
            name: "Polygon",
            logo: "gold",
            description: "Scaling Ethereum solutions",
            },
            {
            name: "Chainlink",
            logo: "silver",
            description: "Decentralized oracle networks",
            },
            {
            name: "The Graph",
            logo: "silver",
            description: "Indexing protocol for Web3",
            },
            {
            name: "IPFS",
            logo: "bronze",
            description: "Distributed storage network",
            },
        ],
    },
    {
        id: "2",
        title: "Hyperliquid Community Hackathon",
        description: "Building on the blockchain to house all of finance. Create innovative solutions for decentralized finance.",
        detailedDescription: "The Hyperliquid Community Hackathon is an intensive 3-day event focused on building the future of decentralized finance. Participants will work with Hyperliquid's cutting-edge infrastructure to create innovative DeFi solutions.\n\nThis hackathon emphasizes high-performance trading systems, liquidity protocols, and user-friendly DeFi interfaces. Teams will have access to Hyperliquid's APIs, extensive documentation, and direct support from the core development team.\n\nWith a focus on real-world trading applications, participants are encouraged to build solutions that can handle institutional-grade volume and complexity while maintaining the decentralized principles that make DeFi revolutionary.",
        eligibility: ["Open For All"],
        organizer: "Hyperliquid Labs",
        startDate: "2025-01-20",
        endDate: "2025-01-22",
        location: "Penang, Malaysia",
        mode: "Physical",
        participants: 484,
        maxParticipants: 500,
        tags: ["Blockchain", "DeFi", "Trading", "Liquidity"],
        image: hackathonPicture2,
        status: "Closing Soon",
        timeLeft: "12 hours left",
        colorTheme: "teal",
        category: "FinTech",
        totalPrizePool: "250,000 USDT",
        level: "Intermediate",
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
            date: "20 Jan 2025",
            title: "Opening Ceremony",
            description: "Welcome, team formation, and technical briefings.",
            startDate: "Jan 20, 2025 09:00 AM GMT",
            endDate: "Jan 20, 2025 12:00 PM GMT"
            },
            {
            date: "21 Jan 2025",
            title: "Development Day",
            description: "Full day of coding with mentor support and workshops.",
            startDate: "Jan 21, 2025 09:00 AM GMT",
            endDate: "Jan 21, 2025 09:00 PM GMT"
            },
            {
            date: "22 Jan 2025",
            title: "Demo Day",
            description: "Project presentations and judging.",
            startDate: "Jan 22, 2025 10:00 AM GMT",
            endDate: "Jan 22, 2025 04:00 PM GMT"
            }
        ],
        importantDates: [
            {
            title: "Hackathon Starts",
            date: "Sep 20, 2025",
            time: "09:00 AM GMT",
            description: "Opening ceremony and team formation.",
            isUrgent: true
            },
            {
            title: "Submission Deadline",
            date: "Sep 22, 2025",
            time: "02:00 PM GMT",
            description: "Final deadline for all project submissions.",
            isUrgent: true
            }
        ],
        prizes: [
            {
              category: "Overall",
              position: "Winner",
              amount: "$50,000",
              items: ["Cash Prize", "Mentorship Program", "Certificate of Excellence"],
              type: "cash" as const,
              description: 'Chance for a coveted internship with the Tata Group, a Grand cash prize of INR 2,50,000, a coveted Tata Crucible Trophy and a luxury holiday experience at the Taj Hotels worth INR 50,000.'
            },
            {
              category: "Overall",
              position: "First Runner Up",
              amount: "$25,000",
              items: ["Cash Prize", "Pro Plan Access", "Certificate of Excellence"],
              type: "cash" as const,
            },
            {
              category: "Overall",
              position: "Second Runner Up",
              amount: "$15,000",
              items: ["Cash Prize", "Startup Credits", "Certificate of Excellence"],
              type: "cash" as const,
              description: 'Chance for a coveted internship with the Tata Group, a Grand cash prize of INR 2,50,000, a coveted Tata Crucible Trophy and a luxury holiday experience at the Taj Hotels worth INR 50,000.'
            },
            {
              category: "Best Innovation",
              position: "Winner",
              items: ["MacBook Pro M3", "Certificate of Innovation", "1-Year Pro Subscription"],
              type: "other" as const,
            },
          ],
        sponsors: [
            {
            name: "Hyperliquid Labs",
            logo: "title",
            description: "Advanced DeFi trading infrastructure"
            },
            {
            name: "Binance Labs",
            logo: "platinum",
            description: "Blockchain incubator and investment arm of Binance"
            }
        ],
        organizers: [
            {
            name: "David Liu",
            role: "Event Coordinator",
            email: "david@hyperliquid.xyz",
            phone: "+1-555-0456"
            }
        ]
    },
    {
        id: "3",
        title: "CopernicusLAC Panama Hackathon 2025",
        description: "Resolución de problemas en ALC sobre reducción del riesgo de desastres con datos de Copernicus.",
        detailedDescription: "Join the CopernicusLAC Panama Hackathon 2025, where technology meets environmental science to address critical disaster risk reduction challenges in Latin America and the Caribbean.\n\nThis unique hackathon leverages Copernicus satellite data and Earth observation technologies to create innovative solutions for natural disaster prevention, monitoring, and response. Participants will work with real satellite imagery, climate data, and advanced analytics tools.\n\nThe event brings together developers, data scientists, environmental experts, and policy makers to create practical solutions that can be implemented across the LAC region. All skill levels are welcome, with extensive mentorship and technical support provided.",
        eligibility: ["Engineering Students", "MBA Students", "Undergraduate", "Postgraduate"],
        organizer: "ESA & Copernicus",
        startDate: "2025-02-01",
        endDate: "2025-02-05",
        location: "Selangor, Malaysia",
        mode: "Online",
        participants: 314,
        maxParticipants: 1000,
        totalPrizePool: "RM100,000",
        tags: ["Space Tech", "Agriculture", "Sustainability", "Climate"],
        image: hackathonPicture3,
        status: "Open",
        timeLeft: "45 days left",
        colorTheme: "green",
        category: "Space & Science",
        level: "Beginner",
        requirements: [
            "Open to all skill levels",
            "Teams of 2-6 members",
            "Focus on LAC region challenges",
            "Must use Copernicus data"
        ],
        judgesCriteria: [
            "Innovation (30%)",
            "Technical Feasibility (30%)",
            "Social & Environmental Impact (20%)",
            "Use of Copernicus Data (20%)"
        ],
        timeline: [
            {
            date: "1 Feb 2025",
            title: "Virtual Kickoff",
            description: "Introduction to Copernicus data and challenge briefing.",
            startDate: "Feb 1, 2025 10:00 AM GMT",
            endDate: "Feb 1, 2025 12:00 PM GMT"
            },
            {
            date: "2-4 Feb 2025",
            title: "Development Phase",
            description: "Team coding with daily check-ins and mentor sessions.",
            startDate: "Feb 2, 2025 09:00 AM GMT",
            endDate: "Feb 4, 2025 08:00 PM GMT"
            },
            {
            date: "5 Feb 2025",
            title: "Final Presentations",
            description: "Project demos and expert panel judging.",
            startDate: "Feb 5, 2025 10:00 AM GMT",
            endDate: "Feb 5, 2025 05:00 PM GMT"
            }
        ],
        importantDates: [
            {
            title: "Kickoff & Challenge Briefing",
            date: "Oct 1, 2025",
            time: "10:00 AM GMT",
            description: "Overview of hackathon tracks, goals, and Copernicus data tools.",
            isUrgent: false
            },
            {
            title: "Submission Deadline",
            date: "Nov 5, 2025",
            time: "09:00 AM GMT",
            description: "Final submission of projects and documentation.",
            isUrgent: true
            }
        ],
        prizes: [
            {
              category: "Overall",
              position: "Winner",
              amount: "$50,000",
              items: ["Cash Prize", "Mentorship Program", "Certificate of Excellence"],
              type: "cash" as const,
              description: 'Chance for a coveted internship with the Tata Group, a Grand cash prize of INR 2,50,000, a coveted Tata Crucible Trophy and a luxury holiday experience at the Taj Hotels worth INR 50,000.'
            },
            {
              category: "Overall",
              position: "First Runner Up",
              amount: "$25,000",
              items: ["Cash Prize", "Pro Plan Access", "Certificate of Excellence"],
              type: "cash" as const,
              description: 'Chance for a coveted internship with the Tata Group, a Grand cash prize of INR 2,50,000, a coveted Tata Crucible Trophy and a luxury holiday experience at the Taj Hotels worth INR 50,000.'
            },
            {
              category: "Overall",
              position: "Second Runner Up",
              amount: "$15,000",
              items: ["Cash Prize", "Startup Credits", "Certificate of Excellence"],
              type: "certificate" as const,
            },
          ],
        sponsors: [
            {
            name: "European Space Agency",
            logo: "title",
            description: "European leader in Earth observation and space missions"
            },
            {
            name: "Copernicus Programme",
            logo: "platinum",
            description: "Global Earth observation program by the EU"
            }
        ],
        organizers: [
            {
            name: "Maria Rodriguez",
            role: "Program Manager",
            email: "maria@esa.int",
            phone: "+34-555-0678",
            }
        ]
    }  
];
