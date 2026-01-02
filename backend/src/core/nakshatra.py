"""
Nakshatra (Lunar Mansion) calculations for Vedic Astrology.
27 Nakshatras divide the zodiac, each spanning 13°20'.
"""

# Nakshatras with their lords (Vimshottari Dasha lords)
NAKSHATRAS = [
    ('Ashwini', 'Ketu'),
    ('Bharani', 'Venus'),
    ('Krittika', 'Sun'),
    ('Rohini', 'Moon'),
    ('Mrigashira', 'Mars'),
    ('Ardra', 'Rahu'),
    ('Punarvasu', 'Jupiter'),
    ('Pushya', 'Saturn'),
    ('Ashlesha', 'Mercury'),
    ('Magha', 'Ketu'),
    ('Purva Phalguni', 'Venus'),
    ('Uttara Phalguni', 'Sun'),
    ('Hasta', 'Moon'),
    ('Chitra', 'Mars'),
    ('Swati', 'Rahu'),
    ('Vishakha', 'Jupiter'),
    ('Anuradha', 'Saturn'),
    ('Jyeshtha', 'Mercury'),
    ('Mula', 'Ketu'),
    ('Purva Ashadha', 'Venus'),
    ('Uttara Ashadha', 'Sun'),
    ('Shravana', 'Moon'),
    ('Dhanishta', 'Mars'),
    ('Shatabhisha', 'Rahu'),
    ('Purva Bhadrapada', 'Jupiter'),
    ('Uttara Bhadrapada', 'Saturn'),
    ('Revati', 'Mercury')
]

# Nakshatra span in degrees: 360° / 27 = 13°20' = 13.333...°
NAKSHATRA_SPAN = 360.0 / 27.0  # 13.333333...

# Pada span in degrees: 13°20' / 4 = 3°20'
PADA_SPAN = NAKSHATRA_SPAN / 4.0  # 3.333333...

# Nakshatra deities
NAKSHATRA_DEITIES = [
    'Ashwini Kumaras',  # Ashwini
    'Yama',             # Bharani
    'Agni',             # Krittika
    'Brahma',           # Rohini
    'Soma',             # Mrigashira
    'Rudra',            # Ardra
    'Aditi',            # Punarvasu
    'Brihaspati',       # Pushya
    'Nagas',            # Ashlesha
    'Pitris',           # Magha
    'Bhaga',            # Purva Phalguni
    'Aryaman',          # Uttara Phalguni
    'Savitar',          # Hasta
    'Vishwakarma',      # Chitra
    'Vayu',             # Swati
    'Indra-Agni',       # Vishakha
    'Mitra',            # Anuradha
    'Indra',            # Jyeshtha
    'Nirriti',          # Mula
    'Apas',             # Purva Ashadha
    'Vishvadevas',      # Uttara Ashadha
    'Vishnu',           # Shravana
    'Vasus',            # Dhanishta
    'Varuna',           # Shatabhisha
    'Aja Ekapada',      # Purva Bhadrapada
    'Ahir Budhnya',     # Uttara Bhadrapada
    'Pushan'            # Revati
]

# Nakshatra symbols
NAKSHATRA_SYMBOLS = [
    "Horse's head",           # Ashwini
    "Yoni/Elephant",          # Bharani
    "Razor/Flame",            # Krittika
    "Cart/Chariot",           # Rohini
    "Deer's head",            # Mrigashira
    "Teardrop/Diamond",       # Ardra
    "Bow/Quiver",             # Punarvasu
    "Flower/Circle",          # Pushya
    "Serpent/Wheel",          # Ashlesha
    "Royal throne",           # Magha
    "Front legs of bed",      # Purva Phalguni
    "Back legs of bed",       # Uttara Phalguni
    "Hand/Fist",              # Hasta
    "Bright jewel/Pearl",     # Chitra
    "Coral/Sword",            # Swati
    "Triumphal arch",         # Vishakha
    "Lotus",                  # Anuradha
    "Circular amulet",        # Jyeshtha
    "Roots/Lion's tail",      # Mula
    "Elephant tusk/Fan",      # Purva Ashadha
    "Elephant tusk/Planks",   # Uttara Ashadha
    "Ear/Three footprints",   # Shravana
    "Drum/Flute",             # Dhanishta
    "Empty circle",           # Shatabhisha
    "Front of funeral cot",   # Purva Bhadrapada
    "Back of funeral cot",    # Uttara Bhadrapada
    "Fish/Drum"               # Revati
]

# Nakshatra Ganas (temperaments)
NAKSHATRA_GANAS = [
    'Deva',    # Ashwini
    'Manushya',# Bharani
    'Rakshasa',# Krittika
    'Deva',    # Rohini
    'Deva',    # Mrigashira
    'Manushya',# Ardra
    'Deva',    # Punarvasu
    'Deva',    # Pushya
    'Rakshasa',# Ashlesha
    'Rakshasa',# Magha
    'Manushya',# Purva Phalguni
    'Manushya',# Uttara Phalguni
    'Deva',    # Hasta
    'Rakshasa',# Chitra
    'Deva',    # Swati
    'Rakshasa',# Vishakha
    'Deva',    # Anuradha
    'Rakshasa',# Jyeshtha
    'Rakshasa',# Mula
    'Manushya',# Purva Ashadha
    'Manushya',# Uttara Ashadha
    'Deva',    # Shravana
    'Rakshasa',# Dhanishta
    'Rakshasa',# Shatabhisha
    'Manushya',# Purva Bhadrapada
    'Manushya',# Uttara Bhadrapada
    'Deva'     # Revati
]


def get_nakshatra(sidereal_longitude: float) -> dict:
    """
    Calculate nakshatra and pada from sidereal longitude.
    
    Args:
        sidereal_longitude: Longitude in sidereal zodiac (0-360)
        
    Returns:
        Dictionary with nakshatra details:
        - index: 0-26 (Ashwini to Revati)
        - name: Name of the nakshatra
        - lord: Vimshottari Dasha lord
        - pada: 1-4
        - degree: Degree within nakshatra
        - deity: Presiding deity
        - symbol: Nakshatra symbol
        - gana: Temperament (Deva/Manushya/Rakshasa)
    """
    # Normalize longitude to 0-360 range
    longitude = sidereal_longitude % 360
    
    # Calculate nakshatra index (0-26)
    nak_index = int(longitude / NAKSHATRA_SPAN)
    
    # Ensure index is within bounds
    nak_index = min(nak_index, 26)
    
    # Degree within nakshatra
    nak_degree = longitude % NAKSHATRA_SPAN
    
    # Calculate pada (1-4)
    pada = int(nak_degree / PADA_SPAN) + 1
    pada = min(pada, 4)  # Ensure pada doesn't exceed 4
    
    return {
        'index': nak_index,
        'name': NAKSHATRAS[nak_index][0],
        'lord': NAKSHATRAS[nak_index][1],
        'pada': pada,
        'degree': nak_degree,
        'deity': NAKSHATRA_DEITIES[nak_index],
        'symbol': NAKSHATRA_SYMBOLS[nak_index],
        'gana': NAKSHATRA_GANAS[nak_index]
    }


def get_nakshatra_info(nak_index: int) -> dict:
    """
    Get detailed information about a nakshatra.
    
    Args:
        nak_index: Index of the nakshatra (0-26)
        
    Returns:
        Dictionary with nakshatra details
    """
    return {
        'index': nak_index,
        'name': NAKSHATRAS[nak_index][0],
        'lord': NAKSHATRAS[nak_index][1],
        'deity': NAKSHATRA_DEITIES[nak_index],
        'symbol': NAKSHATRA_SYMBOLS[nak_index],
        'gana': NAKSHATRA_GANAS[nak_index]
    }


def get_nakshatra_by_moon(moon_longitude: float) -> dict:
    """
    Get birth nakshatra (Janma Nakshatra) from Moon's position.
    This is the primary nakshatra used for Dasha calculations.
    
    Args:
        moon_longitude: Moon's sidereal longitude
        
    Returns:
        Dictionary with nakshatra details
    """
    return get_nakshatra(moon_longitude)


def get_abhijit_nakshatra_position(sidereal_longitude: float) -> dict | None:
    """
    Check if position falls in Abhijit nakshatra (28th nakshatra).
    Abhijit spans from 6°40' to 10°53'20" in Makara (Capricorn).
    
    This is an optional nakshatra used in some systems.
    
    Args:
        sidereal_longitude: Sidereal longitude
        
    Returns:
        Dictionary with Abhijit info if in range, None otherwise
    """
    # Abhijit range: 276°40' to 280°53'20" (Makara 6°40' to 10°53'20")
    abhijit_start = 276.0 + (40.0 / 60.0)  # 276°40'
    abhijit_end = 280.0 + (53.0 / 60.0) + (20.0 / 3600.0)  # 280°53'20"
    
    longitude = sidereal_longitude % 360
    
    if abhijit_start <= longitude < abhijit_end:
        degree_in_abhijit = longitude - abhijit_start
        return {
            'name': 'Abhijit',
            'lord': 'Brahma',
            'degree': degree_in_abhijit,
            'is_abhijit': True
        }
    
    return None

