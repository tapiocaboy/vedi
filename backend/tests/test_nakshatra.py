"""
Tests for Nakshatra calculations.
"""

import pytest

from src.core.nakshatra import (
    get_nakshatra,
    NAKSHATRAS,
    NAKSHATRA_SPAN,
    PADA_SPAN,
)


def test_nakshatra_count():
    """Should have 27 nakshatras."""
    assert len(NAKSHATRAS) == 27


def test_nakshatra_span():
    """Nakshatra span should be 13°20'."""
    expected_span = 360.0 / 27.0
    assert NAKSHATRA_SPAN == pytest.approx(expected_span, abs=0.0001)
    assert NAKSHATRA_SPAN == pytest.approx(13.3333, abs=0.001)


def test_pada_span():
    """Pada span should be 3°20'."""
    expected_pada = NAKSHATRA_SPAN / 4.0
    assert PADA_SPAN == pytest.approx(expected_pada, abs=0.0001)
    assert PADA_SPAN == pytest.approx(3.3333, abs=0.001)


def test_ashwini_start():
    """Ashwini should be at 0°."""
    result = get_nakshatra(0.0)
    assert result['name'] == 'Ashwini'
    assert result['lord'] == 'Ketu'
    assert result['index'] == 0
    assert result['pada'] == 1


def test_ashwini_pada_2():
    """Test Ashwini pada 2."""
    result = get_nakshatra(4.0)  # Around 4° should be pada 2
    assert result['name'] == 'Ashwini'
    assert result['pada'] == 2


def test_bharani():
    """Bharani should start at 13°20'."""
    result = get_nakshatra(14.0)  # Just past Ashwini
    assert result['name'] == 'Bharani'
    assert result['lord'] == 'Venus'
    assert result['index'] == 1


def test_krittika():
    """Krittika should be the 3rd nakshatra."""
    result = get_nakshatra(27.0)  # In Krittika
    assert result['name'] == 'Krittika'
    assert result['lord'] == 'Sun'
    assert result['index'] == 2


def test_rohini():
    """Rohini should be Moon ruled (4th nakshatra)."""
    result = get_nakshatra(45.0)  # In Rohini
    assert result['name'] == 'Rohini'
    assert result['lord'] == 'Moon'
    assert result['index'] == 3


def test_revati():
    """Revati should be the last nakshatra."""
    result = get_nakshatra(359.0)  # End of Revati
    assert result['name'] == 'Revati'
    assert result['lord'] == 'Mercury'
    assert result['index'] == 26


def test_wraparound():
    """360° should wrap to 0° (Ashwini)."""
    result = get_nakshatra(360.0)
    assert result['name'] == 'Ashwini'
    assert result['index'] == 0


def test_negative_longitude():
    """Negative longitude should wrap correctly."""
    result = get_nakshatra(-10.0)  # Should be like 350°
    assert result['index'] == 26  # Revati


def test_nakshatra_has_deity():
    """Nakshatra result should include deity."""
    result = get_nakshatra(45.0)
    assert 'deity' in result
    assert result['deity'] is not None


def test_nakshatra_has_gana():
    """Nakshatra result should include gana."""
    result = get_nakshatra(45.0)
    assert 'gana' in result
    assert result['gana'] in ['Deva', 'Manushya', 'Rakshasa']


def test_all_nakshatra_lords():
    """Verify all nakshatra lords are in the Vimshottari sequence."""
    valid_lords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 
                   'Venus', 'Saturn', 'Rahu', 'Ketu']
    
    for name, lord in NAKSHATRAS:
        assert lord in valid_lords, f"{name} has invalid lord: {lord}"


def test_nakshatra_sequence_lords():
    """Test the repeating pattern of nakshatra lords."""
    # Lords repeat in order: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
    expected_lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 
                      'Rahu', 'Jupiter', 'Saturn', 'Mercury']
    
    for i, (name, lord) in enumerate(NAKSHATRAS):
        expected_lord = expected_lords[i % 9]
        assert lord == expected_lord, f"Nakshatra {name} (#{i}) should have lord {expected_lord}, got {lord}"

