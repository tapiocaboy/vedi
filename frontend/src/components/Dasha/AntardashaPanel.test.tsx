import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AntardashaDepthReport, BirthData, DashaPredictionData } from '../../services/api';

const getAntardashaDepth = vi.fn();

vi.mock('../../services/api', () => ({
  getAntardashaDepth: (...args: unknown[]) => getAntardashaDepth(...args),
}));

const { AntardashaPanel } = await import('./AntardashaPanel');
const { LanguageProvider } = await import('../../i18n/LanguageContext');

const BIRTH: BirthData = {
  date: '1986-09-16T13:22:00',
  latitude: 7.2906,
  longitude: 80.6337,
  timezone: 'Asia/Colombo',
  ayanamsa: 'LAHIRI',
};

const PREDICTION = {
  dashaLord: 'Saturn',
  antardasha: 'Ketu',
  periodType: 'antardasha',
  overallTheme: 'Shani–Ketu — karmic clearing through hardship',
  overallRating: 2,
  predictions: {
    health: { trend: 'negative', intensity: 'challenging', summary: 'Health needs priority focus', details: ['Chronic conditions may surface'], remedies: ['Serve the elderly'], keywords: [] },
    wealth: { trend: 'negative', intensity: 'challenging', summary: 'Careful financial management', details: ['Slow gains'], remedies: [], keywords: [] },
  },
  favorableActivities: ['Long-term financial planning'],
  unfavorableActivities: ['Taking unethical shortcuts'],
  importantTransits: [],
  remedies: { gemstone: 'Blue Sapphire', mantra: 'Om Shanaishcharaya Namah', deity: 'Shani' },
} as unknown as DashaPredictionData;

const REPORT: AntardashaDepthReport = {
  mahadashaLord: 'Saturn',
  antardashaLord: 'Ketu',
  start: '2027-01-23T22:07:13.228Z',
  end: '2028-03-03T17:46:13.228Z',
  days: 404.8,
  prediction: PREDICTION,
  judgement: {
    score: 5.7,
    verdict: 'mixed',
    houseFromLord: 11,
    shashtashtaka: false,
    relationship: 'neutral',
    factors: [
      {
        kind: 'disposition',
        label: 'Ketu stands in the 11th from Saturn',
        detail: 'Natally Ketu is in Kanya and Saturn in Vrischika, putting Ketu in the 11th from the period lord.',
        points: 1.5,
      },
      {
        kind: 'pair',
        label: 'Saturn–Ketu is a named combination',
        detail: 'The classical reading of Saturn–Ketu is a stress point (-2 on the traditional scale).',
        points: -0.8,
      },
    ],
    headline: 'Natally Ketu is in Kanya and Saturn in Vrischika, putting Ketu in the 11th from the period lord.',
  },
  weightDefinition: ['Repetition across dasha levels — Ketu does exactly that.'],
  currentLord: 'Ketu',
  periods: [
    {
      lord: 'Ketu',
      start: '2027-01-23T22:07:13.228Z',
      end: '2027-02-16T12:51:59.728Z',
      days: 23.6,
      weight: 6.5,
      band: 'strong',
      tone: 'testing',
      headline: 'Ketu runs both the antardasha and the pratyantardasha.',
      factors: [{ kind: 'repetition', label: 'Doubled sub-lord', detail: 'Compounds rather than blends.', points: 2.5 }],
      transitHits: [
        {
          transiting: 'Saturn',
          kind: 'conjunction',
          target: 'Ketu',
          date: '2027-02-01T00:00:00.000Z',
          detail: 'Transit Saturn crosses your natal Ketu',
        },
      ],
      trendShifts: [{ area: 'wealth', from: 'negative', to: 'mixed' }],
      addedDetails: [],
      isCurrent: true,
    },
    {
      lord: 'Venus',
      start: '2027-02-16T12:51:59.728Z',
      end: '2027-04-25T00:08:29.728Z',
      days: 67.5,
      weight: 2.9,
      band: 'light',
      tone: 'constructive',
      headline: 'Venus is in a friend’s sign natally.',
      factors: [],
      transitHits: [],
      trendShifts: [],
      addedDetails: [],
      isCurrent: false,
    },
  ],
  strategy: {
    stance: 'mixed',
    judgement: {
      score: 5.7,
      verdict: 'mixed',
      houseFromLord: 11,
      shashtashtaka: false,
      relationship: 'neutral',
      factors: [],
      headline: 'Ketu is in the 11th from Saturn.',
    },
    stanceHeadline: 'Consolidation, not accumulation',
    stanceBody: 'Saturn–Ketu is not by nature an acquisition period.',
    peaks: 'Force concentrates in Saturn–Ketu–Ketu.',
    actionWindows: [
      {
        lord: 'Sun',
        start: '2027-04-25T00:08:29.728Z',
        end: '2027-05-15T05:55:26.728Z',
        weight: 3.6,
        band: 'moderate',
        tone: 'constructive',
        reason: 'Sun is in its own sign natally, and it rules your 9th house of fortune & philosophy.',
      },
    ],
    defensiveWindows: [],
    buildWindows: [],
    protect: ['Keep reserves liquid.'],
    nextHarvest: {
      lord: 'Venus',
      start: '2028-03-03T17:46:13.228Z',
      end: '2031-05-04T08:46:13.228Z',
      note: 'Venus rules your 11th house of gains & social circle.',
    },
    oneLine: 'Position here so you win when Saturn–Venus opens your 11th house.',
  },
};

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <AntardashaPanel
          birthData={BIRTH}
          mahadashaLord="Saturn"
          antardashaLord="Ketu"
          antardashaStart={REPORT.start}
        />
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

const ASTRO = 'The astrology behind this';

describe('AntardashaPanel', () => {
  it('leads with a plain headline and the calibrated rating; the astrology is one tap away', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu');
    expect(getAntardashaDepth).toHaveBeenCalledTimes(1);
    // The same calibrated 1–10 rating the rest of the app shows…
    expect(screen.getByText('2/10')).toBeInTheDocument();
    // …and plain words, no Sanskrit or house numbers.
    expect(screen.getByText('A testing stretch — go slowly')).toBeInTheDocument();
    expect(screen.getByText(/The Ketu sub-period of your Saturn main period/)).toBeInTheDocument();
    expect(screen.queryByText(/karmic clearing through hardship/)).not.toBeInTheDocument();
    expect(screen.queryByText(/5\.7\/10/)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText(ASTRO)[0]);
    expect(await screen.findByText(/karmic clearing through hardship/)).toBeInTheDocument();
    expect(screen.getByText(/Classical reading · 5\.7\/10/)).toBeInTheDocument();
    expect(screen.getByText('Ketu stands in the 11th from Saturn')).toBeInTheDocument();
  });

  it('opens on the sub-periods tab: one plain line per window, weight kept for the astrology view', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    expect(screen.getByText('Saturn – Ketu – Venus')).toBeInTheDocument();
    expect(screen.getByText(/^Ketu sets the tone — /)).toBeInTheDocument();
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
    // The technical headline and the weight number are not in the collapsed row.
    expect(screen.queryByText('Ketu runs both the antardasha and the pratyantardasha.')).not.toBeInTheDocument();
    expect(screen.queryByText('6.5')).not.toBeInTheDocument();
  });

  it('expands a window to what changes, with the astrology one level further down', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    // The gemstone, mantra and activities belong to the period, not to each window.
    expect(screen.queryByText('Blue Sapphire')).not.toBeInTheDocument();
    expect(screen.queryByText('Long-term financial planning')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Saturn – Ketu – Ketu'));
    expect(await screen.findByText('What changes in this window')).toBeInTheDocument();
    expect(screen.queryByText('Doubled sub-lord')).not.toBeInTheDocument();

    // Header disclosure first, then the window's own.
    const toggles = screen.getAllByText(ASTRO);
    fireEvent.click(toggles[1]);
    expect(await screen.findByText('Doubled sub-lord')).toBeInTheDocument();
    expect(screen.getByText('Transit Saturn crosses your natal Ketu')).toBeInTheDocument();
    expect(screen.getByText('6.5')).toBeInTheDocument();
    expect(screen.queryByText('Blue Sapphire')).not.toBeInTheDocument();
  });

  it('does not offer expansion for a window with nothing specific to say', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Venus');
    expect(screen.getByText('Saturn – Ketu – Venus').closest('button')).toBeDisabled();
  });

  it('states the outlook and activities once, under Outlook, in plain words', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    fireEvent.click(screen.getByRole('tab', { name: 'Outlook' }));

    expect(await screen.findByText('Life Area Outlook')).toBeInTheDocument();
    expect(screen.getByText('Activities Guide')).toBeInTheDocument();
    // Plain area lines, not the engine's summary.
    expect(screen.getByText(/Avoid loans, speculation and big commitments/)).toBeInTheDocument();
    expect(screen.queryByText('Careful financial management')).not.toBeInTheDocument();
    // Remedies are commented out of the UI for now.
    expect(screen.queryByText('Blue Sapphire')).not.toBeInTheDocument();
    expect(screen.queryByText('Om Shanaishcharaya Namah')).not.toBeInTheDocument();
    // The sub-period list is not rendered alongside it.
    expect(screen.queryByText('Saturn – Ketu – Ketu')).not.toBeInTheDocument();
  });

  it('leads the strategy with plain advice and keeps the classical reasoning behind the disclosure', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    fireEvent.click(screen.getByRole('tab', { name: 'Strategy' }));

    expect(await screen.findByText('Consolidation, not accumulation')).toBeInTheDocument();
    expect(screen.getByText(/Position here so you win/)).toBeInTheDocument();
    expect(screen.getByText(/^A window to act:/)).toBeInTheDocument();
    expect(screen.getByText(/Venus rules your 11th house of gains/)).toBeInTheDocument();
    expect(screen.queryByText(/rules your 9th house of fortune/)).not.toBeInTheDocument();

    const toggles = screen.getAllByText(ASTRO);
    fireEvent.click(toggles[toggles.length - 1]);
    expect(await screen.findByText(/rules your 9th house of fortune/)).toBeInTheDocument();
    expect(screen.getAllByText('Ketu stands in the 11th from Saturn').length).toBeGreaterThan(0);
  });

  it('degrades gracefully when the report cannot be built', async () => {
    getAntardashaDepth.mockResolvedValue(null);
    renderPanel();
    expect(
      await screen.findByText('Sub-period breakdown is unavailable for this period.'),
    ).toBeInTheDocument();
  });
});
