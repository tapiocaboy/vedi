"""
Panchanga (Five Limbs of Vedic Almanac) calculations.
Includes Tithi, Nakshatra, Yoga, Karana, and Vara.
"""

from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from dataclasses import dataclass


@dataclass
class TithiInfo:
    """Tithi (lunar day) information."""
    number: int  # 1-30
    name: str
    paksha: str  # Shukla (waxing) or Krishna (waning)
    lord: str
    remaining_degrees: float
    is_purnima: bool
    is_amavasya: bool


@dataclass
class PanchangaYogaInfo:
    """Yoga (Sun-Moon combination) information."""
    number: int  # 1-27
    name: str
    nature: str  # benefic, malefic, neutral
    remaining_degrees: float


@dataclass
class KaranaInfo:
    """Karana (half-tithi) information."""
    number: int  # 1-60 in a month
    name: str
    type: str  # fixed or movable


@dataclass
class VaraInfo:
    """Vara (weekday) information."""
    number: int  # 0-6
    name: str
    sanskrit_name: str
    lord: str


@dataclass
class PanchangaResult:
    """Complete Panchanga for a date/time."""
    datetime: datetime
    tithi: TithiInfo
    nakshatra: Dict
    yoga: PanchangaYogaInfo
    karana: KaranaInfo
    vara: VaraInfo
    rahu_kaal: Optional[Tuple[datetime, datetime]]
    gulika_kaal: Optional[Tuple[datetime, datetime]]
    is_auspicious: bool
    special_notes: list


# Tithi names (15 in each paksha)
TITHI_NAMES = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
]

# Tithi lords
TITHI_LORDS = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
    'Venus', 'Saturn', 'Rahu', 'Sun', 'Moon',
    'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
]

# Yoga names (27)
YOGA_NAMES = [
    'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
    'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda',
    'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
    'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
    'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
    'Indra', 'Vaidhriti'
]

# Yoga nature
YOGA_NATURE = {
    'Vishkumbha': 'malefic', 'Priti': 'benefic', 'Ayushman': 'benefic',
    'Saubhagya': 'benefic', 'Shobhana': 'benefic', 'Atiganda': 'malefic',
    'Sukarma': 'benefic', 'Dhriti': 'benefic', 'Shoola': 'malefic',
    'Ganda': 'malefic', 'Vriddhi': 'benefic', 'Dhruva': 'benefic',
    'Vyaghata': 'malefic', 'Harshana': 'benefic', 'Vajra': 'malefic',
    'Siddhi': 'benefic', 'Vyatipata': 'malefic', 'Variyan': 'benefic',
    'Parigha': 'malefic', 'Shiva': 'benefic', 'Siddha': 'benefic',
    'Sadhya': 'benefic', 'Shubha': 'benefic', 'Shukla': 'benefic',
    'Brahma': 'benefic', 'Indra': 'benefic', 'Vaidhriti': 'malefic'
}

# Karana names (11 total, 7 movable + 4 fixed)
MOVABLE_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti']
FIXED_KARANAS = ['Shakuni', 'Chatushpada', 'Naga', 'Kimstughna']

# Vara (weekday) information
VARA_INFO = [
    (0, 'Sunday', 'Ravivara', 'Sun'),
    (1, 'Monday', 'Somavara', 'Moon'),
    (2, 'Tuesday', 'Mangalavara', 'Mars'),
    (3, 'Wednesday', 'Budhavara', 'Mercury'),
    (4, 'Thursday', 'Guruvara', 'Jupiter'),
    (5, 'Friday', 'Shukravara', 'Venus'),
    (6, 'Saturday', 'Shanivara', 'Saturn'),
]

# Rahu Kaal segments (1-based) for each weekday
# Sunday=8, Monday=2, Tuesday=7, Wednesday=5, Thursday=6, Friday=4, Saturday=3
RAHU_KAAL_SEGMENTS = [8, 2, 7, 5, 6, 4, 3]

# Gulika/Mandi Kaal segments
GULIKA_SEGMENTS = [7, 6, 5, 4, 3, 2, 1]


class Panchanga:
    """
    Calculate Panchanga (five limbs of Vedic almanac).
    """
    
    def __init__(self, sun_longitude: float, moon_longitude: float):
        """
        Initialize Panchanga calculator.
        
        Args:
            sun_longitude: Sun's sidereal longitude
            moon_longitude: Moon's sidereal longitude
        """
        self.sun_longitude = sun_longitude
        self.moon_longitude = moon_longitude
    
    def calculate_tithi(self) -> TithiInfo:
        """
        Calculate Tithi (Lunar day).
        Tithi = (Moon - Sun) / 12°
        30 tithis in a lunar month.
        """
        diff = (self.moon_longitude - self.sun_longitude) % 360
        tithi_num = int(diff / 12) + 1
        
        # Determine paksha
        if tithi_num <= 15:
            paksha = 'Shukla'
            tithi_in_paksha = tithi_num
        else:
            paksha = 'Krishna'
            tithi_in_paksha = tithi_num - 15
        
        # Get name (handle Purnima and Amavasya)
        if tithi_num == 15:
            name = 'Purnima'
        elif tithi_num == 30:
            name = 'Amavasya'
            tithi_in_paksha = 15  # Display as 15th of Krishna
        else:
            name = TITHI_NAMES[(tithi_in_paksha - 1) % 15]
        
        lord = TITHI_LORDS[(tithi_num - 1) % 15]
        remaining = 12 - (diff % 12)
        
        return TithiInfo(
            number=tithi_num,
            name=name,
            paksha=paksha,
            lord=lord,
            remaining_degrees=remaining,
            is_purnima=tithi_num == 15,
            is_amavasya=tithi_num == 30 or tithi_num == 0
        )
    
    def calculate_yoga(self) -> PanchangaYogaInfo:
        """
        Calculate Yoga (Sun + Moon longitude).
        Yoga = (Sun + Moon) / 13°20'
        27 yogas from Vishkumbha to Vaidhriti.
        """
        combined = (self.sun_longitude + self.moon_longitude) % 360
        yoga_span = 360.0 / 27.0  # 13.333...
        yoga_num = int(combined / yoga_span) + 1
        
        if yoga_num > 27:
            yoga_num = 1
        
        name = YOGA_NAMES[yoga_num - 1]
        nature = YOGA_NATURE[name]
        remaining = yoga_span - (combined % yoga_span)
        
        return PanchangaYogaInfo(
            number=yoga_num,
            name=name,
            nature=nature,
            remaining_degrees=remaining
        )
    
    def calculate_karana(self) -> KaranaInfo:
        """
        Calculate Karana (half of a tithi).
        60 karanas per lunar month, each spanning 6°.
        4 fixed + 7 movable karanas.
        """
        diff = (self.moon_longitude - self.sun_longitude) % 360
        karana_num = int(diff / 6) + 1
        
        if karana_num > 60:
            karana_num = 1
        
        # First karana of Shukla Pratipada is Kimstughna (fixed)
        # Last 4 karanas are fixed (57-60)
        if karana_num == 1:
            name = 'Kimstughna'
            karana_type = 'fixed'
        elif karana_num >= 57:
            fixed_index = karana_num - 57
            name = FIXED_KARANAS[fixed_index]
            karana_type = 'fixed'
        else:
            # Movable karanas repeat
            movable_index = (karana_num - 2) % 7
            name = MOVABLE_KARANAS[movable_index]
            karana_type = 'movable'
        
        return KaranaInfo(
            number=karana_num,
            name=name,
            type=karana_type
        )
    
    @staticmethod
    def calculate_vara(date: datetime) -> VaraInfo:
        """
        Calculate Vara (weekday).
        """
        weekday = date.weekday()
        # Python: Monday=0, but we want Sunday=0
        weekday = (weekday + 1) % 7
        
        _, name, sanskrit, lord = VARA_INFO[weekday]
        
        return VaraInfo(
            number=weekday,
            name=name,
            sanskrit_name=sanskrit,
            lord=lord
        )
    
    @staticmethod
    def calculate_rahu_kaal(weekday: int, sunrise: datetime, 
                            sunset: datetime) -> Tuple[datetime, datetime]:
        """
        Calculate Rahu Kaal (inauspicious period).
        Duration = (Sunset - Sunrise) / 8
        """
        day_duration = (sunset - sunrise).total_seconds()
        segment_duration = day_duration / 8
        
        rk_segment = RAHU_KAAL_SEGMENTS[weekday] - 1  # 0-indexed
        
        start = sunrise + timedelta(seconds=segment_duration * rk_segment)
        end = start + timedelta(seconds=segment_duration)
        
        return (start, end)
    
    @staticmethod
    def calculate_gulika_kaal(weekday: int, sunrise: datetime,
                              sunset: datetime) -> Tuple[datetime, datetime]:
        """
        Calculate Gulika/Mandi Kaal (another inauspicious period).
        """
        day_duration = (sunset - sunrise).total_seconds()
        segment_duration = day_duration / 8
        
        gulika_segment = GULIKA_SEGMENTS[weekday] - 1  # 0-indexed
        
        start = sunrise + timedelta(seconds=segment_duration * gulika_segment)
        end = start + timedelta(seconds=segment_duration)
        
        return (start, end)
    
    def get_panchanga(self, date: datetime, nakshatra_info: Dict,
                     sunrise: Optional[datetime] = None,
                     sunset: Optional[datetime] = None) -> PanchangaResult:
        """
        Get complete Panchanga for a date/time.
        """
        tithi = self.calculate_tithi()
        yoga = self.calculate_yoga()
        karana = self.calculate_karana()
        vara = self.calculate_vara(date)
        
        # Calculate Rahu Kaal if sunrise/sunset provided
        rahu_kaal = None
        gulika_kaal = None
        if sunrise and sunset:
            rahu_kaal = self.calculate_rahu_kaal(vara.number, sunrise, sunset)
            gulika_kaal = self.calculate_gulika_kaal(vara.number, sunrise, sunset)
        
        # Determine auspiciousness
        is_auspicious = self._evaluate_auspiciousness(tithi, yoga, vara, nakshatra_info)
        
        # Special notes
        notes = self._get_special_notes(tithi, nakshatra_info, vara)
        
        return PanchangaResult(
            datetime=date,
            tithi=tithi,
            nakshatra=nakshatra_info,
            yoga=yoga,
            karana=karana,
            vara=vara,
            rahu_kaal=rahu_kaal,
            gulika_kaal=gulika_kaal,
            is_auspicious=is_auspicious,
            special_notes=notes
        )
    
    def _evaluate_auspiciousness(self, tithi: TithiInfo, yoga: PanchangaYogaInfo,
                                 vara: VaraInfo, nakshatra: Dict) -> bool:
        """Evaluate overall auspiciousness of the moment."""
        score = 0
        
        # Tithi check
        auspicious_tithis = [2, 3, 5, 7, 10, 11, 13]  # Generally good tithis
        if tithi.number in auspicious_tithis or (tithi.number - 15) in auspicious_tithis:
            score += 1
        
        # Yoga check
        if yoga.nature == 'benefic':
            score += 1
        elif yoga.nature == 'malefic':
            score -= 1
        
        # Nakshatra gana check
        if nakshatra.get('gana') == 'Deva':
            score += 1
        
        # Friday and Monday generally good for new beginnings
        if vara.number in [1, 5]:  # Monday, Friday
            score += 1
        
        return score >= 2
    
    def _get_special_notes(self, tithi: TithiInfo, nakshatra: Dict,
                          vara: VaraInfo) -> list:
        """Get special notes about the day."""
        notes = []
        
        if tithi.is_purnima:
            notes.append('Purnima - Full Moon day, auspicious for rituals')
        if tithi.is_amavasya:
            notes.append('Amavasya - New Moon day, good for ancestral rites')
        
        if tithi.name == 'Ekadashi':
            notes.append('Ekadashi - Sacred fasting day')
        
        if nakshatra.get('name') == 'Pushya':
            notes.append('Pushya Nakshatra - Highly auspicious for most activities')
        
        if vara.name == 'Thursday':
            notes.append('Guruvara - Auspicious for learning and spiritual activities')
        
        return notes


class MuhurtaSelector:
    """
    Select auspicious times (Muhurtas) for various activities.
    """
    
    # Choghadiya names and their nature
    CHOGHADIYA = [
        ('Udveg', 'inauspicious', 'Sun'),
        ('Char', 'good', 'Venus'),
        ('Labh', 'good', 'Mercury'),
        ('Amrit', 'best', 'Moon'),
        ('Kaal', 'inauspicious', 'Saturn'),
        ('Shubh', 'good', 'Jupiter'),
        ('Rog', 'inauspicious', 'Mars'),
    ]
    
    # Day starting Choghadiya for each weekday
    DAY_START_CHOGHADIYA = [0, 3, 6, 2, 5, 1, 4]  # Sun=Udveg, Mon=Amrit, etc.
    
    @classmethod
    def get_choghadiya(cls, weekday: int, sunrise: datetime, 
                       sunset: datetime) -> list:
        """
        Calculate Choghadiya (8 periods of day).
        Good: Amrit, Shubh, Labh, Char
        Bad: Rog, Kaal, Udveg
        """
        day_duration = (sunset - sunrise).total_seconds()
        period_duration = day_duration / 8
        
        start_index = cls.DAY_START_CHOGHADIYA[weekday]
        periods = []
        
        for i in range(8):
            chog_index = (start_index + i) % 7
            name, nature, lord = cls.CHOGHADIYA[chog_index]
            
            period_start = sunrise + timedelta(seconds=period_duration * i)
            period_end = period_start + timedelta(seconds=period_duration)
            
            periods.append({
                'name': name,
                'nature': nature,
                'lord': lord,
                'start': period_start,
                'end': period_end,
                'is_good': nature in ['good', 'best']
            })
        
        return periods
    
    @classmethod
    def get_abhijit_muhurta(cls, sunrise: datetime, sunset: datetime) -> Dict:
        """
        Calculate Abhijit Muhurta (most auspicious time of day).
        Occurs around local noon, duration varies by day length.
        """
        day_duration = (sunset - sunrise).total_seconds()
        muhurta_duration = day_duration / 30  # 30 muhurtas in a day
        
        # Abhijit is the 8th muhurta (around noon)
        noon = sunrise + timedelta(seconds=day_duration / 2)
        
        # Abhijit spans half muhurta before and after noon
        start = noon - timedelta(seconds=muhurta_duration / 2)
        end = noon + timedelta(seconds=muhurta_duration / 2)
        
        return {
            'name': 'Abhijit Muhurta',
            'start': start,
            'end': end,
            'duration_minutes': muhurta_duration / 60,
            'is_auspicious': True,
            'effects': 'Destroys all doshas, highly auspicious for important activities'
        }

