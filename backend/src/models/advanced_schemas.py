"""
Pydantic models for advanced API features.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict


# Divisional Charts
class DivisionalPositionResponse(BaseModel):
    """Position in a divisional chart."""
    rashi: int = Field(..., ge=0, le=11)
    rashi_name: str
    degree: float


class DivisionalChartResponse(BaseModel):
    """Response for a divisional chart."""
    division: str  # D1, D9, etc.
    name: str
    description: str
    planets: Dict[str, DivisionalPositionResponse]
    ascendant: DivisionalPositionResponse


class AllDivisionalsResponse(BaseModel):
    """All divisional charts for a planet."""
    planet: str
    divisions: Dict[str, DivisionalPositionResponse]
    is_vargottama: bool


# Shadbala
class ShadbalaResponse(BaseModel):
    """Shadbala result for a planet."""
    planet: str
    sthana_bala: float
    dig_bala: float
    kala_bala: float
    chesta_bala: float
    naisargika_bala: float
    drik_bala: float
    total_shadbala: float
    required_strength: float
    is_strong: bool
    strength_percentage: float


class AllShadbalaResponse(BaseModel):
    """Shadbala for all planets."""
    planets: List[ShadbalaResponse]
    strongest_planet: str
    weakest_planet: str


# Ashtakavarga
class BhinnashtakavargaResponse(BaseModel):
    """Individual planet's Ashtakavarga."""
    planet: str
    bindus: List[int]  # 12 houses
    total_bindus: int
    prastara: Optional[List[List[int]]] = None


class SarvashtakavargaResponse(BaseModel):
    """Combined Ashtakavarga."""
    bindus: List[int]  # 12 houses
    total_bindus: int
    bhinnas: Dict[str, BhinnashtakavargaResponse]
    trikona_reduced: Optional[List[int]] = None


class TransitAnalysisResponse(BaseModel):
    """Transit analysis using Ashtakavarga."""
    planet: str
    transit_sign: int
    transit_sign_name: str
    bhinna_bindus: int
    bhinna_quality: str
    sarva_bindus: int
    sarva_quality: str
    recommendation: str


# Yogas
class YogaResponse(BaseModel):
    """Yoga detection result."""
    name: str
    sanskrit_name: str
    category: str
    planets_involved: List[str]
    houses_involved: List[int]
    strength: str
    effects: str
    is_present: bool


class AllYogasResponse(BaseModel):
    """All yogas in the chart."""
    total_yogas: int
    rajayogas: List[YogaResponse]
    dhana_yogas: List[YogaResponse]
    other_yogas: List[YogaResponse]


# Panchanga
class TithiResponse(BaseModel):
    """Tithi information."""
    number: int
    name: str
    paksha: str
    lord: str
    remaining_degrees: float
    is_purnima: bool
    is_amavasya: bool


class PanchangaYogaResponse(BaseModel):
    """Yoga (Sun-Moon) information."""
    number: int
    name: str
    nature: str
    remaining_degrees: float


class KaranaResponse(BaseModel):
    """Karana information."""
    number: int
    name: str
    type: str


class VaraResponse(BaseModel):
    """Weekday information."""
    number: int
    name: str
    sanskrit_name: str
    lord: str


class TimePeriodResponse(BaseModel):
    """A time period with start and end."""
    start: datetime
    end: datetime
    duration_minutes: float


class PanchangaResponse(BaseModel):
    """Complete Panchanga for a date/time."""
    datetime: datetime
    tithi: TithiResponse
    nakshatra: Dict
    yoga: PanchangaYogaResponse
    karana: KaranaResponse
    vara: VaraResponse
    rahu_kaal: Optional[TimePeriodResponse] = None
    gulika_kaal: Optional[TimePeriodResponse] = None
    is_auspicious: bool
    special_notes: List[str]


class ChoghadiyaResponse(BaseModel):
    """Choghadiya period."""
    name: str
    nature: str
    lord: str
    start: datetime
    end: datetime
    is_good: bool


class MuhurtaResponse(BaseModel):
    """Muhurta timing information."""
    name: str
    start: datetime
    end: datetime
    duration_minutes: float
    is_auspicious: bool
    effects: str


class DailyMuhurtaResponse(BaseModel):
    """Daily muhurta information."""
    date: datetime
    choghadiya: List[ChoghadiyaResponse]
    abhijit_muhurta: MuhurtaResponse
    rahu_kaal: TimePeriodResponse
    gulika_kaal: TimePeriodResponse

