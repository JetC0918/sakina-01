# Sakina - AI-Powered Wellness Companion

<p align="center">
  <strong>Proactive emotional support to prevent burnout before it takes hold</strong>
</p>

Sakina is an AI-powered wellness companion designed for young professionals in Saudi Arabia. Unlike traditional wellness apps that require users to diagnose themselves or navigate complex menus, Sakina acts as a wise, grounded companion that listens for subtle signals of exhaustion and proactively intervenes with calming resets.

## ✨ Features

- **Voice & Text Journaling** - Record voice notes or type free-form reflections to express your feelings
- **Stress Signal Detection** - AI-powered analysis of tone, frequency, and patterns to detect rising stress
- **Proactive AI Nudges** - Timely, warm interventions triggered based on detected emotional fatigue
- **Micro-Interventions** - 1-3 minute breathing and grounding exe  rcises tailored to your context
- **Bio Load Tracking** - Visual representation of your emotional load with actionable insights
- **Theme Support** - Light, dark, and system-adaptive themes
- **Multi-Language** - English and Arabic (RTL) support
- **Authentication** - Email/password and Google Sign-In via Supabase

## 🛠️ Tech Stack

This project is built with modern web technologies:

| Category | Technology |
|----------|------------|
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **UI Framework** | [React 18](https://react.dev/) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Authentication** | [Supabase](https://supabase.com/) |
| **State Management** | React Context + Local Storage |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |

## 📁 Project Structure

```
design-build-blueprint/
├── src/
│   ├── components/
│   │   ├── app/                    # App dashboard components
│   │   │   ├── insights/           # Insights page components
│   │   │   ├── journal/            # Journal page components (JournalEntry, MoodSelector, etc.)
│   │   │   ├── BioFeedbackPanel.tsx
│   │   │   ├── ContentLoader.tsx   # Loading animation for content area
│   │   │   ├── MobileNav.tsx       # Mobile navigation bar
│   │   │   ├── Sidebar.tsx         # Collapsible sidebar with hover/pin states
│   │   │   └── TopBar.tsx
│   │   ├── interventions/          # Calm exercise components
│   │   │   ├── BreathingExercise.tsx
│   │   │   ├── GroundingExercise.tsx
│   │   │   ├── InterventionCard.tsx
│   │   │   ├── InterventionDialog.tsx
│   │   │   └── TimerExercise.tsx
│   │   ├── landing/                # Landing page sections
│   │   │   ├── Download.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── HowItWorks.tsx
│   │   ├── ui/                     # shadcn/ui component library (50+ components)
│   │   ├── AuthModal.tsx           # Authentication modal (Sign In/Sign Up with Google)
│   │   ├── NavLink.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── SakinaLogo.tsx
│   ├── context/
│   │   ├── AuthContext.tsx         # Authentication state (Supabase)
│   │   └── SakinaContext.tsx       # App state (journal, interventions, settings)
│   ├── data/
│   │   └── interventions.ts        # Intervention data definitions
│   ├── hooks/
│   │   ├── use-mobile.tsx          # Mobile detection hook
│   │   ├── use-toast.ts            # Toast notification hook
│   │   ├── useLocalStorage.ts      # Persistent local storage hook
│   │   └── useSakina.ts            # Main app state hook
│   ├── layouts/
│   │   └── AppLayout.tsx           # Main app layout with sidebar
│   ├── lib/
│   │   ├── animation-utils.ts      # Framer Motion animation helpers
│   │   ├── gemini-client.ts        # Gemini AI client for analysis
│   │   ├── mock-bio-data.ts        # Mock biofeedback data
│   │   ├── mood-utils.ts           # Mood utilities and helpers
│   │   ├── supabaseClient.ts       # Supabase client configuration
│   │   └── utils.ts                # General utilities (cn, etc.)
│   ├── pages/
│   │   ├── app/                    # Authenticated app pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Insights.tsx
│   │   │   ├── Interventions.tsx
│   │   │   ├── Journal.tsx
│   │   │   └── Settings.tsx
│   │   ├── Auth.tsx                # Auth page (fallback)
│   │   ├── Index.tsx               # Landing page
│   │   └── NotFound.tsx
│   ├── test/                       # Test utilities and setup
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── public/                         # Static assets
├── design.json                     # Design tokens and component specifications
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd design-build-blueprint

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## 🎨 Design System

Sakina follows a **soft minimalism** design philosophy with a focus on:

- **Card-based UI** - Content organized in clean, rounded cards
- **Friendly healthcare aesthetic** - Calm, trustworthy, and professional tone
- **High accessibility** - Large touch targets, high contrast, responsive font scaling
- **Warm color palette** - Primary yellow (#FFEB3B), soft blue accents (#6BB7F5)

Design tokens and component specifications are defined in `design.json`.

## 📱 App Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Public marketing page |
| `/app/dashboard` | Dashboard | Main hub with bio status and quick actions |
| `/app/journal` | Journal | Voice and text journaling interface |
| `/app/calm` | Calm | Breathing exercises and interventions |
| `/app/insights` | Insights | Stress patterns and analytics |
| `/app/settings` | Settings | Preferences and account settings |

## 🔒 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## 📄 License

This project is private and proprietary.

---

<p align="center">
  <em>"When I was overwhelmed, I didn't need another tool telling me to figure it out myself. I needed something that noticed when I was going quiet and stepped in before I crashed."</em>
</p>
