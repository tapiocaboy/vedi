"""
Ashtakavarga System for transit prediction.
Calculates benefic points (bindus) contributed by 8 sources.
"""

from typing import Dict, List
from dataclasses import dataclass


@dataclass
class BhinnashtakavargaResult:
    """Individual planet's Ashtakavarga."""
    planet: str
    bindus: List[int]  # 12 houses, bindus in each
    total_bindus: int


@dataclass
class SarvashtakavargaResult:
    """Combined Ashtakavarga of all planets."""
    bindus: List[int]  # 12 houses
    total_bindus: int
    bhinnas: Dict[str, BhinnashtakavargaResult]


# Benefic positions for each planet
# Format: houses from planet's position that give bindu to the planet
# Source: Brihat Parashara Hora Shastra

ASHTAKAVARGA_TABLES = {
    'SUN': {
        'SUN': [1, 2, 4, 7, 8, 9, 10, 11],
        'MOON': [3, 6, 10, 11],
        'MARS': [1, 2, 4, 7, 8, 9, 10, 11],
        'MERCURY': [3, 5, 6, 9, 10, 11, 12],
        'JUPITER': [5, 6, 9, 11],
        'VENUS': [6, 7, 12],
        'SATURN': [1, 2, 4, 7, 8, 9, 10, 11],
        'ASCENDANT': [3, 4, 6, 10, 11, 12],
    },
    'MOON': {
        'SUN': [3, 6, 7, 8, 10, 11],
        'MOON': [1, 3, 6, 7, 10, 11],
        'MARS': [2, 3, 5, 6, 9, 10, 11],
        'MERCURY': [1, 3, 4, 5, 7, 8, 10, 11],
        'JUPITER': [1, 4, 7, 8, 10, 11, 12],
        'VENUS': [3, 4, 5, 7, 9, 10, 11],
        'SATURN': [3, 5, 6, 11],
        'ASCENDANT': [3, 6, 10, 11],
    },
    'MARS': {
        'SUN': [3, 5, 6, 10, 11],
        'MOON': [3, 6, 11],
        'MARS': [1, 2, 4, 7, 8, 10, 11],
        'MERCURY': [3, 5, 6, 11],
        'JUPITER': [6, 10, 11, 12],
        'VENUS': [6, 8, 11, 12],
        'SATURN': [1, 4, 7, 8, 9, 10, 11],
        'ASCENDANT': [1, 3, 6, 10, 11],
    },
    'MERCURY': {
        'SUN': [5, 6, 9, 11, 12],
        'MOON': [2, 4, 6, 8, 10, 11],
        'MARS': [1, 2, 4, 7, 8, 9, 10, 11],
        'MERCURY': [1, 3, 5, 6, 9, 10, 11, 12],
        'JUPITER': [6, 8, 11, 12],
        'VENUS': [1, 2, 3, 4, 5, 8, 9, 11],
        'SATURN': [1, 2, 4, 7, 8, 9, 10, 11],
        'ASCENDANT': [1, 2, 4, 6, 8, 10, 11],
    },
    'JUPITER': {
        'SUN': [1, 2, 3, 4, 7, 8, 9, 10, 11],
        'MOON': [2, 5, 7, 9, 11],
        'MARS': [1, 2, 4, 7, 8, 10, 11],
        'MERCURY': [1, 2, 4, 5, 6, 9, 10, 11],
        'JUPITER': [1, 2, 3, 4, 7, 8, 10, 11],
        'VENUS': [2, 5, 6, 9, 10, 11],
        'SATURN': [3, 5, 6, 12],
        'ASCENDANT': [1, 2, 4, 5, 6, 7, 9, 10, 11],
    },
    'VENUS': {
        'SUN': [8, 11, 12],
        'MOON': [1, 2, 3, 4, 5, 8, 9, 11, 12],
        'MARS': [3, 5, 6, 9, 11, 12],
        'MERCURY': [3, 5, 6, 9, 11],
        'JUPITER': [5, 8, 9, 10, 11],
        'VENUS': [1, 2, 3, 4, 5, 8, 9, 10, 11],
        'SATURN': [3, 4, 5, 8, 9, 10, 11],
        'ASCENDANT': [1, 2, 3, 4, 5, 8, 9, 11],
    },
    'SATURN': {
        'SUN': [1, 2, 4, 7, 8, 10, 11],
        'MOON': [3, 6, 11],
        'MARS': [3, 5, 6, 10, 11, 12],
        'MERCURY': [6, 8, 9, 10, 11, 12],
        'JUPITER': [5, 6, 11, 12],
        'VENUS': [6, 11, 12],
        'SATURN': [3, 5, 6, 11],
        'ASCENDANT': [1, 3, 4, 6, 10, 11],
    },
}


class Ashtakavarga:
    """
    Calculate Ashtakavarga points for transit prediction.
    """
    
    def __init__(self, positions: Dict[str, int], ascendant_rashi: int):
        """
        Initialize Ashtakavarga calculator.
        
        Args:
            positions: Dictionary of planet names to their rashi (0-11)
            ascendant_rashi: Ascendant sign index (0-11)
        """
        self.positions = positions
        self.ascendant_rashi = ascendant_rashi
    
    def _get_relative_house(self, from_rashi: int, to_rashi: int) -> int:
        """
        Get house number (1-12) of to_rashi from from_rashi.
        """
        return ((to_rashi - from_rashi) % 12) + 1
    
    def calculate_bhinnashtaka(self, planet: str) -> BhinnashtakavargaResult:
        """
        Calculate individual Ashtakavarga (Bhinnashtakavarga) for a planet.
        
        Args:
            planet: Planet name
            
        Returns:
            BhinnashtakavargaResult with bindus in each house
        """
        if planet not in ASHTAKAVARGA_TABLES:
            return BhinnashtakavargaResult(planet=planet, bindus=[0]*12, total_bindus=0)
        
        planet_table = ASHTAKAVARGA_TABLES[planet]
        planet_rashi = self.positions.get(planet, 0)
        
        # Initialize bindus for each sign (0-11)
        bindus = [0] * 12
        
        # Check contribution from each source
        for source, benefic_houses in planet_table.items():
            if source == 'ASCENDANT':
                source_rashi = self.ascendant_rashi
            else:
                source_rashi = self.positions.get(source, 0)
            
            # For each benefic house from source, add bindu
            for house in benefic_houses:
                target_rashi = (source_rashi + house - 1) % 12
                bindus[target_rashi] += 1
        
        return BhinnashtakavargaResult(
            planet=planet,
            bindus=bindus,
            total_bindus=sum(bindus)
        )
    
    def calculate_sarvashtaka(self) -> SarvashtakavargaResult:
        """
        Calculate combined Ashtakavarga (Sarvashtakavarga).
        Sum of all 7 Bhinnashtakavargas.
        """
        planets = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN']
        
        bhinnas = {}
        sarva_bindus = [0] * 12
        
        for planet in planets:
            bhinna = self.calculate_bhinnashtaka(planet)
            bhinnas[planet] = bhinna
            
            for i, bindu in enumerate(bhinna.bindus):
                sarva_bindus[i] += bindu
        
        return SarvashtakavargaResult(
            bindus=sarva_bindus,
            total_bindus=sum(sarva_bindus),
            bhinnas=bhinnas
        )
    
    def calculate_prastara(self, planet: str) -> List[List[int]]:
        """
        Generate Prastara Ashtakavarga (8x12 matrix).
        Shows contribution from each source to each house.
        
        Returns:
            8x12 matrix (8 sources x 12 signs)
        """
        if planet not in ASHTAKAVARGA_TABLES:
            return [[0]*12 for _ in range(8)]
        
        planet_table = ASHTAKAVARGA_TABLES[planet]
        sources = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'ASCENDANT']
        
        prastara = []
        
        for source in sources:
            row = [0] * 12
            
            if source == 'ASCENDANT':
                source_rashi = self.ascendant_rashi
            else:
                source_rashi = self.positions.get(source, 0)
            
            benefic_houses = planet_table.get(source, [])
            
            for house in benefic_houses:
                target_rashi = (source_rashi + house - 1) % 12
                row[target_rashi] = 1
            
            prastara.append(row)
        
        return prastara
    
    def trikona_reduction(self, bindus: List[int]) -> List[int]:
        """
        Trikona Shodhana (Triangular reduction).
        Reduces points based on 1-5-9 relationship.
        """
        reduced = bindus.copy()
        
        # Process each trikona group (4 groups)
        for start in range(4):
            houses = [start, (start + 4) % 12, (start + 8) % 12]
            min_val = min(reduced[h] for h in houses)
            
            for h in houses:
                reduced[h] -= min_val
        
        return reduced
    
    def ekadhipatya_reduction(self, bindus: List[int]) -> List[int]:
        """
        Ekadhipatya Shodhana (Single lordship reduction).
        Further reduction for signs with same lord.
        """
        reduced = bindus.copy()
        
        # Signs with same lord
        same_lord_pairs = [
            (0, 7),   # Mars: Aries-Scorpio
            (1, 6),   # Venus: Taurus-Libra
            (2, 5),   # Mercury: Gemini-Virgo
            (8, 11),  # Jupiter: Sagittarius-Pisces
            (9, 10),  # Saturn: Capricorn-Aquarius
        ]
        
        for sign1, sign2 in same_lord_pairs:
            min_val = min(reduced[sign1], reduced[sign2])
            reduced[sign1] -= min_val
            reduced[sign2] -= min_val
        
        return reduced
    
    def analyze_transit(self, transit_planet: str, transit_rashi: int) -> Dict:
        """
        Analyze transit effectiveness using Ashtakavarga.
        
        Args:
            transit_planet: Planet in transit
            transit_rashi: Sign of transit (0-11)
            
        Returns:
            Analysis with bindu count and quality assessment
        """
        bhinna = self.calculate_bhinnashtaka(transit_planet)
        bindu_count = bhinna.bindus[transit_rashi]
        
        # Quality assessment
        if bindu_count >= 5:
            quality = 'excellent'
        elif bindu_count == 4:
            quality = 'good'
        elif bindu_count == 3:
            quality = 'neutral'
        else:
            quality = 'difficult'
        
        sarva = self.calculate_sarvashtaka()
        sarva_bindus = sarva.bindus[transit_rashi]
        
        # Sarva quality
        if sarva_bindus >= 30:
            sarva_quality = 'excellent'
        elif sarva_bindus >= 25:
            sarva_quality = 'good'
        elif sarva_bindus >= 20:
            sarva_quality = 'neutral'
        else:
            sarva_quality = 'challenging'
        
        return {
            'planet': transit_planet,
            'transit_sign': transit_rashi,
            'bhinna_bindus': bindu_count,
            'bhinna_quality': quality,
            'sarva_bindus': sarva_bindus,
            'sarva_quality': sarva_quality,
            'recommendation': self._get_recommendation(quality, sarva_quality)
        }
    
    def _get_recommendation(self, bhinna_quality: str, sarva_quality: str) -> str:
        """Generate recommendation based on transit quality."""
        if bhinna_quality in ['excellent', 'good'] and sarva_quality in ['excellent', 'good']:
            return 'Highly favorable period for activities related to this planet'
        elif bhinna_quality in ['excellent', 'good']:
            return 'Favorable for planet-specific matters, general caution advised'
        elif sarva_quality in ['excellent', 'good']:
            return 'Generally positive environment, some planet-specific challenges'
        elif bhinna_quality == 'neutral' and sarva_quality == 'neutral':
            return 'Mixed results expected, proceed with awareness'
        else:
            return 'Challenging period, patience and remedial measures recommended'

