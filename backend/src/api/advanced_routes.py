"""
Advanced FastAPI routes for Vedic Astrology API.
Includes divisional charts, Shadbala, Ashtakavarga, Yogas, and Panchanga.
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional, Literal

from ..models.schemas import BirthData
from ..services.advanced_service import AdvancedChartService

router = APIRouter(prefix="/api/v1/advanced", tags=["advanced"])

# Initialize service
service = AdvancedChartService()


# ==================== Divisional Charts ====================

@router.post("/divisional/{division}")
async def get_divisional_chart(
    birth_data: BirthData,
    division: Literal["D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12", "D16", "D20", "D24", "D30", "D60"]
):
    """
    Get a specific divisional chart.
    
    Available divisions:
    - D1: Rashi (birth chart)
    - D2: Hora (wealth)
    - D3: Drekkana (siblings)
    - D4: Chaturthamsa (property)
    - D7: Saptamsa (children)
    - D9: Navamsa (spouse, dharma)
    - D10: Dasamsa (career)
    - D12: Dwadasamsa (parents)
    - D16: Shodasamsa (vehicles)
    - D20: Vimsamsa (spirituality)
    - D24: Chaturvimsamsa (education)
    - D30: Trimsamsa (misfortunes)
    - D60: Shashtiamsa (past karma)
    """
    try:
        return service.get_divisional_chart(birth_data, division)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/divisional/planet/{planet}")
async def get_planet_divisionals(
    birth_data: BirthData,
    planet: Literal["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU", "ASCENDANT"]
):
    """
    Get all divisional chart positions for a specific planet.
    Also indicates if the planet is Vargottama (same sign in D1 and D9).
    """
    try:
        return service.get_all_divisionals_for_planet(birth_data, planet)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Shadbala ====================

@router.post("/shadbala")
async def get_shadbala(birth_data: BirthData):
    """
    Calculate Shadbala (six-fold strength) for all planets.
    
    Returns:
    - Individual strength components (Sthana, Dig, Kala, Chesta, Naisargika, Drik)
    - Total Shadbala in Rupas
    - Whether planet meets minimum required strength
    - Strongest and weakest planets
    """
    try:
        return service.get_shadbala(birth_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Ashtakavarga ====================

@router.post("/ashtakavarga")
async def get_ashtakavarga(birth_data: BirthData):
    """
    Calculate complete Ashtakavarga.
    
    Returns:
    - Sarvashtakavarga (combined points for all 12 signs)
    - Bhinnashtakavarga (individual planet points)
    - Prastara (8x12 contribution matrix)
    - Trikona reduced values
    """
    try:
        return service.get_ashtakavarga(birth_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ashtakavarga/transit")
async def analyze_transit(
    birth_data: BirthData,
    transit_planet: Literal["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"],
    transit_rashi: int = Query(..., ge=0, le=11, description="Transit sign (0=Aries to 11=Pisces)")
):
    """
    Analyze a planetary transit using Ashtakavarga.
    
    Provides quality assessment and recommendations based on
    bindu count in the transit position.
    """
    try:
        return service.analyze_transit(birth_data, transit_planet, transit_rashi)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Yogas ====================

@router.post("/yogas")
async def get_yogas(birth_data: BirthData):
    """
    Detect all yogas (planetary combinations) in the chart.
    
    Includes:
    - Rajayogas (power/authority)
    - Mahapurusha Yogas (great personality)
    - Dhana Yogas (wealth)
    - Daridra Yogas (poverty - if present)
    - Other significant yogas
    """
    try:
        return service.get_yogas(birth_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Panchanga ====================

@router.post("/panchanga")
async def get_panchanga(
    birth_data: BirthData,
    sunrise_hour: Optional[int] = Query(default=6, ge=0, le=12),
    sunset_hour: Optional[int] = Query(default=18, ge=12, le=23)
):
    """
    Get Panchanga (five-fold almanac) for the birth time.
    
    Returns:
    - Tithi (lunar day)
    - Nakshatra (lunar mansion)
    - Yoga (Sun-Moon combination)
    - Karana (half-tithi)
    - Vara (weekday)
    - Rahu Kaal and Gulika Kaal times
    - Overall auspiciousness assessment
    """
    try:
        # Create approximate sunrise/sunset times
        sunrise = birth_data.date.replace(hour=sunrise_hour, minute=0, second=0)
        sunset = birth_data.date.replace(hour=sunset_hour, minute=0, second=0)
        
        return service.get_panchanga(birth_data, sunrise=sunrise, sunset=sunset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Combined Analysis ====================

@router.post("/full-analysis")
async def get_full_analysis(birth_data: BirthData):
    """
    Get comprehensive chart analysis including:
    - Navamsa (D-9) positions
    - Shadbala strengths
    - Detected Yogas
    - Panchanga details
    
    This is a convenience endpoint for getting multiple analyses at once.
    """
    try:
        navamsa = service.get_divisional_chart(birth_data, "D9")
        shadbala = service.get_shadbala(birth_data)
        yogas = service.get_yogas(birth_data)
        panchanga = service.get_panchanga(birth_data)
        
        return {
            "navamsa": navamsa,
            "shadbala": shadbala,
            "yogas": yogas,
            "panchanga": panchanga
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

