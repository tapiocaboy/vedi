"""
Rashi (Zodiac Sign) calculations for Vedic Astrology.
Each rashi spans exactly 30 degrees of the sidereal zodiac.
"""

# Rashis in Sanskrit with English equivalents
RASHIS = [
    'Mesha',      # Aries
    'Vrishabha',  # Taurus
    'Mithuna',    # Gemini
    'Karka',      # Cancer
    'Simha',      # Leo
    'Kanya',      # Virgo
    'Tula',       # Libra
    'Vrischika', # Scorpio
    'Dhanu',      # Sagittarius
    'Makara',     # Capricorn
    'Kumbha',     # Aquarius
    'Meena'       # Pisces
]

# English names for reference
RASHI_ENGLISH = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

# Rashi lords
RASHI_LORDS = {
    'Mesha': 'Mars',
    'Vrishabha': 'Venus',
    'Mithuna': 'Mercury',
    'Karka': 'Moon',
    'Simha': 'Sun',
    'Kanya': 'Mercury',
    'Tula': 'Venus',
    'Vrischika': 'Mars',
    'Dhanu': 'Jupiter',
    'Makara': 'Saturn',
    'Kumbha': 'Saturn',
    'Meena': 'Jupiter'
}

# Rashi elements
RASHI_ELEMENTS = {
    'Mesha': 'Fire',
    'Vrishabha': 'Earth',
    'Mithuna': 'Air',
    'Karka': 'Water',
    'Simha': 'Fire',
    'Kanya': 'Earth',
    'Tula': 'Air',
    'Vrischika': 'Water',
    'Dhanu': 'Fire',
    'Makara': 'Earth',
    'Kumbha': 'Air',
    'Meena': 'Water'
}

# Rashi modalities
RASHI_MODALITIES = {
    'Mesha': 'Movable',      # Chara
    'Vrishabha': 'Fixed',    # Sthira
    'Mithuna': 'Dual',       # Dwiswabhava
    'Karka': 'Movable',
    'Simha': 'Fixed',
    'Kanya': 'Dual',
    'Tula': 'Movable',
    'Vrischika': 'Fixed',
    'Dhanu': 'Dual',
    'Makara': 'Movable',
    'Kumbha': 'Fixed',
    'Meena': 'Dual'
}


def get_rashi(sidereal_longitude: float) -> tuple[int, str, float]:
    """
    Get rashi (zodiac sign) from sidereal longitude.
    
    Args:
        sidereal_longitude: Longitude in sidereal zodiac (0-360)
        
    Returns:
        tuple: (rashi_index, rashi_name, degree_in_rashi)
        - rashi_index: 0-11 (Mesha to Meena)
        - rashi_name: Sanskrit name of the rashi
        - degree_in_rashi: Degree within the rashi (0-30)
    """
    # Normalize longitude to 0-360 range
    longitude = sidereal_longitude % 360
    
    # Each rashi spans exactly 30 degrees
    rashi_index = int(longitude / 30)
    degree_in_rashi = longitude % 30
    
    return rashi_index, RASHIS[rashi_index], degree_in_rashi


def get_rashi_info(rashi_index: int) -> dict:
    """
    Get detailed information about a rashi.
    
    Args:
        rashi_index: Index of the rashi (0-11)
        
    Returns:
        Dictionary with rashi details
    """
    name = RASHIS[rashi_index]
    return {
        'index': rashi_index,
        'name': name,
        'english': RASHI_ENGLISH[rashi_index],
        'lord': RASHI_LORDS[name],
        'element': RASHI_ELEMENTS[name],
        'modality': RASHI_MODALITIES[name]
    }


def get_opposite_rashi(rashi_index: int) -> int:
    """Get the opposite rashi (180° away)."""
    return (rashi_index + 6) % 12


def get_trine_rashis(rashi_index: int) -> list[int]:
    """Get trine rashis (120° apart) - same element."""
    return [
        rashi_index,
        (rashi_index + 4) % 12,
        (rashi_index + 8) % 12
    ]


def get_square_rashis(rashi_index: int) -> list[int]:
    """Get square rashis (90° apart)."""
    return [
        (rashi_index + 3) % 12,
        (rashi_index + 9) % 12
    ]

