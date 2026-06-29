# PortalHub Cinema

Your Gateway to Unlimited Entertainment -- a modern single-page web application for discovering movies, TV shows, and streaming content. Built with React, powered by the [TMDB API](https://www.themoviedb.org/).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** >= 18.x (recommended: 20.x LTS)
- **npm** >= 9.x (comes with Node.js)

You can verify by running:

```bash
node --version
npm --version
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Asm0d3usX/CloudX-PortalHub.git
cd CloudX-PortalHub
```

> If the actual repository URL differs, replace it with the correct one.

### 2. Set Up Environment Variables

Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your TMDB API credentials:

```env
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_ACCESS_TOKEN=your_access_token_here
```

To get your free credentials:
1. Go to [TMDB Settings API](https://www.themoviedb.org/settings/api)
2. Create an account or log in
3. Generate an API key and Access Token
4. Paste them into your `.env` file

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (default: `http://localhost:5173`).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Type-check the project and create a production build |
| `npm run typecheck` | Run TypeScript type checking without emitting files |
| `npm run preview` | Preview the production build locally |

### Production Build

```bash
npm run build
```

Output is written to the `dist/` directory, ready to be deployed to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.).

## Project Structure

```
portalhub-cinema/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables (not committed)
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Root component with providers
│   ├── index.css           # Global styles (Tailwind + custom)
│   ├── api/                # API clients and endpoint definitions
│   ├── components/         # Reusable UI components
│   │   └── ui/             # shadcn/ui component primitives
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layout components
│   ├── lib/                # Utility functions (cn, etc.)
│   ├── pages/              # Route page components
│   ├── routes/             # Route definitions
│   ├── services/           # Data-fetching service functions
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper/formatting utilities
└── public/                 # Static assets
```

## External APIs

This application consumes the following third-party APIs:

- **[TMDB API v3](https://developer.themoviedb.org/reference/intro/getting-started)** -- Movie, TV show, genre, and search data
- **[CloudX Repository](https://github.com/Asm0d3usX/CloudX)** -- Community streaming server plugins

No backend or database is required -- the application is entirely client-side.

## Troubleshooting

**Images not loading?**
Ensure your TMDB API credentials are set correctly in `.env`. Images are served from `image.tmdb.org` and require a valid configuration.

**Build errors?**
Run `npm run typecheck` to see only TypeScript errors without the full build. Fix any type issues before running `npm run build`.

**Port already in use?**
Vite will prompt you to use the next available port. Alternatively, specify a port:

```bash
npx vite --port 3000
```

## License

This project is for educational and personal use. TMDB and all related content are property of their respective owners. Use the TMDB API in accordance with their [terms of service](https://www.themoviedb.org/terms-of-use).