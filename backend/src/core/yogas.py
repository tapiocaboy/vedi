"""
Yoga Calculations for Vedic Astrology.
Detects various planetary combinations (Yogas) in a horoscope.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class YogaResult:
    """Result of a yoga detection."""
    name: str
    sanskrit_name: str
    category: str  # rajayoga, dhana, daridra, nabhasa, etc.
    planets_involved: List[str]
    houses_involved: List[int]
    strength: str  # strong, medium, weak
    effects: str
    is_present: bool


# Planetary relationships
NATURAL_FRIENDS = {
    'SUN': ['MOON', 'MARS', 'JUPITER'],
    'MOON': ['SUN', 'MERCURY'],
    'MARS': ['SUN', 'MOON', 'JUPITER'],
    'MERCURY': ['SUN', 'VENUS'],
    'JUPITER': ['SUN', 'MOON', 'MARS'],
    'VENUS': ['MERCURY', 'SATURN'],
    'SATURN': ['MERCURY', 'VENUS'],
}

NATURAL_ENEMIES = {
    'SUN': ['SATURN', 'VENUS'],
    'MOON': [],
    'MARS': ['MERCURY'],
    'MERCURY': ['MOON'],
    'JUPITER': ['MERCURY', 'VENUS'],
    'VENUS': ['SUN', 'MOON'],
    'SATURN': ['SUN', 'MOON', 'MARS'],
}

# Benefic and malefic classification
NATURAL_BENEFICS = ['JUPITER', 'VENUS', 'MERCURY', 'MOON']  # Mercury when unafflicted, Moon when waxing
NATURAL_MALEFICS = ['SATURN', 'MARS', 'SUN', 'RAHU', 'KETU']

# House classifications
KENDRAS = [1, 4, 7, 10]  # Angular houses
TRIKONAS = [1, 5, 9]      # Trine houses
DUSTHANAS = [6, 8, 12]    # Evil houses
UPACHAYAS = [3, 6, 10, 11]  # Growing houses


class YogaCalculator:
    """
    Detect various yogas in a horoscope.
    """
    
    def __init__(self, positions: Dict[str, int], ascendant_rashi: int):
        """
        Initialize yoga calculator.
        
        Args:
            positions: Dictionary of planet names to their rashi (0-11)
            ascendant_rashi: Ascendant sign index (0-11)
        """
        self.positions = positions
        self.ascendant_rashi = ascendant_rashi
        self._calculate_houses()
    
    def _calculate_houses(self):
        """Calculate house positions for all planets."""
        self.houses = {}
        for planet, rashi in self.positions.items():
            house = ((rashi - self.ascendant_rashi) % 12) + 1
            self.houses[planet] = house
    
    def _get_planets_in_house(self, house: int) -> List[str]:
        """Get all planets in a specific house."""
        return [p for p, h in self.houses.items() if h == house]
    
    def _get_house_lord(self, house: int) -> str:
        """Get the lord of a house."""
        sign = (self.ascendant_rashi + house - 1) % 12
        return self._get_sign_lord(sign)
    
    def _get_sign_lord(self, sign: int) -> str:
        """Get the lord of a sign."""
        SIGN_LORDS = {
            0: 'MARS', 1: 'VENUS', 2: 'MERCURY', 3: 'MOON',
            4: 'SUN', 5: 'MERCURY', 6: 'VENUS', 7: 'MARS',
            8: 'JUPITER', 9: 'SATURN', 10: 'SATURN', 11: 'JUPITER'
        }
        return SIGN_LORDS[sign]
    
    def _is_in_kendra(self, planet: str) -> bool:
        """Check if planet is in a Kendra (angular house)."""
        return self.houses.get(planet, 0) in KENDRAS
    
    def _is_in_trikona(self, planet: str) -> bool:
        """Check if planet is in a Trikona (trine house)."""
        return self.houses.get(planet, 0) in TRIKONAS
    
    def _get_house_distance(self, planet1: str, planet2: str) -> int:
        """Get house distance between two planets."""
        h1 = self.houses.get(planet1, 0)
        h2 = self.houses.get(planet2, 0)
        return ((h2 - h1) % 12) + 1
    
    def detect_gajakesari_yoga(self) -> Optional[YogaResult]:
        """
        Detect Gajakesari Yoga.
        Jupiter in Kendra (1, 4, 7, 10) from Moon.
        Effects: Fame, wealth, intelligence, leadership.
        """
        moon_house = self.houses.get('MOON', 0)
        jupiter_house = self.houses.get('JUPITER', 0)
        
        # Calculate Jupiter's position from Moon
        distance = ((jupiter_house - moon_house) % 12) + 1
        
        is_present = distance in [1, 4, 7, 10]
        
        # Check strength
        strength = 'weak'
        if is_present:
            if self._is_in_kendra('JUPITER'):
                strength = 'strong'
            elif self._is_in_trikona('JUPITER'):
                strength = 'medium'
        
        return YogaResult(
            name='Gajakesari Yoga',
            sanskrit_name='गजकेसरी योग',
            category='rajayoga',
            planets_involved=['MOON', 'JUPITER'],
            houses_involved=[moon_house, jupiter_house],
            strength=strength,
            effects='Fame, wealth, intelligence, leadership, long-lasting reputation',
            is_present=is_present
        )
    
    def detect_pancha_mahapurusha_yogas(self) -> List[YogaResult]:
        """
        Detect Pancha Mahapurusha Yogas.
        Mars/Mercury/Jupiter/Venus/Saturn in own/exalted sign in Kendra.
        """
        yogas = []
        
        MAHAPURUSHA = {
            'MARS': ('Ruchaka', 'रुचक', [0, 7], [9]),  # Aries/Scorpio, Capricorn
            'MERCURY': ('Bhadra', 'भद्र', [2, 5], [5]),  # Gemini/Virgo
            'JUPITER': ('Hamsa', 'हंस', [8, 11], [3]),  # Sagittarius/Pisces, Cancer
            'VENUS': ('Malavya', 'मालव्य', [1, 6], [11]),  # Taurus/Libra, Pisces
            'SATURN': ('Shasha', 'शश', [9, 10], [6]),  # Capricorn/Aquarius, Libra
        }
        
        for planet, (name, sanskrit, own_signs, exalt_signs) in MAHAPURUSHA.items():
            if planet not in self.positions:
                continue
            
            planet_rashi = self.positions[planet]
            planet_house = self.houses[planet]
            
            in_own = planet_rashi in own_signs
            in_exalted = planet_rashi in exalt_signs
            in_kendra = planet_house in KENDRAS
            
            is_present = (in_own or in_exalted) and in_kendra
            
            strength = 'strong' if in_exalted and in_kendra else 'medium' if is_present else 'weak'
            
            EFFECTS = {
                'MARS': 'Valor, courage, leadership, military success, strong physique',
                'MERCURY': 'Intelligence, eloquence, learning, business acumen',
                'JUPITER': 'Wisdom, spirituality, teaching ability, righteous conduct',
                'VENUS': 'Beauty, luxury, artistic talents, marital happiness',
                'SATURN': 'Leadership over masses, authority, longevity, discipline',
            }
            
            yogas.append(YogaResult(
                name=f'{name} Yoga',
                sanskrit_name=f'{sanskrit} योग',
                category='mahapurusha',
                planets_involved=[planet],
                houses_involved=[planet_house],
                strength=strength,
                effects=EFFECTS[planet],
                is_present=is_present
            ))
        
        return yogas
    
    def detect_kendra_trikona_rajayoga(self) -> List[YogaResult]:
        """
        Detect Kendra-Trikona Rajayoga.
        Lords of Kendra and Trikona houses connected.
        """
        yogas = []
        
        kendra_lords = [self._get_house_lord(h) for h in [1, 4, 7, 10]]
        trikona_lords = [self._get_house_lord(h) for h in [5, 9]]  # 1st already in kendras
        
        for k_lord in kendra_lords:
            for t_lord in trikona_lords:
                if k_lord == t_lord:
                    continue  # Same planet
                
                k_house = self.houses.get(k_lord, 0)
                t_house = self.houses.get(t_lord, 0)
                
                # Check if they are conjunct or in mutual aspect
                are_conjunct = k_house == t_house
                are_in_mutual_kendra = ((t_house - k_house) % 12 + 1) in [1, 4, 7, 10]
                
                is_present = are_conjunct or are_in_mutual_kendra
                
                if is_present:
                    strength = 'strong' if are_conjunct else 'medium'
                    
                    yogas.append(YogaResult(
                        name='Kendra-Trikona Rajayoga',
                        sanskrit_name='केन्द्र-त्रिकोण राजयोग',
                        category='rajayoga',
                        planets_involved=[k_lord, t_lord],
                        houses_involved=[k_house, t_house],
                        strength=strength,
                        effects='Power, authority, success, rise in life, leadership',
                        is_present=True
                    ))
        
        return yogas
    
    def detect_dhana_yogas(self) -> List[YogaResult]:
        """
        Detect Dhana Yogas (wealth combinations).
        """
        yogas = []
        
        # 2nd and 11th lords connection
        lord_2 = self._get_house_lord(2)
        lord_11 = self._get_house_lord(11)
        
        house_2_lord = self.houses.get(lord_2, 0)
        house_11_lord = self.houses.get(lord_11, 0)
        
        # Check conjunction or mutual kendra
        are_conjunct = house_2_lord == house_11_lord
        are_connected = ((house_11_lord - house_2_lord) % 12 + 1) in [1, 4, 7, 10]
        
        if are_conjunct or are_connected:
            yogas.append(YogaResult(
                name='Dhana Yoga (2-11)',
                sanskrit_name='धन योग',
                category='dhana',
                planets_involved=[lord_2, lord_11],
                houses_involved=[2, 11],
                strength='strong' if are_conjunct else 'medium',
                effects='Accumulation of wealth, financial prosperity',
                is_present=True
            ))
        
        # 5th and 9th lords connection
        lord_5 = self._get_house_lord(5)
        lord_9 = self._get_house_lord(9)
        
        house_5_lord = self.houses.get(lord_5, 0)
        house_9_lord = self.houses.get(lord_9, 0)
        
        are_conjunct = house_5_lord == house_9_lord
        are_connected = ((house_9_lord - house_5_lord) % 12 + 1) in [1, 4, 7, 10]
        
        if are_conjunct or are_connected:
            yogas.append(YogaResult(
                name='Lakshmi Yoga',
                sanskrit_name='लक्ष्मी योग',
                category='dhana',
                planets_involved=[lord_5, lord_9],
                houses_involved=[5, 9],
                strength='strong' if are_conjunct else 'medium',
                effects='Wealth through merit and fortune, divine grace',
                is_present=True
            ))
        
        return yogas
    
    def detect_kemadruma_yoga(self) -> Optional[YogaResult]:
        """
        Detect Kemadruma Yoga (poverty yoga).
        No planets in 2nd or 12th from Moon.
        """
        moon_house = self.houses.get('MOON', 0)
        
        house_2_from_moon = (moon_house % 12) + 1  # Next house
        house_12_from_moon = ((moon_house - 2) % 12) + 1  # Previous house
        
        planets_2nd = self._get_planets_in_house(house_2_from_moon)
        planets_12th = self._get_planets_in_house(house_12_from_moon)
        
        # Exclude Moon itself and nodes
        planets_2nd = [p for p in planets_2nd if p not in ['MOON', 'RAHU', 'KETU']]
        planets_12th = [p for p in planets_12th if p not in ['MOON', 'RAHU', 'KETU']]
        
        is_present = len(planets_2nd) == 0 and len(planets_12th) == 0
        
        # Check for cancellation (planet in Kendra from Moon or Lagna)
        cancelled = False
        for planet in ['JUPITER', 'VENUS', 'MERCURY']:
            if self._is_in_kendra(planet):
                cancelled = True
                break
        
        return YogaResult(
            name='Kemadruma Yoga',
            sanskrit_name='केमद्रुम योग',
            category='daridra',
            planets_involved=['MOON'],
            houses_involved=[moon_house],
            strength='weak' if cancelled else 'medium',
            effects='Financial difficulties, lack of support (cancelled if benefics in Kendra)',
            is_present=is_present and not cancelled
        )
    
    def detect_viparita_rajayoga(self) -> List[YogaResult]:
        """
        Detect Viparita Rajayoga.
        Lords of 6, 8, 12 in 6, 8, or 12 (mutual exchange or placement).
        """
        yogas = []
        
        dusthana_houses = [6, 8, 12]
        dusthana_lords = [self._get_house_lord(h) for h in dusthana_houses]
        
        for i, lord in enumerate(dusthana_lords):
            lord_house = self.houses.get(lord, 0)
            
            if lord_house in dusthana_houses:
                yogas.append(YogaResult(
                    name=f'Viparita Rajayoga ({dusthana_houses[i]}th lord)',
                    sanskrit_name='विपरीत राजयोग',
                    category='rajayoga',
                    planets_involved=[lord],
                    houses_involved=[dusthana_houses[i], lord_house],
                    strength='medium',
                    effects='Rise through unconventional means, gains from obstacles',
                    is_present=True
                ))
        
        return yogas
    
    def detect_budhaditya_yoga(self) -> Optional[YogaResult]:
        """
        Detect Budhaditya Yoga.
        Sun and Mercury conjunction (Mercury not combust).
        """
        sun_house = self.houses.get('SUN', 0)
        mercury_house = self.houses.get('MERCURY', 0)
        
        is_conjunct = sun_house == mercury_house
        
        # Check combustion (simplified - Mercury within ~14° of Sun)
        # Would need actual degree positions for accurate check
        
        return YogaResult(
            name='Budhaditya Yoga',
            sanskrit_name='बुधादित्य योग',
            category='rajayoga',
            planets_involved=['SUN', 'MERCURY'],
            houses_involved=[sun_house, mercury_house],
            strength='medium' if is_conjunct else 'weak',
            effects='Intelligence, fame through learning, communication skills',
            is_present=is_conjunct
        )
    
    def detect_all_yogas(self) -> List[YogaResult]:
        """
        Detect all major yogas in the chart.
        """
        yogas = []
        
        # Gajakesari
        gk = self.detect_gajakesari_yoga()
        if gk and gk.is_present:
            yogas.append(gk)
        
        # Pancha Mahapurusha
        for yoga in self.detect_pancha_mahapurusha_yogas():
            if yoga.is_present:
                yogas.append(yoga)
        
        # Kendra-Trikona Rajayoga
        yogas.extend(self.detect_kendra_trikona_rajayoga())
        
        # Dhana Yogas
        yogas.extend(self.detect_dhana_yogas())
        
        # Kemadruma
        kem = self.detect_kemadruma_yoga()
        if kem and kem.is_present:
            yogas.append(kem)
        
        # Viparita Rajayoga
        yogas.extend(self.detect_viparita_rajayoga())
        
        # Budhaditya
        bud = self.detect_budhaditya_yoga()
        if bud and bud.is_present:
            yogas.append(bud)
        
        return yogas

