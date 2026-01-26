# HackerFlow - The Ultimate One Stop Solution for Hackathons 🚀

<div align="center">

**Malaysia's #1 AI-Powered Hackathon Platform**

*One Platform For All - Hack Smarter, Host Better!*

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) 

</div>

---

## 🌐 Live Website

**🔗 [Visit HackerFlow](https://hackerflow.vercel.app/)**

> **✨ Interactive Elements:** Explore the dynamic plasma background effects, hover animations, and interactive components throughout the platform!

---

## 📖 About The Project

**HackerFlow** is a comprehensive, AI-powered hackathon platform designed to revolutionize how developers discover events, form teams, and organizers manage hackathons across Malaysia. Built with modern web technologies and a focus on performance, user experience, and intelligent automation.

### 🎯 Core Mission

To create a seamless, intelligent ecosystem that connects developers with hackathon opportunities and helps organizers scale their events effortlessly. HackerFlow eliminates the friction points in hackathon participation—from discovery to team formation to event management.

### 💡 What Makes HackerFlow Unique

- **🤖 AI-Powered Team Matching**: Advanced compatibility algorithm analyzes GitHub profiles, skills, and experience to find perfect teammates
- **🎯 Centralized Discovery**: All Malaysian hackathons in one place with advanced filtering and search
- **👥 Dual-Role System**: Seamlessly switch between hacker and organizer roles
- **📊 Comprehensive Dashboards**: Real-time analytics, stats, and insights for both participants and organizers
- **🏆 Achievement System**: Badges, prizes, and recognition to gamify the hackathon experience
- **💬 Real-Time Collaboration**: Built-in chat, notifications, and team communication tools

---

## ✨ Features

### For Hackers 👨‍💻

- **🔍 Hackathon Discovery**
  - Browse and search hackathons across Malaysia
  - Advanced filtering by category, date, location, and prizes
  - Personalized recommendations based on your profile

- **🤖 AI-Powered Team Matching**
  - Tinder-style swipe interface for finding teammates
  - Compatibility scoring algorithm (0-100%) based on:
    - Skill overlap (30%)
    - Experience compatibility (20%)
    - GitHub activity (20%)
    - Hackathon interests (15%)
    - Location proximity (10%)
    - Recent activity (5%)
  - Real-time GitHub integration with contribution graphs
  - AI-generated match insights explaining compatibility

- **📊 Personal Dashboard**
  - Real-time stats: participations, wins, prize money, active hackathons
  - Performance charts: participation trends, win rates, category distribution
  - Upcoming deadlines with urgency indicators
  - Recent activity timeline
  - Achievement badges and recognition system

- **👥 Team Management**
  - View all team memberships
  - Team member details and profiles
  - Team communication tools

- **🏆 Prize Tracking**
  - Track prize money and payment status
  - Payment history and receipts
  - Winner certificates

### For Organizers 🎪

- **📅 Hackathon Management**
  - Create and publish hackathons
  - Manage registrations and participants
  - Track team formations
  - Set prizes and categories

- **📊 Analytics Dashboard**
  - Real-time participant statistics
  - Registration trends and insights
  - Category distribution analysis
  - Export functionality for data analysis

- **🏅 Winner Management**
  - Declare winners by category
  - Track payment status (pending → processing → credited)
  - Automated winner notifications
  - Payment integration with Stripe

- **👥 Participant Management**
  - View all participants and teams
  - Filter and search functionality
  - Export participant lists
  - Communication tools

### Shared Features 🌟

- **🔔 Real-Time Notifications**
  - Registration confirmations
  - Team invitations
  - Match notifications
  - Winner announcements
  - Payment updates

- **💬 AI Chatbot**
  - Get help with hackathon questions
  - AI-powered idea generation
  - Platform guidance and support

- **👤 Profile Management**
  - GitHub integration
  - Skills and experience showcase
  - Portfolio display
  - Privacy settings

- **🔐 Authentication & Security**
  - Secure authentication with Supabase
  - Role-based access control
  - Row-level security (RLS) policies
  - Password reset and email verification

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[ShadCN UI](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - Row-level security (RLS)
  - Storage for file uploads

### AI & Integrations
- **[OpenAI](https://openai.com/)** - AI-powered features
  - Team matching insights
  - Idea generation
  - Chatbot assistance
- **[GitHub API](https://docs.github.com/en/rest)** - Profile integration
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Resend](https://resend.com/)** - Email notifications

### Development Tools
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development
- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase Account** - [Create one here](https://supabase.com/)
- **GitHub Account** - For GitHub integration
- **OpenAI API Key** - For AI features (optional)
- **Stripe Account** - For payment processing (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hackerflow.git
   cd hackerflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OpenAI (optional)
   OPENAI_API_KEY=your_openai_api_key

   # Stripe (optional)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Resend (optional)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up Supabase Database**
   
   Apply the database migrations located in `supabase/migrations/`:
   - Connect to your Supabase project
   - Run the SQL migrations in order
   - Ensure RLS policies are enabled

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

The project includes comprehensive database migrations. Key tables include:

- `hackathons` - Hackathon events
- `teams` - Team formations
- `participants` - Hackathon participants
- `hackathon_winners` - Winner tracking
- `notifications` - User notifications
- `user_badges` - Achievement system
- `matches` - Team matching data
- `friends` - Social connections

All tables include Row-Level Security (RLS) policies for data protection.

---

## 📁 Project Structure

```
HackerFlow/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── chat/             # AI chat endpoints
│   │   ├── generate-idea/    # AI idea generation
│   │   └── stripe/           # Payment processing
│   ├── dashboard/            # Dashboard pages
│   │   ├── hacker/          # Hacker dashboard
│   │   └── organizer/       # Organizer dashboard
│   ├── auth/                # Authentication pages
│   ├── hackathons/          # Hackathon pages
│   ├── find-teammates/      # Team matching feature
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # ShadCN UI components
│   ├── hero-section.tsx     # Landing page hero
│   ├── features-section.tsx # Features showcase
│   └── ...
├── lib/                     # Utility libraries
│   ├── actions/             # Server actions
│   ├── supabase/            # Supabase client & migrations
│   ├── stripe/              # Stripe integration
│   └── utils.ts             # Helper functions
├── hooks/                   # Custom React hooks
├── assets/                  # Static assets
├── supabase/                # Database migrations
│   └── migrations/          # SQL migration files
└── public/                  # Public assets
```

---

## 🎨 Key Features Deep Dive

### AI-Powered Matching Algorithm

The compatibility scoring system analyzes multiple factors:

```typescript
Compatibility Score = 
  Skill Overlap (30%) +
  Experience Compatibility (20%) +
  GitHub Activity (20%) +
  Hackathon Interests (15%) +
  Location Proximity (10%) +
  Recent Activity (5%)
```

### Dual-Role System

Users can seamlessly switch between hacker and organizer roles:
- Automatic role detection based on activity
- Role-specific dashboards and features
- Unified notification system
- Shared profile and settings

### Real-Time Updates

- Live notifications via Supabase real-time subscriptions
- Instant team match detection
- Real-time hackathon updates
- Payment status tracking

---

## 🎓 Learning Outcomes

This project demonstrates expertise in:

- **⚡ Performance Optimization**
  - Next.js server-side rendering (SSR) and static site generation (SSG)
  - Image optimization and lazy loading
  - Code splitting and bundle optimization
  - Turbopack for faster development builds

- **🎨 Modern UI/UX**
  - Responsive design principles
  - Smooth animations with Framer Motion
  - Interactive plasma background effects
  - Glassmorphism and gradient designs
  - Accessible components with Radix UI

- **🤖 AI Integration**
  - OpenAI API integration for intelligent features
  - Custom compatibility algorithms
  - AI-powered content generation
  - Natural language processing

- **🔒 Security Best Practices**
  - Row-level security (RLS) policies
  - Secure authentication flows
  - API route protection
  - Input validation with Zod

- **📊 Data Management**
  - Complex database relationships
  - Efficient query optimization
  - Real-time data synchronization
  - Server actions for data mutations

- **💳 Payment Integration**
  - Stripe payment processing
  - Payment status tracking
  - Automated payment workflows

---

<div align="center">

**Built with ❤️ for the Malaysian developer community**

⭐ Star this repo if you find it helpful!

</div>

