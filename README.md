# NEW ERA - E-commerce Platform

A modern e-commerce platform built with React, TailwindCSS, and Supabase.

## Features

- 🛍️ Product catalog with filtering and search
- 🛒 Shopping cart with persistent storage
- 👤 User authentication (login/register)
- 💳 Stripe payment integration
- 📊 Admin dashboard for product management
- 📱 Responsive design
- 🎨 Modern UI with TailwindCSS

## Tech Stack

- **Frontend:** React 19, TailwindCSS v4, Vite
- **Backend:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Deployment:** Edge Functions for serverless API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── hooks/          # Custom hooks
│   ├── services/       # API services
│   ├── assets/         # Static assets
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
├── public/             # Public assets
├── index.html          # HTML template
└── package.json        # Dependencies
```

## License

MIT
