"""
Tests for Vimshottari Dasha calculations.
"""

import pytest
from datetime import datetime

from src.core.dasha import (
    VimshottariDasha,
    DASHA_YEARS,
    DASHA_SEQUENCE,
    TOTAL_DASHA_YEARS,
)


def test_dasha_sequence():
    """Verify Vimshottari sequence is correct."""
    expected = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 
                'Rahu', 'Jupiter', 'Saturn', 'Mercury']
    assert DASHA_SEQUENCE == expected


def test_dasha_total_years():
    """Total must equal 120 years."""
    total = sum(DASHA_YEARS.values())
    assert total == 120
    assert TOTAL_DASHA_YEARS == 120


def test_dasha_years_values():
    """Verify individual dasha periods."""
    expected = {
        'Ketu': 7,
        'Venus': 20,
        'Sun': 6,
        'Moon': 10,
        'Mars': 7,
        'Rahu': 18,
        'Jupiter': 16,
        'Saturn': 19,
        'Mercury': 17
    }
    assert DASHA_YEARS == expected


def test_birth_dasha_lord_rohini():
    """Test birth dasha lord for Moon in Rohini nakshatra."""
    # Rohini spans from 40° to 53°20' (Moon ruled)
    moon_longitude = 45.0  # Middle of Rohini
    birth = datetime(1990, 5, 15, 10, 30)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    assert dasha.get_birth_dasha_lord() == 'Moon'


def test_birth_dasha_lord_ashwini():
    """Test birth dasha lord for Moon in Ashwini nakshatra."""
    # Ashwini spans from 0° to 13°20' (Ketu ruled)
    moon_longitude = 5.0  # Middle of Ashwini
    birth = datetime(1990, 5, 15, 10, 30)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    assert dasha.get_birth_dasha_lord() == 'Ketu'


def test_elapsed_dasha_portion():
    """Test calculation of elapsed dasha portion."""
    # Moon at start of nakshatra (0% elapsed)
    moon_longitude = 0.0  # Start of Ashwini
    birth = datetime(1990, 1, 1)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    assert dasha.get_elapsed_dasha_portion() == pytest.approx(0.0, abs=0.01)
    
    # Moon at middle of nakshatra (50% elapsed)
    moon_longitude = 6.67  # Middle of Ashwini (13.33 / 2)
    dasha = VimshottariDasha(moon_longitude, birth)
    assert dasha.get_elapsed_dasha_portion() == pytest.approx(0.5, abs=0.01)


def test_dasha_balance_calculation():
    """Test dasha balance at birth."""
    # Moon at exact start of Ashwini (full Ketu dasha remaining)
    moon_longitude = 0.0
    birth = datetime(1990, 1, 1)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    balance = dasha.calculate_dasha_balance()
    
    assert balance['lord'] == 'Ketu'
    assert balance['total_years'] == 7
    assert balance['remaining_years'] == pytest.approx(7.0, abs=0.01)


def test_mahadasha_timeline_generation():
    """Test generation of Mahadasha timeline."""
    moon_longitude = 0.0  # Start of Ashwini
    birth = datetime(1990, 1, 1)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    timeline = dasha.generate_mahadasha_timeline(years_ahead=50)
    
    # Should have multiple dashas
    assert len(timeline) > 0
    
    # First dasha should be Ketu (birth dasha)
    assert timeline[0].lord == 'Ketu'
    assert timeline[0].is_birth_dasha == True
    
    # Check sequence continues correctly
    if len(timeline) > 1:
        assert timeline[1].lord == 'Venus'


def test_antardasha_sum_equals_mahadasha():
    """Antardashas must sum to Mahadasha duration."""
    moon_longitude = 0.0
    birth = datetime(1990, 1, 1)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    timeline = dasha.generate_mahadasha_timeline()
    
    # Get a full mahadasha (not the birth one which might be partial)
    for md in timeline:
        if not md.is_birth_dasha:
            antardashas = dasha.calculate_antardasha(md)
            total_ad_days = sum(ad.days for ad in antardashas)
            expected_days = md.years * 365.25
            
            assert abs(total_ad_days - expected_days) < 1  # Within 1 day
            break


def test_antardasha_sequence():
    """Test that Antardasha sequence starts from Mahadasha lord."""
    moon_longitude = 0.0
    birth = datetime(1990, 1, 1)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    timeline = dasha.generate_mahadasha_timeline()
    
    # Find Venus mahadasha
    for md in timeline:
        if md.lord == 'Venus' and not md.is_birth_dasha:
            antardashas = dasha.calculate_antardasha(md)
            
            # First antardasha should be Venus
            assert antardashas[0].lord == 'Venus'
            
            # Should have 9 antardashas
            assert len(antardashas) == 9
            break


def test_pratyantardasha_calculation():
    """Test Pratyantardasha calculation."""
    moon_longitude = 0.0
    birth = datetime(1990, 1, 1)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    timeline = dasha.generate_mahadasha_timeline()
    
    # Get first full mahadasha
    for md in timeline:
        if not md.is_birth_dasha:
            antardashas = dasha.calculate_antardasha(md)
            pratyantars = dasha.calculate_pratyantardasha(antardashas[0])
            
            # Should have 9 pratyantardashas
            assert len(pratyantars) == 9
            
            # First pratyantardasha should match antardasha lord
            assert pratyantars[0].lord == antardashas[0].lord
            
            # Sum should equal antardasha days
            total_pd_days = sum(pd.days for pd in pratyantars)
            assert abs(total_pd_days - antardashas[0].days) < 0.01
            break


def test_get_current_periods():
    """Test getting current running periods."""
    moon_longitude = 0.0
    birth = datetime(1990, 1, 1)
    
    dasha = VimshottariDasha(moon_longitude, birth)
    
    # Check for a date within the timeline
    target = datetime(1995, 6, 15)
    current = dasha.get_current_periods(target)
    
    # Should return valid periods
    assert 'mahadasha' in current
    assert 'antardasha' in current
    assert current['mahadasha']['lord'] in DASHA_SEQUENCE
    assert current['antardasha']['lord'] in DASHA_SEQUENCE


def test_known_chart():
    """Test against known birth chart with verified dasha."""
    # Someone born when Moon at 15° Rohini (Moon nakshatra)
    # Rohini starts at 40° (3rd nakshatra), so 15° in Rohini = 40° + 15° = 55° - but wait
    # Actually, 15° within Rohini = position where Moon has traversed 15° of the 13.33° span
    # Let's use absolute position: Rohini center is around 46.67°
    
    birth = datetime(1990, 5, 15, 10, 30)
    moon_lon = 46.5  # In Rohini nakshatra
    
    dasha = VimshottariDasha(moon_lon, birth)
    assert dasha.get_birth_dasha_lord() == 'Moon'

