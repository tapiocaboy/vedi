"""
Dasha Prediction Engine for Vedic Astrology.
Provides detailed predictions for Mahadasha, Antardasha, and Pratyantardasha periods.
Covers health, wealth, career, relationships, and general life events.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class LifeArea(Enum):
    HEALTH = "health"
    WEALTH = "wealth"
    CAREER = "career"
    RELATIONSHIPS = "relationships"
    SPIRITUALITY = "spirituality"
    EDUCATION = "education"
    FAMILY = "family"
    TRAVEL = "travel"
    LEGAL = "legal"
    GENERAL = "general"


@dataclass
class PredictionResult:
    """A single prediction for a life area."""
    area: str
    trend: str  # positive, negative, mixed, neutral
    intensity: str  # strong, moderate, mild
    summary: str
    details: List[str]
    remedies: List[str]
    keywords: List[str]


@dataclass
class DashaPrediction:
    """Complete prediction for a Dasha period."""
    dasha_lord: str
    period_type: str  # mahadasha, antardasha, pratyantardasha
    overall_theme: str
    overall_rating: int  # 1-10
    predictions: Dict[str, PredictionResult]
    favorable_activities: List[str]
    unfavorable_activities: List[str]
    important_transits: List[str]
    gemstone: Optional[str]
    mantra: Optional[str]
    deity: Optional[str]


# Planet characteristics and significations
PLANET_SIGNIFICATIONS = {
    'Sun': {
        'nature': 'malefic',
        'element': 'fire',
        'gender': 'male',
        'keywords': ['authority', 'father', 'government', 'soul', 'vitality', 'ego', 'leadership'],
        'body_parts': ['heart', 'spine', 'right eye', 'bones'],
        'diseases': ['heart problems', 'eye issues', 'fever', 'blood pressure', 'bone disorders'],
        'professions': ['government', 'politics', 'medicine', 'administration', 'leadership roles'],
        'relationships': ['father', 'authority figures', 'employers'],
        'gemstone': 'Ruby',
        'mantra': 'Om Suryaya Namah',
        'deity': 'Surya',
        'day': 'Sunday',
        'color': 'red/golden',
        'metal': 'gold',
        'direction': 'east',
    },
    'Moon': {
        'nature': 'benefic',
        'element': 'water',
        'gender': 'female',
        'keywords': ['mind', 'mother', 'emotions', 'nurturing', 'public', 'travel', 'liquids'],
        'body_parts': ['mind', 'breasts', 'left eye', 'blood', 'stomach'],
        'diseases': ['mental stress', 'depression', 'water retention', 'cold', 'menstrual issues'],
        'professions': ['nursing', 'hospitality', 'shipping', 'dairy', 'public relations'],
        'relationships': ['mother', 'wife', 'public', 'women in general'],
        'gemstone': 'Pearl',
        'mantra': 'Om Chandraya Namah',
        'deity': 'Chandra',
        'day': 'Monday',
        'color': 'white/silver',
        'metal': 'silver',
        'direction': 'northwest',
    },
    'Mars': {
        'nature': 'malefic',
        'element': 'fire',
        'gender': 'male',
        'keywords': ['energy', 'courage', 'brothers', 'property', 'surgery', 'accidents', 'competition'],
        'body_parts': ['muscles', 'blood', 'head', 'marrow', 'energy'],
        'diseases': ['injuries', 'accidents', 'surgery', 'blood disorders', 'inflammation', 'fever'],
        'professions': ['military', 'police', 'engineering', 'surgery', 'sports', 'real estate'],
        'relationships': ['siblings', 'competitors', 'enemies'],
        'gemstone': 'Red Coral',
        'mantra': 'Om Mangalaya Namah',
        'deity': 'Kartikeya',
        'day': 'Tuesday',
        'color': 'red',
        'metal': 'copper',
        'direction': 'south',
    },
    'Mercury': {
        'nature': 'benefic',
        'element': 'earth',
        'gender': 'neutral',
        'keywords': ['intelligence', 'communication', 'business', 'education', 'writing', 'analysis'],
        'body_parts': ['nervous system', 'skin', 'lungs', 'speech', 'hands'],
        'diseases': ['nervous disorders', 'skin problems', 'speech issues', 'respiratory problems'],
        'professions': ['writing', 'teaching', 'accounting', 'trading', 'IT', 'communication'],
        'relationships': ['friends', 'maternal uncle', 'young people'],
        'gemstone': 'Emerald',
        'mantra': 'Om Budhaya Namah',
        'deity': 'Vishnu',
        'day': 'Wednesday',
        'color': 'green',
        'metal': 'brass',
        'direction': 'north',
    },
    'Jupiter': {
        'nature': 'benefic',
        'element': 'ether',
        'gender': 'male',
        'keywords': ['wisdom', 'expansion', 'luck', 'children', 'spirituality', 'teaching', 'wealth'],
        'body_parts': ['liver', 'fat', 'hips', 'thighs', 'arterial system'],
        'diseases': ['liver problems', 'obesity', 'diabetes', 'tumors', 'ear problems'],
        'professions': ['teaching', 'law', 'religion', 'banking', 'advisory', 'philosophy'],
        'relationships': ['husband', 'guru', 'children', 'elders'],
        'gemstone': 'Yellow Sapphire',
        'mantra': 'Om Gurave Namah',
        'deity': 'Brihaspati',
        'day': 'Thursday',
        'color': 'yellow',
        'metal': 'gold',
        'direction': 'northeast',
    },
    'Venus': {
        'nature': 'benefic',
        'element': 'water',
        'gender': 'female',
        'keywords': ['love', 'beauty', 'luxury', 'arts', 'marriage', 'pleasures', 'vehicles'],
        'body_parts': ['reproductive system', 'face', 'eyes', 'throat', 'kidneys'],
        'diseases': ['reproductive issues', 'kidney problems', 'diabetes', 'skin conditions', 'STDs'],
        'professions': ['arts', 'entertainment', 'fashion', 'beauty', 'hospitality', 'luxury goods'],
        'relationships': ['wife', 'lover', 'women', 'artists'],
        'gemstone': 'Diamond',
        'mantra': 'Om Shukraya Namah',
        'deity': 'Lakshmi',
        'day': 'Friday',
        'color': 'white/pink',
        'metal': 'silver',
        'direction': 'southeast',
    },
    'Saturn': {
        'nature': 'malefic',
        'element': 'air',
        'gender': 'neutral',
        'keywords': ['karma', 'discipline', 'delay', 'longevity', 'labor', 'service', 'obstacles'],
        'body_parts': ['bones', 'teeth', 'knees', 'joints', 'nerves'],
        'diseases': ['chronic diseases', 'joint pain', 'arthritis', 'depression', 'paralysis'],
        'professions': ['labor', 'mining', 'agriculture', 'law', 'real estate', 'oil/gas'],
        'relationships': ['servants', 'elderly', 'common people', 'laborers'],
        'gemstone': 'Blue Sapphire',
        'mantra': 'Om Shanaishcharaya Namah',
        'deity': 'Shani',
        'day': 'Saturday',
        'color': 'blue/black',
        'metal': 'iron',
        'direction': 'west',
    },
    'Rahu': {
        'nature': 'malefic',
        'element': 'air',
        'gender': 'neutral',
        'keywords': ['illusion', 'foreign', 'technology', 'unconventional', 'obsession', 'sudden events'],
        'body_parts': ['skin', 'breathing', 'feet', 'nervous system'],
        'diseases': ['mysterious diseases', 'poisoning', 'phobias', 'mental disorders', 'infections'],
        'professions': ['technology', 'foreign trade', 'research', 'politics', 'media', 'aviation'],
        'relationships': ['foreigners', 'outcasts', 'in-laws'],
        'gemstone': 'Hessonite (Gomed)',
        'mantra': 'Om Rahave Namah',
        'deity': 'Durga',
        'day': 'Saturday',
        'color': 'smoky/blue',
        'metal': 'lead',
        'direction': 'southwest',
    },
    'Ketu': {
        'nature': 'malefic',
        'element': 'fire',
        'gender': 'neutral',
        'keywords': ['liberation', 'spirituality', 'past karma', 'detachment', 'occult', 'surgery'],
        'body_parts': ['feet', 'spine', 'skin'],
        'diseases': ['mysterious ailments', 'viral infections', 'accidents', 'wounds', 'surgeries'],
        'professions': ['spirituality', 'research', 'occult', 'healing', 'investigation'],
        'relationships': ['paternal grandfather', 'spiritual guides'],
        'gemstone': "Cat's Eye (Lehsunia)",
        'mantra': 'Om Ketave Namah',
        'deity': 'Ganesha',
        'day': 'Tuesday',
        'color': 'grey/multicolor',
        'metal': 'iron',
        'direction': 'southwest',
    },
}

# Planetary friendships for combined predictions
PLANETARY_RELATIONSHIPS = {
    'Sun': {'friends': ['Moon', 'Mars', 'Jupiter'], 'enemies': ['Saturn', 'Venus'], 'neutral': ['Mercury']},
    'Moon': {'friends': ['Sun', 'Mercury'], 'enemies': [], 'neutral': ['Mars', 'Jupiter', 'Venus', 'Saturn']},
    'Mars': {'friends': ['Sun', 'Moon', 'Jupiter'], 'enemies': ['Mercury'], 'neutral': ['Venus', 'Saturn']},
    'Mercury': {'friends': ['Sun', 'Venus'], 'enemies': ['Moon'], 'neutral': ['Mars', 'Jupiter', 'Saturn']},
    'Jupiter': {'friends': ['Sun', 'Moon', 'Mars'], 'enemies': ['Mercury', 'Venus'], 'neutral': ['Saturn']},
    'Venus': {'friends': ['Mercury', 'Saturn'], 'enemies': ['Sun', 'Moon'], 'neutral': ['Mars', 'Jupiter']},
    'Saturn': {'friends': ['Mercury', 'Venus'], 'enemies': ['Sun', 'Moon', 'Mars'], 'neutral': ['Jupiter']},
    'Rahu': {'friends': ['Venus', 'Saturn'], 'enemies': ['Sun', 'Moon', 'Mars'], 'neutral': ['Mercury', 'Jupiter']},
    'Ketu': {'friends': ['Mars', 'Jupiter'], 'enemies': ['Moon', 'Venus'], 'neutral': ['Sun', 'Mercury', 'Saturn']},
}


class DashaPredictionEngine:
    """
    Engine for generating detailed Dasha predictions.
    """
    
    def __init__(self, chart_data: Optional[Dict] = None):
        """
        Initialize with optional chart data for personalized predictions.
        """
        self.chart_data = chart_data or {}
    
    def get_planet_data(self, planet: str) -> Dict:
        """Get planet significations data."""
        return PLANET_SIGNIFICATIONS.get(planet, {})
    
    def get_relationship(self, planet1: str, planet2: str) -> str:
        """Get relationship between two planets."""
        if planet1 == planet2:
            return 'same'
        
        relations = PLANETARY_RELATIONSHIPS.get(planet1, {})
        if planet2 in relations.get('friends', []):
            return 'friend'
        elif planet2 in relations.get('enemies', []):
            return 'enemy'
        else:
            return 'neutral'
    
    def generate_health_prediction(self, dasha_lord: str, antardasha_lord: Optional[str] = None) -> PredictionResult:
        """Generate health predictions for the period."""
        planet_data = self.get_planet_data(dasha_lord)
        body_parts = planet_data.get('body_parts', [])
        diseases = planet_data.get('diseases', [])
        nature = planet_data.get('nature', 'neutral')
        
        # Base prediction on planet nature
        if nature == 'benefic':
            trend = 'positive'
            intensity = 'moderate'
            summary = f"Generally good health during {dasha_lord} period. Focus on preventive care."
        else:
            trend = 'mixed'
            intensity = 'moderate'
            summary = f"Health requires attention during {dasha_lord} period. Be cautious about specific areas."
        
        details = []
        remedies = []
        
        # Health focus areas
        if body_parts:
            details.append(f"Areas requiring attention: {', '.join(body_parts)}")
        
        if diseases:
            details.append(f"Potential concerns to watch: {', '.join(diseases[:3])}")
        
        # Add antardasha influence
        if antardasha_lord:
            ad_data = self.get_planet_data(antardasha_lord)
            ad_diseases = ad_data.get('diseases', [])
            relationship = self.get_relationship(dasha_lord, antardasha_lord)
            
            if relationship == 'friend':
                details.append(f"{antardasha_lord} antardasha brings supportive energy for recovery")
                if trend == 'mixed':
                    trend = 'positive'
            elif relationship == 'enemy':
                details.append(f"{antardasha_lord} antardasha may intensify health challenges")
                if ad_diseases:
                    details.append(f"Additional concerns: {', '.join(ad_diseases[:2])}")
                if trend == 'positive':
                    trend = 'mixed'
        
        # Specific health predictions by planet
        health_specifics = self._get_planet_health_specifics(dasha_lord)
        details.extend(health_specifics['details'])
        remedies.extend(health_specifics['remedies'])
        
        return PredictionResult(
            area='health',
            trend=trend,
            intensity=intensity,
            summary=summary,
            details=details,
            remedies=remedies,
            keywords=body_parts + diseases[:2]
        )
    
    def _get_planet_health_specifics(self, planet: str) -> Dict:
        """Get planet-specific health predictions."""
        specifics = {
            'Sun': {
                'details': [
                    "Vitality and energy levels may fluctuate",
                    "Eye health needs regular checkups",
                    "Heart and cardiovascular system requires attention",
                    "Maintain good posture to protect spine",
                    "Adequate sun exposure beneficial but avoid excess"
                ],
                'remedies': [
                    "Offer water to the rising Sun daily",
                    "Wear ruby or substitute on Sunday",
                    "Chant Aditya Hridayam for health",
                    "Practice Surya Namaskar regularly",
                    "Include more wheat and jaggery in diet"
                ]
            },
            'Moon': {
                'details': [
                    "Mental and emotional health needs attention",
                    "Sleep quality may be affected - maintain routine",
                    "Stay hydrated and balance fluid intake",
                    "Women may experience hormonal fluctuations",
                    "Digestive system may be sensitive"
                ],
                'remedies': [
                    "Wear pearl on Monday in silver ring",
                    "Drink water from silver vessel",
                    "Practice meditation and pranayama",
                    "Avoid sleeping during the day",
                    "Include milk and rice in diet"
                ]
            },
            'Mars': {
                'details': [
                    "Prone to accidents, injuries - exercise caution",
                    "Blood pressure and blood-related issues possible",
                    "Inflammatory conditions may arise",
                    "Surgeries if needed will be successful",
                    "High energy - channel through exercise"
                ],
                'remedies': [
                    "Wear red coral on Tuesday",
                    "Donate blood regularly if possible",
                    "Avoid anger and aggressive behavior",
                    "Practice cooling pranayama techniques",
                    "Include lentils and red foods in diet"
                ]
            },
            'Mercury': {
                'details': [
                    "Nervous system needs care - avoid overstimulation",
                    "Skin conditions may appear or worsen",
                    "Speech or communication issues possible",
                    "Respiratory health requires attention",
                    "Mental fatigue from overthinking"
                ],
                'remedies': [
                    "Wear emerald on Wednesday in gold",
                    "Practice tongue cleaning daily",
                    "Read and write to keep mind sharp",
                    "Avoid excessive screen time",
                    "Include green vegetables in diet"
                ]
            },
            'Jupiter': {
                'details': [
                    "Weight management becomes important",
                    "Liver and digestive health needs attention",
                    "Blood sugar levels should be monitored",
                    "Overall good recovery from illnesses",
                    "Hip and thigh area may have issues"
                ],
                'remedies': [
                    "Wear yellow sapphire on Thursday",
                    "Fast on Thursdays or reduce food intake",
                    "Respect teachers and elders",
                    "Donate to educational institutions",
                    "Include turmeric and yellow foods in diet"
                ]
            },
            'Venus': {
                'details': [
                    "Reproductive system needs attention",
                    "Kidney and urinary tract health important",
                    "Skin remains healthy with proper care",
                    "Overindulgence in pleasures affects health",
                    "Eye sight may need checking"
                ],
                'remedies': [
                    "Wear diamond or white sapphire on Friday",
                    "Maintain hygiene and cleanliness",
                    "Use rose water for skin and eyes",
                    "Avoid excessive sweets and fats",
                    "Include dairy products and fruits"
                ]
            },
            'Saturn': {
                'details': [
                    "Chronic conditions may surface or worsen",
                    "Joint pain, arthritis needs attention",
                    "Dental health requires regular care",
                    "Mental health - possible depression or anxiety",
                    "Slow recovery from illnesses - patience needed"
                ],
                'remedies': [
                    "Wear blue sapphire with caution after trial",
                    "Serve the elderly and disabled",
                    "Fast on Saturdays",
                    "Practice oil massage (abhyanga) regularly",
                    "Include black sesame and iron-rich foods"
                ]
            },
            'Rahu': {
                'details': [
                    "Mysterious or hard-to-diagnose conditions possible",
                    "Mental health issues - anxiety, phobias",
                    "Allergies and skin conditions may appear",
                    "Avoid intoxicants and addictive substances",
                    "Get second opinions for medical diagnoses"
                ],
                'remedies': [
                    "Wear hessonite (gomed) after consultation",
                    "Chant Durga Saptashati or Rahu mantra",
                    "Avoid non-vegetarian food on Saturdays",
                    "Keep fennel (saunf) near bed for sleep",
                    "Practice grounding exercises"
                ]
            },
            'Ketu': {
                'details': [
                    "Viral and mysterious infections possible",
                    "Accidents especially to feet and spine",
                    "May undergo necessary surgeries",
                    "Spiritual practices improve health",
                    "Past life karmic health issues may surface"
                ],
                'remedies': [
                    "Wear cat's eye after proper consultation",
                    "Worship Lord Ganesha regularly",
                    "Donate blankets to the needy",
                    "Practice meditation and detachment",
                    "Include bananas and root vegetables"
                ]
            },
        }
        return specifics.get(planet, {'details': [], 'remedies': []})
    
    def generate_wealth_prediction(self, dasha_lord: str, antardasha_lord: Optional[str] = None) -> PredictionResult:
        """Generate wealth and financial predictions."""
        planet_data = self.get_planet_data(dasha_lord)
        nature = planet_data.get('nature', 'neutral')
        keywords = planet_data.get('keywords', [])
        
        # Base wealth assessment
        wealth_planets = ['Jupiter', 'Venus', 'Mercury']
        if dasha_lord in wealth_planets:
            trend = 'positive'
            base_summary = f"{dasha_lord} dasha brings opportunities for financial growth and prosperity."
        elif dasha_lord in ['Saturn', 'Ketu']:
            trend = 'mixed'
            base_summary = f"{dasha_lord} dasha requires patience in financial matters. Hard work will pay off."
        elif dasha_lord == 'Rahu':
            trend = 'mixed'
            base_summary = f"{dasha_lord} dasha can bring sudden gains or losses. Avoid speculation."
        else:
            trend = 'neutral'
            base_summary = f"{dasha_lord} dasha brings moderate financial stability. Focus on steady growth."
        
        details = []
        remedies = []
        
        # Planet-specific wealth predictions
        wealth_specifics = self._get_planet_wealth_specifics(dasha_lord)
        details.extend(wealth_specifics['details'])
        remedies.extend(wealth_specifics['remedies'])
        
        # Antardasha influence
        if antardasha_lord:
            relationship = self.get_relationship(dasha_lord, antardasha_lord)
            if relationship == 'friend':
                details.append(f"{antardasha_lord} sub-period enhances financial opportunities")
                intensity = 'strong'
            elif relationship == 'enemy':
                details.append(f"{antardasha_lord} sub-period may bring financial challenges")
                intensity = 'moderate'
                if trend == 'positive':
                    trend = 'mixed'
            else:
                intensity = 'moderate'
        else:
            intensity = 'moderate'
        
        return PredictionResult(
            area='wealth',
            trend=trend,
            intensity=intensity,
            summary=base_summary,
            details=details,
            remedies=remedies,
            keywords=['money', 'income', 'savings', 'investments']
        )
    
    def _get_planet_wealth_specifics(self, planet: str) -> Dict:
        """Get planet-specific wealth predictions."""
        specifics = {
            'Sun': {
                'details': [
                    "Income through government or authority positions",
                    "Father or paternal inheritance may come",
                    "Recognition brings financial rewards",
                    "Leadership roles increase earnings",
                    "Investments in gold favorable"
                ],
                'remedies': [
                    "Donate wheat to the needy on Sundays",
                    "Respect and serve your father",
                    "Avoid ego in financial dealings",
                    "Keep workplace clean and well-lit"
                ]
            },
            'Moon': {
                'details': [
                    "Income from public-facing businesses",
                    "Real estate and property gains possible",
                    "Mother may provide financial support",
                    "Liquid assets and savings grow",
                    "Income fluctuates with emotional state"
                ],
                'remedies': [
                    "Donate rice and white items on Monday",
                    "Serve your mother and elderly women",
                    "Avoid major financial decisions on full moon",
                    "Keep silver items at home for prosperity"
                ]
            },
            'Mars': {
                'details': [
                    "Property and real estate investments favorable",
                    "Income through technical or engineering work",
                    "Brothers/siblings may bring opportunities",
                    "Courage to take calculated risks pays off",
                    "Avoid impulsive spending"
                ],
                'remedies': [
                    "Donate red items on Tuesday",
                    "Maintain good relations with siblings",
                    "Channel aggression into productive work",
                    "Invest in land and property"
                ]
            },
            'Mercury': {
                'details': [
                    "Business and trade bring profits",
                    "Multiple income sources possible",
                    "Communication and writing skills monetized",
                    "Stock trading favorable with knowledge",
                    "Short-term investments work well"
                ],
                'remedies': [
                    "Donate green moong dal on Wednesday",
                    "Maintain accurate financial records",
                    "Learn new skills for income growth",
                    "Avoid lending money to friends"
                ]
            },
            'Jupiter': {
                'details': [
                    "Overall wealth expansion and prosperity",
                    "Gains through teaching, consulting, advisory",
                    "Children may bring fortune",
                    "Legal matters favor you financially",
                    "Religious/charitable work brings abundance"
                ],
                'remedies': [
                    "Donate yellow items on Thursday",
                    "Support educational institutions",
                    "Respect teachers and gurus",
                    "Wear yellow sapphire for wealth"
                ]
            },
            'Venus': {
                'details': [
                    "Luxury and comfort increase",
                    "Arts, entertainment, beauty business profitable",
                    "Partnership income favorable",
                    "Spouse may bring wealth",
                    "Vehicle and property acquisitions"
                ],
                'remedies': [
                    "Donate white items on Friday",
                    "Maintain harmony with spouse",
                    "Invest in arts and beauty",
                    "Keep home beautiful and clean"
                ]
            },
            'Saturn': {
                'details': [
                    "Slow but steady income growth",
                    "Hard work and persistence required",
                    "Income through service and labor",
                    "Real estate gains after delays",
                    "Inheritance may come after obstacles"
                ],
                'remedies': [
                    "Donate black items on Saturday",
                    "Serve the poor and disabled",
                    "Be patient with financial goals",
                    "Save systematically for future"
                ]
            },
            'Rahu': {
                'details': [
                    "Foreign sources of income possible",
                    "Technology and unconventional paths profitable",
                    "Sudden gains and losses possible",
                    "Avoid get-rich-quick schemes",
                    "Research-based income favorable"
                ],
                'remedies': [
                    "Donate on Saturdays at twilight",
                    "Avoid speculation and gambling",
                    "Keep finances transparent",
                    "Diversify investments"
                ]
            },
            'Ketu': {
                'details': [
                    "Detachment from material wealth",
                    "Spiritual pursuits over material gains",
                    "Unexpected losses teach valuable lessons",
                    "Past karma affects current finances",
                    "Occult or healing work may bring income"
                ],
                'remedies': [
                    "Donate blankets to the needy",
                    "Focus on spiritual wealth",
                    "Avoid attachment to money",
                    "Practice contentment and gratitude"
                ]
            },
        }
        return specifics.get(planet, {'details': [], 'remedies': []})
    
    def generate_career_prediction(self, dasha_lord: str, antardasha_lord: Optional[str] = None) -> PredictionResult:
        """Generate career and professional predictions."""
        planet_data = self.get_planet_data(dasha_lord)
        professions = planet_data.get('professions', [])
        nature = planet_data.get('nature', 'neutral')
        
        # Career trend assessment
        career_favorable = ['Sun', 'Jupiter', 'Mercury']
        if dasha_lord in career_favorable:
            trend = 'positive'
            base_summary = f"{dasha_lord} dasha favors career growth, recognition, and professional success."
        elif dasha_lord in ['Saturn']:
            trend = 'mixed'
            base_summary = f"{dasha_lord} dasha brings hard work, responsibility, and eventual career stability."
        elif dasha_lord in ['Rahu']:
            trend = 'mixed'
            base_summary = f"{dasha_lord} dasha may bring unconventional career paths or foreign opportunities."
        elif dasha_lord in ['Ketu']:
            trend = 'neutral'
            base_summary = f"{dasha_lord} dasha favors research, spiritual work, or detachment from material career."
        else:
            trend = 'neutral'
            base_summary = f"{dasha_lord} dasha brings steady career progress with specific opportunities."
        
        details = []
        remedies = []
        
        if professions:
            details.append(f"Favorable career areas: {', '.join(professions[:4])}")
        
        # Planet-specific career predictions
        career_specifics = self._get_planet_career_specifics(dasha_lord)
        details.extend(career_specifics['details'])
        remedies.extend(career_specifics['remedies'])
        
        # Antardasha influence
        intensity = 'moderate'
        if antardasha_lord:
            relationship = self.get_relationship(dasha_lord, antardasha_lord)
            ad_professions = self.get_planet_data(antardasha_lord).get('professions', [])
            
            if relationship == 'friend':
                details.append(f"{antardasha_lord} sub-period accelerates career progress")
                intensity = 'strong'
            elif relationship == 'enemy':
                details.append(f"{antardasha_lord} sub-period may bring workplace challenges")
                if trend == 'positive':
                    trend = 'mixed'
            
            if ad_professions:
                details.append(f"Additional opportunities in: {', '.join(ad_professions[:2])}")
        
        return PredictionResult(
            area='career',
            trend=trend,
            intensity=intensity,
            summary=base_summary,
            details=details,
            remedies=remedies,
            keywords=['job', 'profession', 'promotion', 'business'] + professions[:2]
        )
    
    def _get_planet_career_specifics(self, planet: str) -> Dict:
        """Get planet-specific career predictions."""
        specifics = {
            'Sun': {
                'details': [
                    "Leadership roles and authority positions favored",
                    "Government jobs and political careers beneficial",
                    "Recognition from superiors likely",
                    "May become the head or manager",
                    "Fame and reputation in profession grows"
                ],
                'remedies': [
                    "Rise early and work during day hours",
                    "Maintain integrity at workplace",
                    "Avoid conflicts with authority figures",
                    "Seek blessings from father for career"
                ]
            },
            'Moon': {
                'details': [
                    "Public-facing roles and hospitality favored",
                    "Creative and nurturing professions beneficial",
                    "May change jobs or roles frequently",
                    "Career in food, dairy, or water-related business",
                    "Work environment affects performance"
                ],
                'remedies': [
                    "Maintain work-life balance",
                    "Create a pleasant workspace",
                    "Trust intuition in career decisions",
                    "Seek mother's blessings for success"
                ]
            },
            'Mars': {
                'details': [
                    "Technical, engineering, and military careers excel",
                    "Real estate and property business favorable",
                    "Sports and competitive fields bring success",
                    "May face conflicts with colleagues",
                    "Action-oriented approach needed"
                ],
                'remedies': [
                    "Channel energy into productive work",
                    "Avoid workplace arguments",
                    "Take initiative but be patient",
                    "Exercise regularly to manage stress"
                ]
            },
            'Mercury': {
                'details': [
                    "Communication and media roles favored",
                    "Business and trading success likely",
                    "Writing, teaching, and IT careers excel",
                    "May handle multiple projects simultaneously",
                    "Networking brings opportunities"
                ],
                'remedies': [
                    "Keep learning new skills",
                    "Maintain professional communication",
                    "Use analytical abilities wisely",
                    "Build strong professional network"
                ]
            },
            'Jupiter': {
                'details': [
                    "Teaching, advisory, and consulting roles favored",
                    "Expansion in business and profession",
                    "Legal and financial sectors bring success",
                    "Mentoring others brings growth",
                    "International opportunities possible"
                ],
                'remedies': [
                    "Be ethical in all professional dealings",
                    "Share knowledge generously",
                    "Respect seniors and mentors",
                    "Engage in continuous learning"
                ]
            },
            'Venus': {
                'details': [
                    "Arts, entertainment, and beauty industries favored",
                    "Luxury goods and hospitality sectors excel",
                    "Partnerships and collaborations successful",
                    "Work environment becomes pleasant",
                    "Creative projects bring recognition"
                ],
                'remedies': [
                    "Maintain workplace harmony",
                    "Dress professionally and elegantly",
                    "Build positive relationships with colleagues",
                    "Add creativity to your work"
                ]
            },
            'Saturn': {
                'details': [
                    "Slow but steady career advancement",
                    "Hard work and discipline required",
                    "May face delays and obstacles initially",
                    "Service-oriented roles bring satisfaction",
                    "Long-term career building favored"
                ],
                'remedies': [
                    "Be patient and persistent",
                    "Complete pending tasks diligently",
                    "Avoid shortcuts and quick fixes",
                    "Respect subordinates and workers"
                ]
            },
            'Rahu': {
                'details': [
                    "Unconventional and innovative careers favored",
                    "Technology and foreign companies bring success",
                    "May experience sudden career changes",
                    "Politics and media can bring fame",
                    "Research and investigation fields excel"
                ],
                'remedies': [
                    "Stay grounded despite success",
                    "Avoid office politics and manipulation",
                    "Be honest in professional dealings",
                    "Focus on long-term goals"
                ]
            },
            'Ketu': {
                'details': [
                    "Spiritual and healing professions favored",
                    "Research and investigation work beneficial",
                    "May lose interest in current career",
                    "Detachment from material success",
                    "Past skills and talents resurface"
                ],
                'remedies': [
                    "Find meaning in your work",
                    "Consider career aligned with values",
                    "Don't force career ambitions",
                    "Focus on contribution over recognition"
                ]
            },
        }
        return specifics.get(planet, {'details': [], 'remedies': []})
    
    def generate_relationship_prediction(self, dasha_lord: str, antardasha_lord: Optional[str] = None) -> PredictionResult:
        """Generate relationship and marriage predictions."""
        planet_data = self.get_planet_data(dasha_lord)
        relationships = planet_data.get('relationships', [])
        nature = planet_data.get('nature', 'neutral')
        
        # Relationship assessment
        relationship_planets = ['Venus', 'Moon', 'Jupiter']
        if dasha_lord in relationship_planets:
            trend = 'positive'
            base_summary = f"{dasha_lord} dasha brings harmony, love, and positive relationships."
        elif dasha_lord in ['Saturn', 'Rahu']:
            trend = 'mixed'
            base_summary = f"{dasha_lord} dasha may bring relationship challenges that teach important lessons."
        elif dasha_lord == 'Ketu':
            trend = 'neutral'
            base_summary = f"{dasha_lord} dasha favors spiritual connections over material relationships."
        else:
            trend = 'neutral'
            base_summary = f"{dasha_lord} dasha brings stable relationships with specific dynamics."
        
        details = []
        remedies = []
        
        if relationships:
            details.append(f"Key relationships: {', '.join(relationships)}")
        
        # Planet-specific relationship predictions
        rel_specifics = self._get_planet_relationship_specifics(dasha_lord)
        details.extend(rel_specifics['details'])
        remedies.extend(rel_specifics['remedies'])
        
        # Antardasha influence
        intensity = 'moderate'
        if antardasha_lord:
            relationship = self.get_relationship(dasha_lord, antardasha_lord)
            if relationship == 'friend':
                details.append(f"{antardasha_lord} sub-period enhances relationship harmony")
                intensity = 'strong'
            elif relationship == 'enemy':
                details.append(f"{antardasha_lord} sub-period may bring relationship conflicts")
                if trend == 'positive':
                    trend = 'mixed'
        
        return PredictionResult(
            area='relationships',
            trend=trend,
            intensity=intensity,
            summary=base_summary,
            details=details,
            remedies=remedies,
            keywords=['marriage', 'spouse', 'love', 'family'] + relationships[:2]
        )
    
    def _get_planet_relationship_specifics(self, planet: str) -> Dict:
        """Get planet-specific relationship predictions."""
        specifics = {
            'Sun': {
                'details': [
                    "Relationship with father becomes significant",
                    "Ego issues may affect partnerships",
                    "Authority dynamics in relationships",
                    "Recognition from partner likely",
                    "Leadership role in family matters"
                ],
                'remedies': [
                    "Practice humility in relationships",
                    "Give respect to receive respect",
                    "Avoid dominating behavior",
                    "Spend quality time with father"
                ]
            },
            'Moon': {
                'details': [
                    "Emotional bonding deepens with loved ones",
                    "Mother's role becomes important",
                    "Nurturing relationships flourish",
                    "Mood swings may affect relationships",
                    "Home and family life emphasized"
                ],
                'remedies': [
                    "Express emotions constructively",
                    "Create emotional security for loved ones",
                    "Spend time with mother",
                    "Create peaceful home environment"
                ]
            },
            'Mars': {
                'details': [
                    "Passion and energy in relationships",
                    "Possible conflicts and arguments",
                    "Siblings relationship significant",
                    "Physical attraction important",
                    "Courage to address relationship issues"
                ],
                'remedies': [
                    "Control anger in relationships",
                    "Channel passion positively",
                    "Maintain good relations with siblings",
                    "Practice patience with partner"
                ]
            },
            'Mercury': {
                'details': [
                    "Communication improves relationships",
                    "Friendships become important",
                    "Intellectual compatibility valued",
                    "Multiple social connections",
                    "Youthful and playful interactions"
                ],
                'remedies': [
                    "Communicate clearly with loved ones",
                    "Listen actively to partner",
                    "Maintain friendships",
                    "Avoid over-analyzing relationships"
                ]
            },
            'Jupiter': {
                'details': [
                    "Marriage and committed relationships favored",
                    "Children bring joy and blessings",
                    "Wisdom in relationship matters",
                    "Meeting spouse through education/religion",
                    "Guru or mentor relationships form"
                ],
                'remedies': [
                    "Be generous in relationships",
                    "Respect spouse and elders",
                    "Guide and support children",
                    "Maintain ethical relationships"
                ]
            },
            'Venus': {
                'details': [
                    "Romance and love flourish",
                    "Marriage prospects excellent",
                    "Physical and emotional harmony",
                    "Artistic connections form",
                    "Luxury and comfort with partner"
                ],
                'remedies': [
                    "Express love and appreciation",
                    "Create beauty in relationships",
                    "Avoid materialism in love",
                    "Maintain fidelity and trust"
                ]
            },
            'Saturn': {
                'details': [
                    "Relationships tested by time",
                    "Delayed marriage or serious commitment",
                    "Loyalty and duty emphasized",
                    "May feel restricted or burdened",
                    "Long-lasting bonds if patient"
                ],
                'remedies': [
                    "Be patient with relationship growth",
                    "Accept responsibilities willingly",
                    "Avoid criticism of partner",
                    "Serve and support elderly relatives"
                ]
            },
            'Rahu': {
                'details': [
                    "Unconventional relationships possible",
                    "Foreign or different background partner",
                    "Obsessive attractions possible",
                    "In-law relationships complex",
                    "Social image in relationships important"
                ],
                'remedies': [
                    "Avoid deception in relationships",
                    "Stay grounded despite attractions",
                    "Be clear about relationship goals",
                    "Maintain healthy boundaries"
                ]
            },
            'Ketu': {
                'details': [
                    "Spiritual connections emphasized",
                    "Detachment from worldly relationships",
                    "Past life connections resurface",
                    "May feel isolated or misunderstood",
                    "Focus on inner growth over external"
                ],
                'remedies': [
                    "Find spiritual partner/friends",
                    "Accept relationship karma gracefully",
                    "Focus on unconditional love",
                    "Practice forgiveness and letting go"
                ]
            },
        }
        return specifics.get(planet, {'details': [], 'remedies': []})
    
    def generate_general_prediction(self, dasha_lord: str, antardasha_lord: Optional[str] = None) -> PredictionResult:
        """Generate general life predictions including spiritual, travel, education, etc."""
        planet_data = self.get_planet_data(dasha_lord)
        keywords = planet_data.get('keywords', [])
        nature = planet_data.get('nature', 'neutral')
        
        details = []
        remedies = []
        
        # Overall theme
        if nature == 'benefic':
            trend = 'positive'
            base_summary = f"{dasha_lord} period brings growth, opportunities, and positive life experiences."
        elif nature == 'malefic':
            trend = 'mixed'
            base_summary = f"{dasha_lord} period brings challenges that ultimately lead to growth and transformation."
        else:
            trend = 'neutral'
            base_summary = f"{dasha_lord} period brings unique experiences and life lessons."
        
        # General predictions by planet
        general_specifics = self._get_planet_general_specifics(dasha_lord)
        details.extend(general_specifics['details'])
        remedies.extend(general_specifics['remedies'])
        
        # Antardasha influence
        intensity = 'moderate'
        if antardasha_lord:
            relationship = self.get_relationship(dasha_lord, antardasha_lord)
            if relationship == 'friend':
                intensity = 'strong'
                details.append(f"{antardasha_lord} sub-period amplifies positive effects")
            elif relationship == 'enemy':
                details.append(f"{antardasha_lord} sub-period requires careful navigation")
        
        return PredictionResult(
            area='general',
            trend=trend,
            intensity=intensity,
            summary=base_summary,
            details=details,
            remedies=remedies,
            keywords=keywords[:5]
        )
    
    def _get_planet_general_specifics(self, planet: str) -> Dict:
        """Get planet-specific general life predictions."""
        specifics = {
            'Sun': {
                'details': [
                    "Increased confidence and self-expression",
                    "Recognition and fame possible",
                    "Spiritual growth through self-discovery",
                    "Government matters favor you",
                    "East direction is auspicious",
                    "Success in competitive endeavors",
                    "Leadership abilities emerge naturally"
                ],
                'remedies': [
                    "Wake up before sunrise",
                    "Practice gratitude daily",
                    "Engage in acts of generosity",
                    "Maintain a positive self-image"
                ]
            },
            'Moon': {
                'details': [
                    "Emotional intelligence develops",
                    "Travel, especially near water, likely",
                    "Public image and reputation improve",
                    "Dreams and intuition heightened",
                    "Northwest direction favorable",
                    "Feminine energy increases",
                    "Connection with nature beneficial"
                ],
                'remedies': [
                    "Practice mindfulness and meditation",
                    "Spend time near water bodies",
                    "Honor and respect women",
                    "Follow a regular sleep schedule"
                ]
            },
            'Mars': {
                'details': [
                    "Energy and courage increase significantly",
                    "Property matters need attention",
                    "Competitions and sports favored",
                    "Technical skills improve",
                    "South direction is auspicious",
                    "May face legal or property disputes",
                    "Physical strength at its peak"
                ],
                'remedies': [
                    "Exercise regularly to channel energy",
                    "Practice patience in conflicts",
                    "Avoid unnecessary arguments",
                    "Support brothers and male relatives"
                ]
            },
            'Mercury': {
                'details': [
                    "Learning and education emphasized",
                    "Writing and communication skills improve",
                    "Short travels likely and beneficial",
                    "Business acumen sharpens",
                    "North direction favorable",
                    "Analytical abilities at peak",
                    "Social circle expands"
                ],
                'remedies': [
                    "Read and learn continuously",
                    "Practice clear communication",
                    "Keep a journal or diary",
                    "Help students and young people"
                ]
            },
            'Jupiter': {
                'details': [
                    "Spiritual growth and wisdom increase",
                    "Higher education and learning favored",
                    "Long-distance travel, especially pilgrimage",
                    "Legal matters conclude favorably",
                    "Northeast direction auspicious",
                    "Children bring blessings",
                    "Fortune and luck improve"
                ],
                'remedies': [
                    "Study scriptures and philosophy",
                    "Teach and share knowledge",
                    "Visit temples and sacred places",
                    "Practice generosity and charity"
                ]
            },
            'Venus': {
                'details': [
                    "Artistic expression and creativity flourish",
                    "Comfort and luxury increase",
                    "Travel for pleasure likely",
                    "Beauty and aesthetics appreciated",
                    "Southeast direction favorable",
                    "Social life becomes vibrant",
                    "Material comforts abundant"
                ],
                'remedies': [
                    "Engage in artistic activities",
                    "Appreciate beauty in daily life",
                    "Maintain cleanliness and hygiene",
                    "Show gratitude for comforts received"
                ]
            },
            'Saturn': {
                'details': [
                    "Life lessons through challenges",
                    "Discipline and structure required",
                    "Karma from past surfaces for resolution",
                    "Service to others brings growth",
                    "West direction significant",
                    "Elderly and poor need your support",
                    "Patience is the key virtue"
                ],
                'remedies': [
                    "Accept challenges as growth opportunities",
                    "Practice discipline in daily life",
                    "Serve the elderly and disabled",
                    "Avoid laziness and procrastination"
                ]
            },
            'Rahu': {
                'details': [
                    "Unconventional experiences likely",
                    "Foreign travel or connections",
                    "Technology and innovation important",
                    "Illusions and clarity alternate",
                    "Southwest direction significant",
                    "Sudden events - both positive and negative",
                    "Research and investigation favored"
                ],
                'remedies': [
                    "Stay grounded during changes",
                    "Avoid intoxicants and addictions",
                    "Practice truthfulness always",
                    "Regular spiritual practices essential"
                ]
            },
            'Ketu': {
                'details': [
                    "Spiritual awakening and liberation",
                    "Past life karma resolves",
                    "Detachment from material world",
                    "Psychic and intuitive abilities increase",
                    "Southwest direction connected",
                    "Healing abilities may develop",
                    "Liberation from old patterns"
                ],
                'remedies': [
                    "Practice meditation regularly",
                    "Let go of attachments",
                    "Serve at spiritual institutions",
                    "Focus on inner transformation"
                ]
            },
        }
        return specifics.get(planet, {'details': [], 'remedies': []})
    
    def generate_complete_prediction(self, dasha_lord: str, 
                                     antardasha_lord: Optional[str] = None,
                                     pratyantardasha_lord: Optional[str] = None) -> DashaPrediction:
        """Generate complete predictions for a Dasha period."""
        planet_data = self.get_planet_data(dasha_lord)
        
        # Determine period type
        if pratyantardasha_lord:
            period_type = 'pratyantardasha'
        elif antardasha_lord:
            period_type = 'antardasha'
        else:
            period_type = 'mahadasha'
        
        # Generate all predictions
        health = self.generate_health_prediction(dasha_lord, antardasha_lord)
        wealth = self.generate_wealth_prediction(dasha_lord, antardasha_lord)
        career = self.generate_career_prediction(dasha_lord, antardasha_lord)
        relationships = self.generate_relationship_prediction(dasha_lord, antardasha_lord)
        general = self.generate_general_prediction(dasha_lord, antardasha_lord)
        
        # Calculate overall rating
        trend_scores = {'positive': 8, 'neutral': 6, 'mixed': 5, 'negative': 3}
        avg_score = sum([
            trend_scores.get(health.trend, 5),
            trend_scores.get(wealth.trend, 5),
            trend_scores.get(career.trend, 5),
            trend_scores.get(relationships.trend, 5),
            trend_scores.get(general.trend, 5)
        ]) / 5
        overall_rating = min(10, max(1, int(avg_score + 1)))
        
        # Combine intensities to determine overall theme
        nature = planet_data.get('nature', 'neutral')
        if nature == 'benefic':
            overall_theme = f"A period of growth and positive developments under {dasha_lord}'s influence"
        elif nature == 'malefic':
            overall_theme = f"A transformative period requiring patience and effort under {dasha_lord}'s influence"
        else:
            overall_theme = f"A period of unique experiences and life lessons under {dasha_lord}'s influence"
        
        if antardasha_lord:
            relationship = self.get_relationship(dasha_lord, antardasha_lord)
            if relationship == 'friend':
                overall_theme += f", enhanced by the supportive {antardasha_lord} sub-period"
            elif relationship == 'enemy':
                overall_theme += f", with challenges during the {antardasha_lord} sub-period"
        
        # Favorable and unfavorable activities
        favorable = self._get_favorable_activities(dasha_lord)
        unfavorable = self._get_unfavorable_activities(dasha_lord)
        
        return DashaPrediction(
            dasha_lord=dasha_lord,
            period_type=period_type,
            overall_theme=overall_theme,
            overall_rating=overall_rating,
            predictions={
                'health': health,
                'wealth': wealth,
                'career': career,
                'relationships': relationships,
                'general': general
            },
            favorable_activities=favorable,
            unfavorable_activities=unfavorable,
            important_transits=[],
            gemstone=planet_data.get('gemstone'),
            mantra=planet_data.get('mantra'),
            deity=planet_data.get('deity')
        )
    
    def _get_favorable_activities(self, planet: str) -> List[str]:
        """Get favorable activities for a planet period."""
        activities = {
            'Sun': [
                "Starting leadership roles",
                "Government applications",
                "Medical treatments",
                "Purchasing gold",
                "Father-related ceremonies",
                "Public appearances"
            ],
            'Moon': [
                "Starting new ventures (on bright fortnight)",
                "Real estate transactions",
                "Travel planning",
                "Nurturing activities",
                "Creative pursuits",
                "Water-related activities"
            ],
            'Mars': [
                "Property dealings",
                "Sports and physical activities",
                "Surgery (if needed)",
                "Mechanical work",
                "Sibling-related matters",
                "Competitive exams"
            ],
            'Mercury': [
                "Business ventures",
                "Educational pursuits",
                "Writing and publishing",
                "Communication projects",
                "Short travels",
                "Financial planning"
            ],
            'Jupiter': [
                "Marriage ceremonies",
                "Religious activities",
                "Higher education",
                "Legal matters",
                "Teaching and mentoring",
                "Charity and donations"
            ],
            'Venus': [
                "Marriage and relationships",
                "Artistic pursuits",
                "Luxury purchases",
                "Beauty treatments",
                "Entertainment",
                "Partnership agreements"
            ],
            'Saturn': [
                "Long-term planning",
                "Real estate (with patience)",
                "Service activities",
                "Discipline-based work",
                "Iron/steel industry",
                "Oil and mining"
            ],
            'Rahu': [
                "Technology ventures",
                "Foreign dealings",
                "Research work",
                "Unconventional paths",
                "Political activities",
                "Innovation projects"
            ],
            'Ketu': [
                "Spiritual practices",
                "Research and investigation",
                "Healing activities",
                "Letting go of the old",
                "Occult studies",
                "Meditation retreats"
            ],
        }
        return activities.get(planet, [])
    
    def _get_unfavorable_activities(self, planet: str) -> List[str]:
        """Get unfavorable activities for a planet period."""
        activities = {
            'Sun': [
                "Ego-driven decisions",
                "Conflicts with authority",
                "Overexposure to sun",
                "Ignoring health",
                "Arrogant behavior",
                "Disrespecting father"
            ],
            'Moon': [
                "Major decisions on new moon",
                "Emotional decisions",
                "Ignoring mental health",
                "Dehydration",
                "Disrespecting mother",
                "Irregular sleep"
            ],
            'Mars': [
                "Impulsive decisions",
                "Risky ventures without planning",
                "Arguments and conflicts",
                "Dangerous sports (without care)",
                "Ignoring injuries",
                "Sibling disputes"
            ],
            'Mercury': [
                "Signing without reading",
                "Miscommunication",
                "Overthinking",
                "Neglecting education",
                "Dishonest dealings",
                "Excessive screen time"
            ],
            'Jupiter': [
                "Unethical practices",
                "Disrespecting teachers",
                "Excessive indulgence",
                "Ignoring spiritual growth",
                "Arrogance in knowledge",
                "Financial extravagance"
            ],
            'Venus': [
                "Overindulgence in pleasures",
                "Extramarital affairs",
                "Excessive luxury spending",
                "Neglecting spouse",
                "Superficial relationships",
                "Vanity-driven choices"
            ],
            'Saturn': [
                "Avoiding responsibilities",
                "Disrespecting workers/poor",
                "Impatience",
                "Shortcuts and quick fixes",
                "Ignoring chronic health issues",
                "Laziness and procrastination"
            ],
            'Rahu': [
                "Get-rich-quick schemes",
                "Substance abuse",
                "Deception and manipulation",
                "Ignoring ethics",
                "Obsessive behaviors",
                "Excessive ambition"
            ],
            'Ketu': [
                "Excessive material attachment",
                "Ignoring spiritual calling",
                "Resistance to change",
                "Holding onto the past",
                "Isolation from community",
                "Ignoring intuition"
            ],
        }
        return activities.get(planet, [])

