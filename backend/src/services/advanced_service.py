"""
Advanced calculation services for Vedic Astrology.
"""

from datetime import datetime
from typing import Dict, List, Optional

from ..core.ephemeris import get_planet_positions, datetime_to_jd
from ..core.rashi import RASHIS
from ..core.nakshatra import get_nakshatra
from ..core.divisional import DivisionalCharts
from ..core.shadbala import Shadbala
from ..core.ashtakavarga import Ashtakavarga
from ..core.yogas import YogaCalculator
from ..core.panchanga import Panchanga, MuhurtaSelector
from ..models.schemas import BirthData


class AdvancedChartService:
    """Service for advanced Vedic astrology calculations."""
    
    def __init__(self):
        self.divisional = DivisionalCharts()
    
    def get_divisional_chart(self, birth_data: BirthData, division: str) -> Dict:
        """
        Get a specific divisional chart.
        
        Args:
            birth_data: Birth information
            division: Division code (D1, D2, D3, D7, D9, D10, etc.)
        """
        positions = get_planet_positions(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            timezone=birth_data.timezone,
            ayanamsa=birth_data.ayanamsa
        )
        
        chart_names = {
            'D1': ('Rashi', 'Physical body, overall life'),
            'D2': ('Hora', 'Wealth, financial prosperity'),
            'D3': ('Drekkana', 'Siblings, courage, initiatives'),
            'D4': ('Chaturthamsa', 'Fortune, property'),
            'D7': ('Saptamsa', 'Children, progeny'),
            'D9': ('Navamsa', 'Spouse, dharma, spiritual life'),
            'D10': ('Dasamsa', 'Career, profession'),
            'D12': ('Dwadasamsa', 'Parents, ancestry'),
            'D16': ('Shodasamsa', 'Vehicles, comforts'),
            'D20': ('Vimsamsa', 'Spiritual progress'),
            'D24': ('Chaturvimsamsa', 'Education, learning'),
            'D30': ('Trimsamsa', 'Evils, misfortunes'),
            'D60': ('Shashtiamsa', 'Past life karma'),
        }
        
        method_map = {
            'D1': self.divisional.calculate_d1,
            'D2': self.divisional.calculate_hora,
            'D3': self.divisional.calculate_drekkana,
            'D4': self.divisional.calculate_chaturthamsa,
            'D7': self.divisional.calculate_saptamsa,
            'D9': self.divisional.calculate_navamsa,
            'D10': self.divisional.calculate_dasamsa,
            'D12': self.divisional.calculate_dwadasamsa,
            'D16': self.divisional.calculate_shodasamsa,
            'D20': self.divisional.calculate_vimsamsa,
            'D24': self.divisional.calculate_chaturvimsamsa,
            'D30': self.divisional.calculate_trimsamsa,
            'D60': self.divisional.calculate_shashtiamsa,
        }
        
        if division not in method_map:
            raise ValueError(f"Unknown division: {division}")
        
        calc_method = method_map[division]
        name, description = chart_names[division]
        
        planets_div = {}
        for planet_name, pos in positions.items():
            div_pos = calc_method(pos.longitude)
            planets_div[planet_name] = {
                'rashi': div_pos.rashi,
                'rashi_name': RASHIS[div_pos.rashi],
                'degree': round(div_pos.degree, 2)
            }
        
        return {
            'division': division,
            'name': name,
            'description': description,
            'planets': planets_div,
            'ascendant': planets_div.get('ASCENDANT')
        }
    
    def get_all_divisionals_for_planet(self, birth_data: BirthData, planet: str) -> Dict:
        """Get all divisional positions for a single planet."""
        positions = get_planet_positions(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            timezone=birth_data.timezone,
            ayanamsa=birth_data.ayanamsa
        )
        
        if planet not in positions:
            raise ValueError(f"Unknown planet: {planet}")
        
        longitude = positions[planet].longitude
        all_divs = self.divisional.get_all_divisional_positions(longitude)
        is_vargottama = self.divisional.is_vargottama(longitude)
        
        result = {}
        for div_name, div_pos in all_divs.items():
            result[div_name] = {
                'rashi': div_pos.rashi,
                'rashi_name': RASHIS[div_pos.rashi],
                'degree': round(div_pos.degree, 2)
            }
        
        return {
            'planet': planet,
            'divisions': result,
            'is_vargottama': is_vargottama
        }
    
    def get_shadbala(self, birth_data: BirthData) -> Dict:
        """Calculate Shadbala for all planets."""
        positions = get_planet_positions(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            timezone=birth_data.timezone,
            ayanamsa=birth_data.ayanamsa
        )
        
        ascendant_rashi = positions['ASCENDANT'].rashi
        
        # Determine if day birth (simplified)
        hour = birth_data.date.hour
        is_day_birth = 6 <= hour < 18
        
        shadbala_calc = Shadbala(
            positions={p: pos.rashi for p, pos in positions.items()},
            ascendant_rashi=ascendant_rashi,
            birth_time=birth_data.date,
            is_day_birth=is_day_birth
        )
        
        results = []
        planets = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN']
        
        for planet in planets:
            if planet not in positions:
                continue
            
            pos = positions[planet]
            varga_positions = self.divisional.get_all_divisional_positions(pos.longitude)
            
            result = shadbala_calc.calculate_shadbala(
                planet=planet,
                longitude=pos.longitude,
                speed=pos.speed,
                varga_positions=varga_positions,
                aspects=[]
            )
            
            strength_pct = (result.total_shadbala / result.required_strength) * 100
            
            results.append({
                'planet': planet,
                'sthana_bala': result.sthana_bala,
                'dig_bala': result.dig_bala,
                'kala_bala': result.kala_bala,
                'chesta_bala': result.chesta_bala,
                'naisargika_bala': result.naisargika_bala,
                'drik_bala': result.drik_bala,
                'total_shadbala': result.total_shadbala,
                'required_strength': result.required_strength,
                'is_strong': result.is_strong,
                'strength_percentage': round(strength_pct, 1)
            })
        
        # Find strongest and weakest
        sorted_results = sorted(results, key=lambda x: x['total_shadbala'], reverse=True)
        
        return {
            'planets': results,
            'strongest_planet': sorted_results[0]['planet'] if sorted_results else None,
            'weakest_planet': sorted_results[-1]['planet'] if sorted_results else None
        }
    
    def get_ashtakavarga(self, birth_data: BirthData) -> Dict:
        """Calculate Ashtakavarga for the chart."""
        positions = get_planet_positions(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            timezone=birth_data.timezone,
            ayanamsa=birth_data.ayanamsa
        )
        
        planet_rashis = {p: pos.rashi for p, pos in positions.items()}
        ascendant_rashi = positions['ASCENDANT'].rashi
        
        ashtaka = Ashtakavarga(planet_rashis, ascendant_rashi)
        sarva = ashtaka.calculate_sarvashtaka()
        
        bhinnas = {}
        for planet, bhinna in sarva.bhinnas.items():
            prastara = ashtaka.calculate_prastara(planet)
            bhinnas[planet] = {
                'planet': planet,
                'bindus': bhinna.bindus,
                'total_bindus': bhinna.total_bindus,
                'prastara': prastara
            }
        
        trikona_reduced = ashtaka.trikona_reduction(sarva.bindus)
        
        return {
            'bindus': sarva.bindus,
            'total_bindus': sarva.total_bindus,
            'bhinnas': bhinnas,
            'trikona_reduced': trikona_reduced
        }
    
    def analyze_transit(self, birth_data: BirthData, 
                       transit_planet: str, transit_rashi: int) -> Dict:
        """Analyze a planetary transit using Ashtakavarga."""
        positions = get_planet_positions(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            timezone=birth_data.timezone,
            ayanamsa=birth_data.ayanamsa
        )
        
        planet_rashis = {p: pos.rashi for p, pos in positions.items()}
        ascendant_rashi = positions['ASCENDANT'].rashi
        
        ashtaka = Ashtakavarga(planet_rashis, ascendant_rashi)
        analysis = ashtaka.analyze_transit(transit_planet, transit_rashi)
        
        analysis['transit_sign_name'] = RASHIS[transit_rashi]
        return analysis
    
    def get_yogas(self, birth_data: BirthData) -> Dict:
        """Detect all yogas in the chart."""
        positions = get_planet_positions(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            timezone=birth_data.timezone,
            ayanamsa=birth_data.ayanamsa
        )
        
        planet_rashis = {p: pos.rashi for p, pos in positions.items()}
        ascendant_rashi = positions['ASCENDANT'].rashi
        
        yoga_calc = YogaCalculator(planet_rashis, ascendant_rashi)
        all_yogas = yoga_calc.detect_all_yogas()
        
        # Categorize yogas
        rajayogas = [y for y in all_yogas if y.category in ['rajayoga', 'mahapurusha']]
        dhana_yogas = [y for y in all_yogas if y.category == 'dhana']
        other_yogas = [y for y in all_yogas if y.category not in ['rajayoga', 'mahapurusha', 'dhana']]
        
        def yoga_to_dict(yoga):
            return {
                'name': yoga.name,
                'sanskrit_name': yoga.sanskrit_name,
                'category': yoga.category,
                'planets_involved': yoga.planets_involved,
                'houses_involved': yoga.houses_involved,
                'strength': yoga.strength,
                'effects': yoga.effects,
                'is_present': yoga.is_present
            }
        
        return {
            'total_yogas': len(all_yogas),
            'rajayogas': [yoga_to_dict(y) for y in rajayogas],
            'dhana_yogas': [yoga_to_dict(y) for y in dhana_yogas],
            'other_yogas': [yoga_to_dict(y) for y in other_yogas]
        }
    
    def get_panchanga(self, birth_data: BirthData, 
                      sunrise: Optional[datetime] = None,
                      sunset: Optional[datetime] = None) -> Dict:
        """Get Panchanga for the birth time."""
        positions = get_planet_positions(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            timezone=birth_data.timezone,
            ayanamsa=birth_data.ayanamsa
        )
        
        sun_lon = positions['SUN'].longitude
        moon_lon = positions['MOON'].longitude
        
        nakshatra_info = get_nakshatra(moon_lon)
        
        panchanga = Panchanga(sun_lon, moon_lon)
        result = panchanga.get_panchanga(
            date=birth_data.date,
            nakshatra_info=nakshatra_info,
            sunrise=sunrise,
            sunset=sunset
        )
        
        response = {
            'datetime': result.datetime,
            'tithi': {
                'number': result.tithi.number,
                'name': result.tithi.name,
                'paksha': result.tithi.paksha,
                'lord': result.tithi.lord,
                'remaining_degrees': round(result.tithi.remaining_degrees, 2),
                'is_purnima': result.tithi.is_purnima,
                'is_amavasya': result.tithi.is_amavasya
            },
            'nakshatra': result.nakshatra,
            'yoga': {
                'number': result.yoga.number,
                'name': result.yoga.name,
                'nature': result.yoga.nature,
                'remaining_degrees': round(result.yoga.remaining_degrees, 2)
            },
            'karana': {
                'number': result.karana.number,
                'name': result.karana.name,
                'type': result.karana.type
            },
            'vara': {
                'number': result.vara.number,
                'name': result.vara.name,
                'sanskrit_name': result.vara.sanskrit_name,
                'lord': result.vara.lord
            },
            'is_auspicious': result.is_auspicious,
            'special_notes': result.special_notes
        }
        
        if result.rahu_kaal:
            response['rahu_kaal'] = {
                'start': result.rahu_kaal[0],
                'end': result.rahu_kaal[1],
                'duration_minutes': (result.rahu_kaal[1] - result.rahu_kaal[0]).seconds / 60
            }
        
        if result.gulika_kaal:
            response['gulika_kaal'] = {
                'start': result.gulika_kaal[0],
                'end': result.gulika_kaal[1],
                'duration_minutes': (result.gulika_kaal[1] - result.gulika_kaal[0]).seconds / 60
            }
        
        return response

