"""
FastAPI routes for Vedic Astrology API.
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional

from ..models.schemas import (
    BirthData,
    ChartResponse,
    DashaTimelineResponse,
    CurrentDashaResponse,
    TransitRequest,
    TransitResponse,
    HealthResponse,
)
from ..services.chart_service import ChartService

router = APIRouter(prefix="/api/v1", tags=["astrology"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        timestamp=datetime.now()
    )


@router.post("/chart", response_model=ChartResponse)
async def generate_chart(birth_data: BirthData):
    """
    Generate complete Vedic birth chart with Dasha.
    
    This endpoint calculates:
    - All planetary positions in sidereal zodiac
    - Ascendant (Lagna)
    - Moon's nakshatra (Janma Nakshatra)
    - Current running Dasha/Antardasha/Pratyantardasha
    - Complete Mahadasha timeline
    """
    try:
        service = ChartService()
        return service.calculate_full_chart(birth_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dasha/timeline", response_model=DashaTimelineResponse)
async def get_dasha_timeline(
    birth_data: BirthData,
    years_ahead: int = Query(default=120, ge=1, le=200, description="Years to generate")
):
    """
    Get complete Mahadasha/Antardasha timeline.
    
    Returns the full Vimshottari Dasha timeline with nested Antardashas
    for the specified number of years from birth.
    """
    try:
        service = ChartService()
        return service.get_dasha_timeline(birth_data, years_ahead)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dasha/current", response_model=CurrentDashaResponse)
async def get_current_dasha(
    birth_data: BirthData,
    target_date: Optional[datetime] = Query(
        default=None, 
        description="Date to check (default: now)"
    )
):
    """
    Get currently running Dasha/Antardasha/Pratyantardasha.
    
    Returns the active periods for the specified target date
    (or current date if not specified).
    """
    try:
        service = ChartService()
        return service.get_current_periods(birth_data, target_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transit", response_model=TransitResponse)
async def get_transits(request: TransitRequest):
    """
    Get planetary transits for a specific date.
    
    Returns both natal positions and transit positions
    for comparison and analysis.
    """
    try:
        service = ChartService()
        return service.calculate_transits(request.birth_data, request.transit_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Additional convenience endpoints

@router.post("/planets")
async def get_planet_positions(birth_data: BirthData):
    """
    Get only planetary positions (without Dasha calculations).
    
    Faster endpoint when you only need planet positions.
    """
    try:
        service = ChartService()
        planets, ascendant = service.calculate_planet_positions(birth_data)
        return {
            "planets": planets,
            "ascendant": ascendant
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/nakshatra")
async def get_moon_nakshatra(birth_data: BirthData):
    """
    Get Moon's nakshatra (Janma Nakshatra) details.
    
    Returns detailed nakshatra information including
    deity, symbol, and gana.
    """
    try:
        service = ChartService()
        return service.get_moon_nakshatra(birth_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

