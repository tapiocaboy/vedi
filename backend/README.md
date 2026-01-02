# Vedic Astrology Backend

A FastAPI-based backend for Vedic Astrology calculations including planetary positions, Vimshottari Dasha, and more.

## Features

- **Planetary Positions**: Accurate sidereal zodiac positions using Swiss Ephemeris
- **Rashi (Zodiac Signs)**: Traditional Vedic sign calculations
- **Nakshatras**: 27 lunar mansions with pada calculations
- **Vimshottari Dasha**: Complete Mahadasha/Antardasha/Pratyantardasha timeline
- **Ayanamsa Options**: Lahiri, Krishnamurti, and Raman systems

## Setup

### Prerequisites

- Python 3.11+
- pip or poetry

### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# For development
pip install -e ".[dev]"
```

### Running the Server

```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python -m src.main
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Generate Birth Chart
```bash
POST /api/v1/chart
```

### Get Dasha Timeline
```bash
POST /api/v1/dasha/timeline
```

### Get Current Dasha
```bash
POST /api/v1/dasha/current
```

### Get Transits
```bash
POST /api/v1/transit
```

## Example Request

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

## Running Tests

```bash
pytest tests/ -v
```

## Docker

```bash
# Build
docker build -t vedi-backend .

# Run
docker run -p 8000:8000 vedi-backend
```

