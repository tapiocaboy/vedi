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

describe('AntardashaPanel', () => {
  it('fetches the period once and names it once in the header', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu');
    expect(getAntardashaDepth).toHaveBeenCalledTimes(1);
    // The header shows the antardasha-specific judgement, not the
    // mahadasha-driven engine rating (which is 2/10 for all nine).
    expect(screen.getByText('5.7/10')).toBeInTheDocument();
    expect(screen.getByText('Mixed')).toBeInTheDocument();
    expect(screen.getByText(/karmic clearing through hardship/)).toBeInTheDocument();
  });

  it('opens on the sub-periods tab, with weight, band and tone per window', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    expect(screen.getByText('Saturn – Ketu – Venus')).toBeInTheDocument();
    expect(screen.getByText('6.5')).toBeInTheDocument();
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
  });

  it('keeps remedies and activities out of the sub-period list entirely', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    // The gemstone, mantra and activities belong to the period, not to each window.
    expect(screen.queryByText('Blue Sapphire')).not.toBeInTheDocument();
    expect(screen.queryByText('Long-term financial planning')).not.toBeInTheDocument();

    // Expanding a window shows only what is specific to it.
    fireEvent.click(screen.getByText('Saturn – Ketu – Ketu'));
    expect(await screen.findByText('Doubled sub-lord')).toBeInTheDocument();
    expect(screen.getByText('Transit Saturn crosses your natal Ketu')).toBeInTheDocument();
    expect(screen.getByText('What changes in this window')).toBeInTheDocument();
    expect(screen.queryByText('Blue Sapphire')).not.toBeInTheDocument();
  });

  it('does not offer expansion for a window with nothing specific to say', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Venus');
    expect(screen.getByText('Saturn – Ketu – Venus').closest('button')).toBeDisabled();
  });

  it('states the outlook, remedies and activities once, under Outlook', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    fireEvent.click(screen.getByRole('tab', { name: 'Outlook' }));

    expect(await screen.findByText('Blue Sapphire')).toBeInTheDocument();
    expect(screen.getByText('Om Shanaishcharaya Namah')).toBeInTheDocument();
    // The sub-period list is not rendered alongside it.
    expect(screen.queryByText('Saturn – Ketu – Ketu')).not.toBeInTheDocument();
  });

  it('puts the profitability framing on its own tab', async () => {
    getAntardashaDepth.mockResolvedValue(REPORT);
    renderPanel();

    await screen.findByText('Saturn – Ketu – Ketu');
    fireEvent.click(screen.getByRole('tab', { name: 'Strategy' }));

    expect(await screen.findByText('Consolidation, not accumulation')).toBeInTheDocument();
    // The classical reasoning behind the stance is shown, not just the verdict.
    expect(screen.getByText('Ketu stands in the 11th from Saturn')).toBeInTheDocument();
    expect(screen.getByText(/rules your 9th house of fortune/)).toBeInTheDocument();
    expect(screen.getByText(/Venus rules your 11th house of gains/)).toBeInTheDocument();
    expect(screen.getByText(/Position here so you win/)).toBeInTheDocument();
  });

  it('degrades gracefully when the report cannot be built', async () => {
    getAntardashaDepth.mockResolvedValue(null);
    renderPanel();
    expect(
      await screen.findByText('Sub-period breakdown is unavailable for this period.'),
    ).toBeInTheDocument();
  });
});
