import { MatchProfile } from './actions/matchmaking-actions'

export const mockMatchProfiles: MatchProfile[] = [
  {
    user_id: 'mock-user-1',
    full_name: 'Sarah Chen',
    age: 22,
    bio: 'Full-stack developer passionate about AI and creating impactful solutions. Love hackathons and building with cutting-edge tech!',
    city: 'Kuala Lumpur',
    state: 'Selangor',
    country: 'Malaysia',
    position: 'Software Engineer',
    company: 'TechCorp',
    programming_languages: ['Python', 'JavaScript', 'TypeScript', 'Go'],
    frameworks: ['React', 'Node.js', 'TensorFlow', 'FastAPI'],
    experience_level: 'Advanced',
    github_username: 'sarahchen',
    profileImage: null,
    hackathonStats: {
      participated: 12,
      won: 4,
      winRate: 33.3,
      recentHackathon: 'AI Malaysia Hackathon 2024',
      favoriteCategories: ['AI/ML', 'Web Development', 'Blockchain']
    },
    githubStats: {
      repositories: 45,
      contributions: 892,
      followers: 156,
      topLanguages: ['Python', 'JavaScript', 'TypeScript']
    },
    compatibilityScore: 94,
    matchingFactors: {
      sharedLanguages: ['Python', 'JavaScript', 'TypeScript'],
      sharedFrameworks: ['React', 'Node.js'],
      complementarySkills: {
        userUniqueSkills: [],
        targetUniqueSkills: ['Go', 'TensorFlow']
      },
      experienceGap: 2,
      locationMatch: 'same_city',
      githubActivityLevel: 'both_active',
      sharedInterests: ['AI/ML', 'Web Development'],
      strengthAreas: ['Python', 'JavaScript', 'React'],
      whyGreatTogether: [
        'You both excel in Python and JavaScript',
        'Complementary AI and web development skills',
        'Both based in Kuala Lumpur',
        'Similar hackathon experience level',
        'Both actively contributing on GitHub'
      ]
    },
    recentProjects: [
      {
        name: 'AI Chat Assistant',
        description: 'GPT-powered chatbot with custom training for customer support automation',
        techStack: ['Python', 'TensorFlow', 'React', 'FastAPI'],
        awards: ['Best AI Project'],
        stars: 234,
        url: 'https://github.com/mock/ai-chat'
      },
      {
        name: 'DeFi Dashboard',
        description: 'Real-time cryptocurrency portfolio tracker with smart contract integration',
        techStack: ['React', 'Node.js', 'Web3.js', 'Solidity'],
        awards: [],
        stars: 89,
        url: 'https://github.com/mock/defi-dashboard'
      }
    ]
  },
  {
    user_id: 'mock-user-2',
    full_name: 'Ahmad Rizal',
    age: 24,
    bio: 'Backend enthusiast and cloud architect. Building scalable systems and exploring serverless architectures. Always up for a hackathon challenge!',
    city: 'Kuala Lumpur',
    state: 'Selangor',
    country: 'Malaysia',
    position: 'Backend Developer',
    company: 'CloudSolutions',
    programming_languages: ['Go', 'Python', 'Java', 'Rust'],
    frameworks: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
    experience_level: 'Advanced',
    github_username: 'ahmadrizal',
    profileImage: null,
    hackathonStats: {
      participated: 15,
      won: 5,
      winRate: 33.3,
      recentHackathon: 'Cloud Native Hackathon 2024',
      favoriteCategories: ['Cloud Computing', 'DevOps', 'Backend']
    },
    githubStats: {
      repositories: 67,
      contributions: 1245,
      followers: 203,
      topLanguages: ['Go', 'Python', 'Java']
    },
    compatibilityScore: 87,
    matchingFactors: {
      sharedLanguages: ['Python', 'Go'],
      sharedFrameworks: [],
      complementarySkills: {
        userUniqueSkills: ['JavaScript', 'TypeScript'],
        targetUniqueSkills: ['Java', 'Rust', 'Kubernetes']
      },
      experienceGap: 3,
      locationMatch: 'same_city',
      githubActivityLevel: 'both_active',
      sharedInterests: [],
      strengthAreas: ['Python', 'Backend Development'],
      whyGreatTogether: [
        'Complementary backend/frontend skills',
        'Both based in Kuala Lumpur',
        'Similar hackathon win rates',
        'Both actively contributing on GitHub'
      ]
    },
    recentProjects: [
      {
        name: 'Microservices Platform',
        description: 'Scalable microservices architecture with service mesh and observability',
        techStack: ['Go', 'Kubernetes', 'Docker', 'Prometheus'],
        awards: ['Best Infrastructure'],
        stars: 178,
        url: 'https://github.com/mock/microservices'
      }
    ]
  },
  {
    user_id: 'mock-user-3',
    full_name: 'Mei Ling Wong',
    age: 21,
    bio: 'UI/UX designer who codes! Creating beautiful and functional interfaces. Love participating in design hackathons and collaborative projects.',
    city: 'Penang',
    state: 'Penang',
    country: 'Malaysia',
    university: 'Universiti Sains Malaysia',
    course: 'Computer Science',
    graduation_year: 2025,
    programming_languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
    frameworks: ['React', 'Next.js', 'Tailwind CSS', 'Figma'],
    experience_level: 'Intermediate',
    github_username: 'meilingw',
    profileImage: null,
    hackathonStats: {
      participated: 8,
      won: 2,
      winRate: 25,
      recentHackathon: 'Design Hackathon Malaysia 2024',
      favoriteCategories: ['UI/UX', 'Web Development', 'Mobile Apps']
    },
    githubStats: {
      repositories: 28,
      contributions: 456,
      followers: 92,
      topLanguages: ['JavaScript', 'TypeScript', 'CSS']
    },
    compatibilityScore: 78,
    matchingFactors: {
      sharedLanguages: ['JavaScript', 'TypeScript'],
      sharedFrameworks: ['React'],
      complementarySkills: {
        userUniqueSkills: ['Python', 'Go'],
        targetUniqueSkills: ['UI/UX Design', 'Tailwind CSS']
      },
      experienceGap: 4,
      locationMatch: 'same_country',
      githubActivityLevel: 'one_active',
      sharedInterests: ['Web Development'],
      strengthAreas: ['JavaScript', 'React'],
      whyGreatTogether: [
        'You both excel in JavaScript and React',
        'Complementary design and development skills',
        'Both in Malaysia',
        'Shared interest in Web Development'
      ]
    },
    recentProjects: [
      {
        name: 'Design System Library',
        description: 'Comprehensive React component library with Storybook documentation',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook'],
        awards: [],
        stars: 145,
        url: 'https://github.com/mock/design-system'
      }
    ]
  },
  {
    user_id: 'mock-user-4',
    full_name: 'Raj Kumar',
    age: 23,
    bio: 'Mobile app developer specializing in cross-platform solutions. Building apps that make a difference in people\'s lives.',
    city: 'Kuala Lumpur',
    state: 'Selangor',
    country: 'Malaysia',
    position: 'Mobile Developer',
    company: 'AppsTech',
    programming_languages: ['Dart', 'JavaScript', 'Swift', 'Kotlin'],
    frameworks: ['Flutter', 'React Native', 'Firebase'],
    experience_level: 'Intermediate',
    github_username: 'rajkumar',
    profileImage: null,
    hackathonStats: {
      participated: 10,
      won: 3,
      winRate: 30,
      recentHackathon: 'Mobile Innovation Hackathon 2024',
      favoriteCategories: ['Mobile Apps', 'IoT', 'Health Tech']
    },
    githubStats: {
      repositories: 34,
      contributions: 623,
      followers: 118,
      topLanguages: ['Dart', 'JavaScript', 'Swift']
    },
    compatibilityScore: 82,
    matchingFactors: {
      sharedLanguages: ['JavaScript'],
      sharedFrameworks: ['Firebase'],
      complementarySkills: {
        userUniqueSkills: ['Python', 'Go'],
        targetUniqueSkills: ['Dart', 'Flutter', 'Swift']
      },
      experienceGap: 2,
      locationMatch: 'same_city',
      githubActivityLevel: 'both_active',
      sharedInterests: [],
      strengthAreas: ['JavaScript', 'Mobile Development'],
      whyGreatTogether: [
        'Complementary web and mobile skills',
        'Both based in Kuala Lumpur',
        'Similar hackathon experience',
        'Both actively contributing on GitHub'
      ]
    },
    recentProjects: [
      {
        name: 'Health Tracker App',
        description: 'Cross-platform health monitoring app with AI-powered insights',
        techStack: ['Flutter', 'Firebase', 'TensorFlow Lite'],
        awards: ['Best Health Tech App'],
        stars: 267,
        url: 'https://github.com/mock/health-tracker'
      }
    ]
  },
  {
    user_id: 'mock-user-5',
    full_name: 'Emily Tan',
    age: 20,
    bio: 'Aspiring data scientist exploring the world of machine learning and data visualization. Learning and growing through hackathons!',
    city: 'Johor Bahru',
    state: 'Johor',
    country: 'Malaysia',
    university: 'Universiti Teknologi Malaysia',
    course: 'Data Science',
    graduation_year: 2026,
    programming_languages: ['Python', 'R', 'SQL'],
    frameworks: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'],
    experience_level: 'Beginner',
    github_username: 'emilytan',
    profileImage: null,
    hackathonStats: {
      participated: 4,
      won: 1,
      winRate: 25,
      recentHackathon: 'Data Science Challenge 2024',
      favoriteCategories: ['Data Science', 'AI/ML', 'Analytics']
    },
    githubStats: {
      repositories: 15,
      contributions: 234,
      followers: 45,
      topLanguages: ['Python', 'R']
    },
    compatibilityScore: 65,
    matchingFactors: {
      sharedLanguages: ['Python'],
      sharedFrameworks: [],
      complementarySkills: {
        userUniqueSkills: ['JavaScript', 'TypeScript'],
        targetUniqueSkills: ['R', 'SQL', 'Data Analysis']
      },
      experienceGap: 8,
      locationMatch: 'same_country',
      githubActivityLevel: 'both_moderate',
      sharedInterests: ['AI/ML'],
      strengthAreas: ['Python'],
      whyGreatTogether: [
        'You both use Python',
        'Shared interest in AI/ML',
        'Complementary skills for full-stack ML projects'
      ]
    },
    recentProjects: [
      {
        name: 'Customer Churn Prediction',
        description: 'Machine learning model to predict customer churn with 89% accuracy',
        techStack: ['Python', 'Scikit-learn', 'Pandas', 'Flask'],
        awards: [],
        stars: 67,
        url: 'https://github.com/mock/churn-prediction'
      }
    ]
  }
]
