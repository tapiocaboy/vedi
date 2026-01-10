# वेदी (Vedi) - Vedic Astrology Software

A full-stack Vedic Astrology application with accurate astronomical calculations for zodiac positions, Vimshottari Dasha, and Antardasha periods using traditional Jyotish methods.

![Vedic Astrology](https://img.shields.io/badge/Vedic-Astrology-saffron)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![React](https://img.shields.io/badge/React-18+-cyan)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green)

## Features

- 🌟 **Accurate Planetary Positions** - Swiss Ephemeris for arcsecond-level precision
- 🔮 **Sidereal Zodiac** - True Vedic calculations with Lahiri, Krishnamurti, or Raman ayanamsa
- 📊 **Birth Charts** - South Indian and North Indian chart styles
- 🌙 **Nakshatra System** - All 27 lunar mansions with pada calculations
- ⏳ **Vimshottari Dasha** - Complete Mahadasha/Antardasha/Pratyantardasha timeline
- 🎨 **Beautiful UI** - Modern, responsive design with traditional aesthetics

## Tech Stack

- **Backend**: Python 3.11+ with FastAPI
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom Vedic theme
- **Ephemeris**: Swiss Ephemeris (pyswisseph)
- **State Management**: TanStack Query (React Query)

## Quick Start

### 🐳 Docker Setup (Recommended)

For the easiest setup, use Docker:

**Linux/macOS:**
```bash
docker-compose up --build
```

**Windows:**
```cmd
# Using batch script (recommended)
docker-run.bat

# Or using PowerShell
.\docker-run.ps1

# Or manually
docker-compose -f docker-compose.windows.yml up --build
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

See [README-Windows.md](README-Windows.md) for detailed Windows setup instructions.

### Manual Setup

#### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Run the server
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Using Docker

```bash
# Build and run both services
docker-compose up --build

# Or run in background
docker-compose up -d
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chart` | POST | Generate complete birth chart |
| `/api/v1/dasha/timeline` | POST | Get full Dasha timeline |
| `/api/v1/dasha/current` | POST | Get current running periods |
| `/api/v1/planets` | POST | Get planetary positions only |
| `/api/v1/nakshatra` | POST | Get Moon's nakshatra |

### Example Request

```bash
curl -X POST "http://localhost:8000/api/v1/chart" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "1990-05-15T10:30:00",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "Asia/Kolkata",
    "ayanamsa": "LAHIRI"
  }'
```

## Project Structure

```
vedi/
├── backend/
│   ├── src/
│   │   ├── core/           # Astronomical calculations
│   │   │   ├── ephemeris.py    # Swiss Ephemeris integration
│   │   │   ├── rashi.py        # Zodiac sign calculations
│   │   │   ├── nakshatra.py    # Lunar mansion calculations
│   │   │   └── dasha.py        # Vimshottari Dasha system
│   │   ├── api/            # FastAPI routes
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── tests/
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chart/      # Chart visualizations
│   │   │   ├── Dasha/      # Dasha timeline components
│   │   │   └── Forms/      # Input forms
│   │   ├── hooks/          # React Query hooks
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Calculations

### Ayanamsa Support

| System | Description |
|--------|-------------|
| Lahiri (Chitrapaksha) | Most widely used, Indian government standard |
| Krishnamurti (KP) | K.P. System calculations |
| Raman | B.V. Raman's ayanamsa |

### Vimshottari Dasha Periods

| Planet | Years |
|--------|-------|
| Ketu | 7 |
| Venus | 20 |
| Sun | 6 |
| Moon | 10 |
| Mars | 7 |
| Rahu | 18 |
| Jupiter | 16 |
| Saturn | 19 |
| Mercury | 17 |
| **Total** | **120** |

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Test Coverage

```bash
pytest tests/ --cov=src --cov-report=html
```

## Accuracy Notes

- **Ephemeris**: Uses Swiss Ephemeris (JPL DE431) for maximum accuracy
- **Precision**: Planetary positions accurate to arcseconds for modern dates
- **Ayanamsa**: All calculations automatically adjusted for precession
- **Validation**: Cross-verified against Jagannatha Hora software

## References

- [Swiss Ephemeris](https://www.astro.com/swisseph/)
- [Brihat Parashara Hora Shastra](https://en.wikipedia.org/wiki/Brihat_Parashara_Hora_Shastra) - Classical reference
- Lahiri Ayanamsa - Indian government standard

## License

MIT License - feel free to use for personal and commercial projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  <strong>ॐ</strong><br>
  <em>Made with devotion for Jyotish</em>
</p>

