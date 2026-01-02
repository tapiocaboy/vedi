# Vedi Frontend

React 18+ TypeScript frontend for the Vedic Astrology application.

## Features

- **Birth Chart Visualization**
  - South Indian chart style
  - North Indian chart style
  - Interactive planet positions
  
- **Dasha Timeline**
  - Current running Mahadasha/Antardasha/Pratyantardasha
  - Expandable timeline with all periods
  - Visual indicators for current period

- **Modern UI**
  - Tailwind CSS with custom Vedic theme
  - Framer Motion animations
  - Responsive design

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The development server runs on `http://localhost:3000` and proxies API requests to `http://localhost:8000`.

Make sure the backend is running before starting the frontend.

## Project Structure

```
src/
├── components/
│   ├── Chart/
│   │   ├── SouthIndianChart.tsx
│   │   ├── NorthIndianChart.tsx
│   │   └── PlanetTable.tsx
│   ├── Dasha/
│   │   ├── CurrentDasha.tsx
│   │   ├── DashaTimeline.tsx
│   │   └── NakshatraInfo.tsx
│   └── Forms/
│       └── BirthDataForm.tsx
├── hooks/
│   └── useChart.ts
├── services/
│   └── api.ts
├── types/
│   └── astrology.ts
├── utils/
│   └── dateUtils.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Dependencies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching & caching
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **Lucide React** - Icons

