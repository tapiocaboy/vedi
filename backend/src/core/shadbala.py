"""
Shadbala (Six-fold Planetary Strength) calculations.
Unit: Rupas (1 Rupa = 60 Virupas)
"""

from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
import math


@dataclass
class ShadbalaResult:
    """Complete Shadbala result for a planet."""
    planet: str
    sthana_bala: float  # Positional strength
    dig_bala: float     # Directional strength
    kala_bala: float    # Temporal strength
    chesta_bala: float  # Motional strength
    naisargika_bala: float  # Natural strength
    drik_bala: float    # Aspectual strength
    total_shadbala: float  # Total in Rupas
    required_strength: float  # Minimum required
    is_strong: bool  # Meets minimum requirement


# Exaltation degrees for each planet
EXALTATION_DEGREES = {
    'SUN': 10.0,      # Aries 10°
    'MOON': 33.0,     # Taurus 3°
    'MARS': 298.0,    # Capricorn 28°
    'MERCURY': 165.0, # Virgo 15°
    'JUPITER': 95.0,  # Cancer 5°
    'VENUS': 357.0,   # Pisces 27°
    'SATURN': 200.0,  # Libra 20°
}

# Debilitation is 180° from exaltation
DEBILITATION_DEGREES = {k: (v + 180) % 360 for k, v in EXALTATION_DEGREES.items()}

# Moolatrikona ranges (start, end, sign)
MOOLATRIKONA = {
    'SUN': (4, 120, 20),      # Leo 0-20°
    'MOON': (3, 33, 30),      # Taurus 3-30° (first 3° is exaltation)
    'MARS': (0, 0, 12),       # Aries 0-12°
    'MERCURY': (5, 165, 180), # Virgo 15-20°
    'JUPITER': (8, 240, 250), # Sagittarius 0-10°
    'VENUS': (6, 180, 195),   # Libra 0-15°
    'SATURN': (10, 300, 320), # Aquarius 0-20°
}

# Own signs for each planet
OWN_SIGNS = {
    'SUN': [4],           # Leo
    'MOON': [3],          # Cancer
    'MARS': [0, 7],       # Aries, Scorpio
    'MERCURY': [2, 5],    # Gemini, Virgo
    'JUPITER': [8, 11],   # Sagittarius, Pisces
    'VENUS': [1, 6],      # Taurus, Libra
    'SATURN': [9, 10],    # Capricorn, Aquarius
}

# Natural strength (Naisargika Bala) in Virupas
NATURAL_STRENGTH = {
    'SUN': 60.0,
    'MOON': 51.43,
    'VENUS': 42.85,
    'JUPITER': 34.28,
    'MERCURY': 25.71,
    'MARS': 17.14,
    'SATURN': 8.57,
}

# Minimum required Shadbala in Rupas
MINIMUM_SHADBALA = {
    'SUN': 6.5,
    'MOON': 6.0,
    'MARS': 5.0,
    'MERCURY': 7.0,
    'JUPITER': 6.5,
    'VENUS': 5.5,
    'SATURN': 5.0,
}

# Directional strength (Dig Bala) - which house gives max strength
DIG_BALA_POSITIONS = {
    'SUN': 10,       # 10th house (Meridian)
    'MARS': 10,      # 10th house
    'JUPITER': 1,    # 1st house (Ascendant)
    'MERCURY': 1,    # 1st house
    'MOON': 4,       # 4th house (IC)
    'VENUS': 4,      # 4th house
    'SATURN': 7,     # 7th house (Descendant)
}


class Shadbala:
    """
    Calculate six-fold planetary strength.
    """
    
    def __init__(self, positions: Dict, ascendant_rashi: int, 
                 birth_time: datetime, is_day_birth: bool):
        """
        Initialize Shadbala calculator.
        
        Args:
            positions: Dictionary of planet positions
            ascendant_rashi: Ascendant sign index (0-11)
            birth_time: Birth datetime
            is_day_birth: True if born during day (sunrise to sunset)
        """
        self.positions = positions
        self.ascendant_rashi = ascendant_rashi
        self.birth_time = birth_time
        self.is_day_birth = is_day_birth
    
    def _get_house(self, planet_rashi: int) -> int:
        """Get house number (1-12) from planet's rashi."""
        return ((planet_rashi - self.ascendant_rashi) % 12) + 1
    
    def calculate_uccha_bala(self, planet: str, longitude: float) -> float:
        """
        Uccha Bala (Exaltation Strength).
        Maximum 60 Virupas at exaltation, 0 at debilitation.
        """
        if planet not in EXALTATION_DEGREES:
            return 0.0
        
        exalt_deg = EXALTATION_DEGREES[planet]
        debil_deg = DEBILITATION_DEGREES[planet]
        
        # Distance from debilitation point
        distance = abs(longitude - debil_deg)
        if distance > 180:
            distance = 360 - distance
        
        # Linear interpolation: 0 at debilitation, 60 at exaltation
        uccha_bala = (distance / 180.0) * 60.0
        return uccha_bala
    
    def calculate_saptavargaja_bala(self, planet: str, varga_positions: Dict) -> float:
        """
        Saptavargaja Bala (Strength from 7 divisional charts).
        Based on planet's dignity in D-1, D-2, D-3, D-7, D-9, D-12, D-30.
        """
        VARGA_CHARTS = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30']
        total = 0.0
        
        for varga in VARGA_CHARTS:
            if varga not in varga_positions:
                continue
            
            varga_rashi = varga_positions[varga].rashi
            dignity = self._get_dignity(planet, varga_rashi)
            
            # Points based on dignity
            if dignity == 'exalted':
                total += 30
            elif dignity == 'moolatrikona':
                total += 22.5
            elif dignity == 'own':
                total += 20
            elif dignity == 'friend':
                total += 15
            elif dignity == 'neutral':
                total += 10
            elif dignity == 'enemy':
                total += 3.75
            # Debilitated = 0
        
        return total / 7.0  # Average across 7 charts
    
    def _get_dignity(self, planet: str, rashi: int) -> str:
        """Determine planet's dignity in a sign."""
        if planet not in OWN_SIGNS:
            return 'neutral'
        
        # Check exaltation
        if planet in EXALTATION_DEGREES:
            exalt_sign = int(EXALTATION_DEGREES[planet] / 30)
            if rashi == exalt_sign:
                return 'exalted'
            debil_sign = int(DEBILITATION_DEGREES[planet] / 30)
            if rashi == debil_sign:
                return 'debilitated'
        
        # Check own sign
        if rashi in OWN_SIGNS[planet]:
            return 'own'
        
        # Simplified friendship (would need full relationship table)
        return 'neutral'
    
    def calculate_ojhayugma_bala(self, planet: str, rashi: int) -> float:
        """
        Ojhayugmarasyamsa Bala (Odd-Even Sign Strength).
        - Moon, Venus: Strong in even signs (15 Virupas)
        - Sun, Mars, Mercury, Jupiter, Saturn: Strong in odd signs (15 Virupas)
        """
        is_odd_sign = rashi % 2 == 0  # 0, 2, 4... are odd in 0-indexed
        feminine_planets = ['MOON', 'VENUS']
        
        if planet in feminine_planets:
            return 15.0 if not is_odd_sign else 0.0
        else:
            return 15.0 if is_odd_sign else 0.0
    
    def calculate_kendradi_bala(self, planet: str, rashi: int) -> float:
        """
        Kendradi Bala (Angular Strength).
        - Kendras (1, 4, 7, 10): 60 Virupas
        - Panapharas (2, 5, 8, 11): 30 Virupas
        - Apoklimas (3, 6, 9, 12): 15 Virupas
        """
        house = self._get_house(rashi)
        
        if house in [1, 4, 7, 10]:  # Kendras
            return 60.0
        elif house in [2, 5, 8, 11]:  # Panapharas
            return 30.0
        else:  # Apoklimas
            return 15.0
    
    def calculate_drekkana_bala(self, planet: str, degree: float) -> float:
        """
        Drekkana Bala (Decanate Strength).
        - Male planets (Sun, Mars, Jupiter): Strong in 1st drekkana (0-10°)
        - Neutral (Mercury, Saturn): Strong in 2nd drekkana (10-20°)
        - Female planets (Moon, Venus): Strong in 3rd drekkana (20-30°)
        """
        deg_in_sign = degree % 30
        
        if deg_in_sign < 10:
            drekkana = 1
        elif deg_in_sign < 20:
            drekkana = 2
        else:
            drekkana = 3
        
        male_planets = ['SUN', 'MARS', 'JUPITER']
        neutral_planets = ['MERCURY', 'SATURN']
        female_planets = ['MOON', 'VENUS']
        
        if planet in male_planets and drekkana == 1:
            return 15.0
        elif planet in neutral_planets and drekkana == 2:
            return 15.0
        elif planet in female_planets and drekkana == 3:
            return 15.0
        
        return 0.0
    
    def calculate_sthana_bala(self, planet: str, longitude: float, 
                              varga_positions: Dict) -> float:
        """
        Calculate complete Sthana Bala (Positional Strength).
        Sum of 5 sub-components.
        """
        rashi = int(longitude / 30)
        degree = longitude % 30
        
        uccha = self.calculate_uccha_bala(planet, longitude)
        saptavarga = self.calculate_saptavargaja_bala(planet, varga_positions)
        ojha = self.calculate_ojhayugma_bala(planet, rashi)
        kendra = self.calculate_kendradi_bala(planet, rashi)
        drekkana = self.calculate_drekkana_bala(planet, degree)
        
        total = uccha + saptavarga + ojha + kendra + drekkana
        return total / 60.0  # Convert to Rupas
    
    def calculate_dig_bala(self, planet: str, rashi: int) -> float:
        """
        Calculate Dig Bala (Directional Strength).
        Maximum 60 Virupas when in strongest house, 0 when opposite.
        """
        if planet not in DIG_BALA_POSITIONS:
            return 0.0
        
        strong_house = DIG_BALA_POSITIONS[planet]
        weak_house = ((strong_house - 1 + 6) % 12) + 1  # Opposite house
        
        current_house = self._get_house(rashi)
        
        # Calculate distance from weak house
        # Maximum is at strong house, minimum at weak house
        distance = abs(current_house - weak_house)
        if distance > 6:
            distance = 12 - distance
        
        dig_bala = (distance / 6.0) * 60.0
        return dig_bala / 60.0  # Convert to Rupas
    
    def calculate_kala_bala(self, planet: str) -> float:
        """
        Calculate Kala Bala (Temporal Strength).
        Simplified calculation based on day/night birth.
        """
        # Day planets: Sun, Jupiter, Venus
        # Night planets: Moon, Mars, Saturn
        # Mercury: Day or night based on association
        
        day_planets = ['SUN', 'JUPITER', 'VENUS']
        night_planets = ['MOON', 'MARS', 'SATURN']
        
        if planet in day_planets:
            base = 60.0 if self.is_day_birth else 0.0
        elif planet in night_planets:
            base = 0.0 if self.is_day_birth else 60.0
        else:  # Mercury
            base = 30.0  # Neutral
        
        return base / 60.0  # Convert to Rupas
    
    def calculate_chesta_bala(self, planet: str, speed: float) -> float:
        """
        Calculate Chesta Bala (Motional Strength).
        Based on planetary speed and retrograde motion.
        """
        if planet in ['SUN', 'MOON']:
            # Sun and Moon don't go retrograde
            return 0.5  # Average strength
        
        # Retrograde motion gives strength
        if speed < 0:  # Retrograde
            chesta = 60.0
        elif speed == 0:  # Stationary
            chesta = 30.0
        else:  # Direct
            chesta = 15.0
        
        return chesta / 60.0  # Convert to Rupas
    
    def calculate_naisargika_bala(self, planet: str) -> float:
        """
        Calculate Naisargika Bala (Natural Strength).
        Fixed values based on natural planetary hierarchy.
        """
        return NATURAL_STRENGTH.get(planet, 0.0) / 60.0  # Convert to Rupas
    
    def calculate_drik_bala(self, planet: str, aspects: List[Dict]) -> float:
        """
        Calculate Drik Bala (Aspectual Strength).
        Based on benefic/malefic aspects received.
        """
        benefics = ['JUPITER', 'VENUS', 'MERCURY', 'MOON']  # Mercury and Moon can be malefic too
        malefics = ['SATURN', 'MARS', 'SUN', 'RAHU', 'KETU']
        
        total = 0.0
        for aspect in aspects:
            aspecting_planet = aspect.get('planet', '')
            if aspecting_planet in benefics:
                total += 15.0
            elif aspecting_planet in malefics:
                total -= 15.0
        
        # Normalize to positive range
        drik_bala = max(0, total + 30) / 60.0
        return drik_bala
    
    def calculate_shadbala(self, planet: str, longitude: float, speed: float,
                          varga_positions: Dict, aspects: List[Dict] = None) -> ShadbalaResult:
        """
        Calculate complete Shadbala for a planet.
        """
        if aspects is None:
            aspects = []
        
        rashi = int(longitude / 30)
        
        sthana = self.calculate_sthana_bala(planet, longitude, varga_positions)
        dig = self.calculate_dig_bala(planet, rashi)
        kala = self.calculate_kala_bala(planet)
        chesta = self.calculate_chesta_bala(planet, speed)
        naisargika = self.calculate_naisargika_bala(planet)
        drik = self.calculate_drik_bala(planet, aspects)
        
        total = sthana + dig + kala + chesta + naisargika + drik
        required = MINIMUM_SHADBALA.get(planet, 5.0)
        
        return ShadbalaResult(
            planet=planet,
            sthana_bala=round(sthana, 2),
            dig_bala=round(dig, 2),
            kala_bala=round(kala, 2),
            chesta_bala=round(chesta, 2),
            naisargika_bala=round(naisargika, 2),
            drik_bala=round(drik, 2),
            total_shadbala=round(total, 2),
            required_strength=required,
            is_strong=total >= required
        )

