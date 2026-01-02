"""
FastAPI routes for Dasha predictions.
Provides detailed predictions for all Dasha periods.
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional, Literal

from ..models.schemas import BirthData
from ..services.prediction_service import PredictionService

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])

# Initialize service
service = PredictionService()


@router.post("/current")
async def get_current_prediction(
    birth_data: BirthData,
    target_date: Optional[str] = Query(default=None, description="Target date in ISO format (YYYY-MM-DDTHH:MM:SS)")
):
    """
    Get detailed predictions for the currently running Dasha period.
    
    Returns predictions covering:
    - Health outlook and potential concerns
    - Wealth and financial prospects
    - Career and professional growth
    - Relationships and family life
    - General life themes and spiritual growth
    
    Plus remedies including gemstones, mantras, and favorable/unfavorable activities.
    """
    try:
        target = None
        if target_date:
            target = datetime.fromisoformat(target_date)
        
        return service.get_current_period_prediction(birth_data, target)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mahadasha/{dasha_lord}")
async def get_mahadasha_prediction(
    birth_data: BirthData,
    dasha_lord: Literal["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
):
    """
    Get detailed predictions for a specific Mahadasha period.
    
    Each Mahadasha (major period) has distinct themes and effects
    on different life areas based on the ruling planet.
    """
    try:
        return service.get_mahadasha_prediction(dasha_lord)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/antardasha/{mahadasha_lord}/{antardasha_lord}")
async def get_antardasha_prediction(
    birth_data: BirthData,
    mahadasha_lord: Literal["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"],
    antardasha_lord: Literal["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
):
    """
    Get detailed predictions for a specific Mahadasha-Antardasha combination.
    
    The Antardasha (sub-period) modifies the effects of the Mahadasha
    based on the planetary relationship between the two lords.
    """
    try:
        return service.get_antardasha_prediction(mahadasha_lord, antardasha_lord)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/timeline")
async def get_timeline_with_predictions(
    birth_data: BirthData,
    years_ahead: int = Query(default=80, ge=10, le=120, description="Years to calculate ahead")
):
    """
    Get complete Mahadasha timeline with predictions for each period.
    
    Returns:
    - Full Mahadasha sequence with start/end dates
    - Detailed predictions for each Mahadasha
    - All Antardasha periods within each Mahadasha
    - Summary predictions for each Antardasha
    """
    try:
        return service.get_timeline_with_predictions(birth_data, years_ahead)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all-dashas")
async def get_all_dasha_predictions():
    """
    Get predictions for all 9 Dasha lords.
    
    Useful for understanding the general characteristics
    of each planetary period without specific birth data.
    """
    try:
        return service.get_all_dasha_predictions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/combination-matrix")
async def get_combination_matrix():
    """
    Get prediction summary for all 81 Mahadasha-Antardasha combinations.
    
    Returns a matrix showing the overall rating and trends
    for each possible planetary combination.
    """
    try:
        return service.get_combination_matrix()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/life-area/{area}")
async def get_life_area_prediction(
    birth_data: BirthData,
    area: Literal["health", "wealth", "career", "relationships", "general"]
):
    """
    Get prediction for a specific life area for the current period.
    
    Areas:
    - health: Physical and mental health outlook
    - wealth: Financial prospects and money matters
    - career: Professional growth and job opportunities
    - relationships: Marriage, family, and social connections
    - general: Overall life themes and spiritual growth
    """
    try:
        prediction = service.get_current_period_prediction(birth_data)
        
        if 'predictions' in prediction and area in prediction['predictions']:
            return {
                'area': area,
                'current_periods': prediction.get('current_periods', {}),
                'prediction': prediction['predictions'][area],
                'remedies': prediction.get('remedies', {})
            }
        else:
            raise HTTPException(status_code=400, detail=f"Invalid area: {area}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/remedies")
async def get_remedies(birth_data: BirthData):
    """
    Get recommended remedies for the current Dasha period.
    
    Returns:
    - Gemstone recommendations
    - Mantras for the ruling planet
    - Deities to worship
    - Favorable and unfavorable activities
    - Area-specific remedies
    """
    try:
        prediction = service.get_current_period_prediction(birth_data)
        
        remedies = {
            'current_periods': prediction.get('current_periods', {}),
            'gemstone': prediction.get('remedies', {}).get('gemstone'),
            'mantra': prediction.get('remedies', {}).get('mantra'),
            'deity': prediction.get('remedies', {}).get('deity'),
            'favorable_activities': prediction.get('favorable_activities', []),
            'unfavorable_activities': prediction.get('unfavorable_activities', []),
            'area_remedies': {}
        }
        
        for area, pred in prediction.get('predictions', {}).items():
            remedies['area_remedies'][area] = pred.get('remedies', [])
        
        return remedies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

