"""
Tests for Rashi (Zodiac Sign) calculations.
"""

import pytest

from src.core.rashi import (
    get_rashi,
    RASHIS,
    RASHI_LORDS,
    get_rashi_info,
    get_opposite_rashi,
    get_trine_rashis,
)


def test_rashi_count():
    """Should have 12 rashis."""
    assert len(RASHIS) == 12


def test_mesha_start():
    """Mesha (Aries) should be at 0°."""
    index, name, degree = get_rashi(0.0)
    assert index == 0
    assert name == 'Mesha'
    assert degree == pytest.approx(0.0, abs=0.001)


def test_mesha_end():
    """29.99° should still be Mesha."""
    index, name, degree = get_rashi(29.99)
    assert index == 0
    assert name == 'Mesha'
    assert degree == pytest.approx(29.99, abs=0.001)


def test_vrishabha_start():
    """Vrishabha (Taurus) should start at 30°."""
    index, name, degree = get_rashi(30.0)
    assert index == 1
    assert name == 'Vrishabha'
    assert degree == pytest.approx(0.0, abs=0.001)


def test_mithuna():
    """Mithuna (Gemini) should be index 2."""
    index, name, degree = get_rashi(75.5)  # 60° + 15.5°
    assert index == 2
    assert name == 'Mithuna'
    assert degree == pytest.approx(15.5, abs=0.001)


def test_meena():
    """Meena (Pisces) should be the last sign (index 11)."""
    index, name, degree = get_rashi(350.0)  # 330° + 20°
    assert index == 11
    assert name == 'Meena'
    assert degree == pytest.approx(20.0, abs=0.001)


def test_wraparound():
    """360° should wrap to 0° (Mesha)."""
    index, name, degree = get_rashi(360.0)
    assert index == 0
    assert name == 'Mesha'


def test_negative_longitude():
    """Negative longitude should wrap correctly."""
    index, name, degree = get_rashi(-10.0)  # Should be like 350°
    assert index == 11  # Meena
    assert name == 'Meena'


def test_rashi_lords():
    """Test rashi lords are correct."""
    assert RASHI_LORDS['Mesha'] == 'Mars'
    assert RASHI_LORDS['Vrishabha'] == 'Venus'
    assert RASHI_LORDS['Mithuna'] == 'Mercury'
    assert RASHI_LORDS['Karka'] == 'Moon'
    assert RASHI_LORDS['Simha'] == 'Sun'
    assert RASHI_LORDS['Kanya'] == 'Mercury'
    assert RASHI_LORDS['Tula'] == 'Venus'
    assert RASHI_LORDS['Vrischika'] == 'Mars'
    assert RASHI_LORDS['Dhanu'] == 'Jupiter'
    assert RASHI_LORDS['Makara'] == 'Saturn'
    assert RASHI_LORDS['Kumbha'] == 'Saturn'
    assert RASHI_LORDS['Meena'] == 'Jupiter'


def test_get_rashi_info():
    """Test getting rashi info."""
    info = get_rashi_info(0)
    assert info['name'] == 'Mesha'
    assert info['english'] == 'Aries'
    assert info['lord'] == 'Mars'
    assert info['element'] == 'Fire'
    assert info['modality'] == 'Movable'


def test_opposite_rashi():
    """Test opposite rashi calculation."""
    assert get_opposite_rashi(0) == 6   # Mesha opposite Tula
    assert get_opposite_rashi(1) == 7   # Vrishabha opposite Vrischika
    assert get_opposite_rashi(6) == 0   # Tula opposite Mesha
    assert get_opposite_rashi(11) == 5  # Meena opposite Kanya


def test_trine_rashis():
    """Test trine rashis (same element)."""
    # Fire signs: Mesha (0), Simha (4), Dhanu (8)
    trines = get_trine_rashis(0)
    assert 0 in trines
    assert 4 in trines
    assert 8 in trines
    
    # Earth signs: Vrishabha (1), Kanya (5), Makara (9)
    trines = get_trine_rashis(1)
    assert 1 in trines
    assert 5 in trines
    assert 9 in trines

