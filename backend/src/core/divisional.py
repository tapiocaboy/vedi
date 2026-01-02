"""
Divisional Charts (Varga Charts) calculations for Vedic Astrology.
Implements Shodashavarga (16 divisions) system.
"""

from typing import Dict, List, NamedTuple
from dataclasses import dataclass


@dataclass
class DivisionalPosition:
    """Position in a divisional chart."""
    longitude: float
    rashi: int  # 0-11
    degree: float  # Degree within rashi


class DivisionalCharts:
    """
    Calculate all 16 divisional charts (Shodashavarga).
    """
    
    # Element classification for signs
    FIRE_SIGNS = [0, 4, 8]      # Aries, Leo, Sagittarius
    EARTH_SIGNS = [1, 5, 9]     # Taurus, Virgo, Capricorn
    AIR_SIGNS = [2, 6, 10]      # Gemini, Libra, Aquarius
    WATER_SIGNS = [3, 7, 11]    # Cancer, Scorpio, Pisces
    
    def get_rashi(self, longitude: float) -> int:
        """Get rashi index from longitude."""
        return int((longitude % 360) / 30)
    
    def get_degree_in_rashi(self, longitude: float) -> float:
        """Get degree within rashi."""
        return (longitude % 360) % 30
    
    def calculate_d1(self, longitude: float) -> DivisionalPosition:
        """
        D-1 Rashi Chart - Same as birth chart.
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        return DivisionalPosition(longitude=longitude, rashi=rashi, degree=degree)
    
    def calculate_hora(self, longitude: float) -> DivisionalPosition:
        """
        D-2 Hora Chart - Wealth, financial prosperity.
        - Odd signs: First 15° = Sun (Leo), Next 15° = Moon (Cancer)
        - Even signs: First 15° = Moon (Cancer), Next 15° = Sun (Leo)
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        is_odd_sign = rashi % 2 == 0  # 0, 2, 4... are odd signs in 0-indexed
        
        if degree < 15:
            # First half
            hora_rashi = 4 if is_odd_sign else 3  # Leo if odd, Cancer if even
        else:
            # Second half
            hora_rashi = 3 if is_odd_sign else 4  # Cancer if odd, Leo if even
        
        hora_degree = degree % 15 * 2  # Scale to 30 degrees
        return DivisionalPosition(longitude=hora_rashi * 30 + hora_degree, 
                                 rashi=hora_rashi, degree=hora_degree)
    
    def calculate_drekkana(self, longitude: float) -> DivisionalPosition:
        """
        D-3 Drekkana Chart - Siblings, courage, initiatives.
        - First 10° = Same sign
        - Second 10° = 5th from sign
        - Third 10° = 9th from sign
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        
        if degree < 10:
            drekkana_rashi = rashi
        elif degree < 20:
            drekkana_rashi = (rashi + 4) % 12  # 5th from sign
        else:
            drekkana_rashi = (rashi + 8) % 12  # 9th from sign
        
        drekkana_degree = (degree % 10) * 3  # Scale to 30 degrees
        return DivisionalPosition(longitude=drekkana_rashi * 30 + drekkana_degree,
                                 rashi=drekkana_rashi, degree=drekkana_degree)
    
    def calculate_chaturthamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-4 Chaturthamsa Chart - Fortune, property, fixed assets.
        Each division = 7.5°
        - Odd signs: Start from same sign
        - Even signs: Start from 4th sign
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        is_odd_sign = rashi % 2 == 0
        
        division = int(degree / 7.5)  # 0-3
        start_rashi = rashi if is_odd_sign else (rashi + 3) % 12
        d4_rashi = (start_rashi + division) % 12
        
        d4_degree = (degree % 7.5) * 4  # Scale to 30 degrees
        return DivisionalPosition(longitude=d4_rashi * 30 + d4_degree,
                                 rashi=d4_rashi, degree=d4_degree)
    
    def calculate_saptamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-7 Saptamsa Chart - Children, progeny.
        Each division = 4°17'8.57" (30/7)
        - Odd signs: Start from same sign
        - Even signs: Start from 7th sign
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        is_odd_sign = rashi % 2 == 0
        
        division_span = 30.0 / 7.0
        division = int(degree / division_span)  # 0-6
        start_rashi = rashi if is_odd_sign else (rashi + 6) % 12
        d7_rashi = (start_rashi + division) % 12
        
        d7_degree = (degree % division_span) * (30.0 / division_span)
        return DivisionalPosition(longitude=d7_rashi * 30 + d7_degree,
                                 rashi=d7_rashi, degree=d7_degree)
    
    def calculate_navamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-9 Navamsa Chart - Spouse, dharma, spiritual life.
        Each navamsa = 3°20' (3.333°)
        - Fire signs (Aries, Leo, Sag): Start from Aries
        - Earth signs (Tau, Vir, Cap): Start from Capricorn
        - Air signs (Gem, Lib, Aqu): Start from Libra
        - Water signs (Can, Sco, Pis): Start from Cancer
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        
        navamsa_span = 30.0 / 9.0  # 3.333...
        division = int(degree / navamsa_span)  # 0-8
        
        # Determine starting sign based on element
        if rashi in self.FIRE_SIGNS:
            start_rashi = 0   # Aries
        elif rashi in self.EARTH_SIGNS:
            start_rashi = 9   # Capricorn
        elif rashi in self.AIR_SIGNS:
            start_rashi = 6   # Libra
        else:  # Water signs
            start_rashi = 3   # Cancer
        
        navamsa_rashi = (start_rashi + division) % 12
        navamsa_degree = (degree % navamsa_span) * 9
        
        return DivisionalPosition(longitude=navamsa_rashi * 30 + navamsa_degree,
                                 rashi=navamsa_rashi, degree=navamsa_degree)
    
    def calculate_dasamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-10 Dasamsa Chart - Career, profession, status (Parashari method).
        Each division = 3°
        - Odd signs: Start from same sign
        - Even signs: Start from 9th sign
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        is_odd_sign = rashi % 2 == 0
        
        division = int(degree / 3)  # 0-9
        start_rashi = rashi if is_odd_sign else (rashi + 8) % 12  # 9th from sign
        d10_rashi = (start_rashi + division) % 12
        
        d10_degree = (degree % 3) * 10  # Scale to 30 degrees
        return DivisionalPosition(longitude=d10_rashi * 30 + d10_degree,
                                 rashi=d10_rashi, degree=d10_degree)
    
    def calculate_dwadasamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-12 Dwadasamsa Chart - Parents, ancestry.
        Each division = 2.5°
        Starts from same sign, cycles through 12.
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        
        division = int(degree / 2.5)  # 0-11
        d12_rashi = (rashi + division) % 12
        
        d12_degree = (degree % 2.5) * 12  # Scale to 30 degrees
        return DivisionalPosition(longitude=d12_rashi * 30 + d12_degree,
                                 rashi=d12_rashi, degree=d12_degree)
    
    def calculate_shodasamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-16 Shodasamsa Chart - Vehicles, comforts, luxuries.
        Each division = 1.875° (30/16)
        - Movable signs: Start from Aries
        - Fixed signs: Start from Leo
        - Dual signs: Start from Sagittarius
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        
        division_span = 30.0 / 16.0
        division = int(degree / division_span)
        
        # Modality determines starting sign
        if rashi in [0, 3, 6, 9]:    # Movable signs
            start_rashi = 0  # Aries
        elif rashi in [1, 4, 7, 10]:  # Fixed signs
            start_rashi = 4  # Leo
        else:                          # Dual signs
            start_rashi = 8  # Sagittarius
        
        d16_rashi = (start_rashi + division) % 12
        d16_degree = (degree % division_span) * 16
        
        return DivisionalPosition(longitude=d16_rashi * 30 + d16_degree,
                                 rashi=d16_rashi, degree=d16_degree)
    
    def calculate_vimsamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-20 Vimsamsa Chart - Spiritual progress, upasana.
        Each division = 1.5°
        - Movable signs: Start from Aries
        - Fixed signs: Start from Sagittarius
        - Dual signs: Start from Leo
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        
        division = int(degree / 1.5)
        
        if rashi in [0, 3, 6, 9]:      # Movable
            start_rashi = 0  # Aries
        elif rashi in [1, 4, 7, 10]:   # Fixed
            start_rashi = 8  # Sagittarius
        else:                           # Dual
            start_rashi = 4  # Leo
        
        d20_rashi = (start_rashi + division) % 12
        d20_degree = (degree % 1.5) * 20
        
        return DivisionalPosition(longitude=d20_rashi * 30 + d20_degree,
                                 rashi=d20_rashi, degree=d20_degree)
    
    def calculate_chaturvimsamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-24 Chaturvimsamsa Chart - Education, learning.
        Each division = 1.25°
        - Odd signs: Start from Leo
        - Even signs: Start from Cancer
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        is_odd_sign = rashi % 2 == 0
        
        division = int(degree / 1.25)
        start_rashi = 4 if is_odd_sign else 3  # Leo or Cancer
        d24_rashi = (start_rashi + division) % 12
        
        d24_degree = (degree % 1.25) * 24
        return DivisionalPosition(longitude=d24_rashi * 30 + d24_degree,
                                 rashi=d24_rashi, degree=d24_degree)
    
    def calculate_trimsamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-30 Trimsamsa Chart - Evils, misfortunes.
        Odd signs: Mars(5°), Saturn(5°), Jupiter(8°), Mercury(7°), Venus(5°)
        Even signs: Venus(5°), Mercury(7°), Jupiter(8°), Saturn(5°), Mars(5°)
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        is_odd_sign = rashi % 2 == 0
        
        if is_odd_sign:
            bounds = [(5, 0), (10, 10), (18, 8), (25, 2), (30, 1)]  # (end_deg, lord_sign)
            # Mars=Aries(0), Saturn=Cap(10), Jupiter=Sag(8), Mercury=Gem(2), Venus=Tau(1)
        else:
            bounds = [(5, 1), (12, 2), (20, 8), (25, 10), (30, 0)]
            # Venus=Tau(1), Mercury=Gem(2), Jupiter=Sag(8), Saturn=Cap(10), Mars=Aries(0)
        
        d30_rashi = 0
        for end_deg, sign in bounds:
            if degree < end_deg:
                d30_rashi = sign
                break
        
        return DivisionalPosition(longitude=d30_rashi * 30 + degree,
                                 rashi=d30_rashi, degree=degree)
    
    def calculate_shashtiamsa(self, longitude: float) -> DivisionalPosition:
        """
        D-60 Shashtiamsa Chart - Past life karma, subtle effects.
        Each division = 0.5°
        60 portions with specific names and effects.
        """
        rashi = self.get_rashi(longitude)
        degree = self.get_degree_in_rashi(longitude)
        
        division = int(degree / 0.5)  # 0-59
        
        # D-60 cycles through all 12 signs 5 times
        d60_rashi = (rashi + division) % 12
        d60_degree = (degree % 0.5) * 60
        
        return DivisionalPosition(longitude=d60_rashi * 30 + d60_degree,
                                 rashi=d60_rashi, degree=d60_degree)
    
    def get_all_divisional_positions(self, longitude: float) -> Dict[str, DivisionalPosition]:
        """
        Calculate all divisional chart positions for a given longitude.
        """
        return {
            'D1': self.calculate_d1(longitude),
            'D2': self.calculate_hora(longitude),
            'D3': self.calculate_drekkana(longitude),
            'D4': self.calculate_chaturthamsa(longitude),
            'D7': self.calculate_saptamsa(longitude),
            'D9': self.calculate_navamsa(longitude),
            'D10': self.calculate_dasamsa(longitude),
            'D12': self.calculate_dwadasamsa(longitude),
            'D16': self.calculate_shodasamsa(longitude),
            'D20': self.calculate_vimsamsa(longitude),
            'D24': self.calculate_chaturvimsamsa(longitude),
            'D30': self.calculate_trimsamsa(longitude),
            'D60': self.calculate_shashtiamsa(longitude),
        }
    
    def is_vargottama(self, longitude: float) -> bool:
        """
        Check if a planet is Vargottama (same sign in D-1 and D-9).
        Vargottama planets are considered strong.
        """
        d1 = self.calculate_d1(longitude)
        d9 = self.calculate_navamsa(longitude)
        return d1.rashi == d9.rashi

