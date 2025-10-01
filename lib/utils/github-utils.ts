import { GitHubProject } from '@/lib/actions/profile-actions'

// Mock GitHub repositories for development/testing
export function getMockGitHubRepositories(): GitHubProject[] {
  return [
    {
      id: 1,
      name: "e-commerce-app",
      full_name: "johndoe/e-commerce-app",
      description: "Full-stack e-commerce application built with React and Node.js",
      language: "JavaScript",
      stars_count: 24,
      forks_count: 8,
      watchers_count: 12,
      open_issues_count: 3,
      size: 15420,
      default_branch: "main",
      topics: ["react", "nodejs", "mongodb", "ecommerce"],
      homepage: "https://ecommerce-demo.vercel.app",
      html_url: "https://github.com/johndoe/e-commerce-app",
      clone_url: "https://github.com/johndoe/e-commerce-app.git",
      ssh_url: "git@github.com:johndoe/e-commerce-app.git",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T14:22:00Z",
      pushed_at: "2024-01-20T14:22:00Z",
      is_private: false,
      is_fork: false,
      is_archived: false,
      is_disabled: false,
    },
    {
      id: 2,
      name: "ml-price-predictor",
      full_name: "johndoe/ml-price-predictor",
      description: "Machine learning model to predict house prices using Python",
      language: "Python",
      stars_count: 15,
      forks_count: 3,
      watchers_count: 8,
      open_issues_count: 1,
      size: 8750,
      default_branch: "main",
      topics: ["python", "machine-learning", "sklearn", "data-science"],
      homepage: undefined,
      html_url: "https://github.com/johndoe/ml-price-predictor",
      clone_url: "https://github.com/johndoe/ml-price-predictor.git",
      ssh_url: "git@github.com:johndoe/ml-price-predictor.git",
      created_at: "2024-01-10T09:15:00Z",
      updated_at: "2024-01-18T16:45:00Z",
      pushed_at: "2024-01-18T16:45:00Z",
      is_private: false,
      is_fork: false,
      is_archived: false,
      is_disabled: false,
    },
    {
      id: 3,
      name: "mobile-weather-app",
      full_name: "johndoe/mobile-weather-app",
      description: "React Native weather app with location-based forecasts",
      language: "TypeScript",
      stars_count: 8,
      forks_count: 2,
      watchers_count: 5,
      open_issues_count: 0,
      size: 12300,
      default_branch: "main",
      topics: ["react-native", "typescript", "weather-api", "mobile"],
      homepage: undefined,
      html_url: "https://github.com/johndoe/mobile-weather-app",
      clone_url: "https://github.com/johndoe/mobile-weather-app.git",
      ssh_url: "git@github.com:johndoe/mobile-weather-app.git",
      created_at: "2024-01-05T11:20:00Z",
      updated_at: "2024-01-19T13:30:00Z",
      pushed_at: "2024-01-19T13:30:00Z",
      is_private: false,
      is_fork: false,
      is_archived: false,
      is_disabled: false,
    },
    {
      id: 4,
      name: "blockchain-voting",
      full_name: "johndoe/blockchain-voting",
      description: "Decentralized voting system built on Ethereum",
      language: "Solidity",
      stars_count: 32,
      forks_count: 12,
      watchers_count: 18,
      open_issues_count: 5,
      size: 22100,
      default_branch: "main",
      topics: ["blockchain", "ethereum", "solidity", "web3", "voting"],
      homepage: "https://voting-dapp.vercel.app",
      html_url: "https://github.com/johndoe/blockchain-voting",
      clone_url: "https://github.com/johndoe/blockchain-voting.git",
      ssh_url: "git@github.com:johndoe/blockchain-voting.git",
      created_at: "2023-12-20T14:10:00Z",
      updated_at: "2024-01-17T10:15:00Z",
      pushed_at: "2024-01-17T10:15:00Z",
      is_private: false,
      is_fork: false,
      is_archived: false,
      is_disabled: false,
    },
    {
      id: 5,
      name: "ai-chatbot",
      full_name: "johndoe/ai-chatbot",
      description: "AI-powered chatbot using OpenAI GPT API",
      language: "Python",
      stars_count: 18,
      forks_count: 6,
      watchers_count: 10,
      open_issues_count: 2,
      size: 9650,
      default_branch: "main",
      topics: ["python", "ai", "openai", "chatbot", "nlp"],
      homepage: undefined,
      html_url: "https://github.com/johndoe/ai-chatbot",
      clone_url: "https://github.com/johndoe/ai-chatbot.git",
      ssh_url: "git@github.com:johndoe/ai-chatbot.git",
      created_at: "2024-01-12T16:30:00Z",
      updated_at: "2024-01-21T09:45:00Z",
      pushed_at: "2024-01-21T09:45:00Z",
      is_private: false,
      is_fork: false,
      is_archived: false,
      is_disabled: false,
    },
    {
      id: 6,
      name: "portfolio-website",
      full_name: "johndoe/portfolio-website",
      description: "Personal portfolio website built with Next.js",
      language: "TypeScript",
      stars_count: 5,
      forks_count: 1,
      watchers_count: 3,
      open_issues_count: 0,
      size: 4200,
      default_branch: "main",
      topics: ["nextjs", "typescript", "portfolio", "personal"],
      homepage: "https://johndoe.dev",
      html_url: "https://github.com/johndoe/portfolio-website",
      clone_url: "https://github.com/johndoe/portfolio-website.git",
      ssh_url: "git@github.com:johndoe/portfolio-website.git",
      created_at: "2023-11-15T12:00:00Z",
      updated_at: "2024-01-16T15:20:00Z",
      pushed_at: "2024-01-16T15:20:00Z",
      is_private: false,
      is_fork: false,
      is_archived: false,
      is_disabled: false,
    }
  ]
}

// Analyze GitHub repositories to extract skills
export function analyzeGitHubRepositories(repositories: GitHubProject[]) {
  const skills = {
    programmingLanguages: new Set<string>(),
    frameworks: new Set<string>(),
    topics: new Set<string>()
  }

  // Common language mappings
  const languageMap: { [key: string]: string } = {
    'JavaScript': 'JavaScript',
    'TypeScript': 'TypeScript',
    'Python': 'Python',
    'Java': 'Java',
    'C++': 'C++',
    'C#': 'C#',
    'Go': 'Go',
    'Rust': 'Rust',
    'PHP': 'PHP',
    'Swift': 'Swift',
    'Kotlin': 'Kotlin',
    'Dart': 'Dart',
    'Ruby': 'Ruby',
    'C': 'C',
    'Scala': 'Scala',
    'R': 'R',
    'Solidity': 'Solidity',
    'HTML': 'HTML',
    'CSS': 'CSS',
    'Shell': 'Shell',
    'PowerShell': 'PowerShell'
  }

  // Common framework/tool mappings
  const frameworkMap: { [key: string]: string } = {
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'nextjs': 'Next.js',
    'nuxt': 'Nuxt.js',
    'svelte': 'Svelte',
    'nodejs': 'Node.js',
    'express': 'Express',
    'django': 'Django',
    'flask': 'Flask',
    'spring': 'Spring',
    'laravel': 'Laravel',
    'rails': 'Rails',
    'fastapi': 'FastAPI',
    'tensorflow': 'TensorFlow',
    'pytorch': 'PyTorch',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'Google Cloud',
    'firebase': 'Firebase',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'redis': 'Redis',
    'elasticsearch': 'Elasticsearch',
    'graphql': 'GraphQL',
    'apollo': 'Apollo',
    'prisma': 'Prisma',
    'typeorm': 'TypeORM',
    'sequelize': 'Sequelize',
    'jest': 'Jest',
    'cypress': 'Cypress',
    'webpack': 'Webpack',
    'vite': 'Vite',
    'eslint': 'ESLint',
    'prettier': 'Prettier',
    'tailwindcss': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'material-ui': 'Material-UI',
    'chakra-ui': 'Chakra UI',
    'ant-design': 'Ant Design'
  }

  repositories.forEach(repo => {
    // Add programming language
    if (repo.language && languageMap[repo.language]) {
      skills.programmingLanguages.add(languageMap[repo.language])
    }

    // Add topics as frameworks/tools
    repo.topics.forEach(topic => {
      const lowerTopic = topic.toLowerCase()
      if (frameworkMap[lowerTopic]) {
        skills.frameworks.add(frameworkMap[lowerTopic])
      } else {
        skills.topics.add(topic)
      }
    })

    // Add common patterns from repository names and descriptions
    const repoText = `${repo.name} ${repo.description || ''}`.toLowerCase()
    
    // Check for common frameworks in repo name/description
    Object.entries(frameworkMap).forEach(([key, value]) => {
      if (repoText.includes(key)) {
        skills.frameworks.add(value)
      }
    })
  })

  return {
    programmingLanguages: Array.from(skills.programmingLanguages),
    frameworks: Array.from(skills.frameworks),
    topics: Array.from(skills.topics)
  }
}
