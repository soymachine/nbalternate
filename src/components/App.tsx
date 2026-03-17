import { useState, useEffect } from 'react';
import type { PlayoffBracket, TeamWithRoster } from '../lib/types';
import { getTeamsWithRosters } from '../lib/nbaApi';
import { selectPlayoffTeams, simulateBracket } from '../lib/simulator';
import { BracketView } from './BracketView';
import { LeaderboardView } from './LeaderboardView';
import { ThemeProvider, useTheme } from '../lib/theme';

type Tab = 'bracket' | 'leaders';
const YEAR_RANGE = { min: 1985, max: 1995 };

const LOADING_MESSAGES = [
  'Traveling back in time…',
  'Assembling rosters from the alternate timeline…',
  'Scouting the East conference…',
  'Scouting the West conference…',
  'The commissioner flips the lottery balls…',
  'Seeding the bracket…',
  'Tip-off in the alternate universe…',
  'The scoreboard in dimension X-NBA is lighting up…',
  'Crunching box scores across the multiverse…',
  'Almost there — the buzzer is about to sound!',
];

function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const isDark = mode === 'dark';
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 8,
        border: '1px solid var(--c-border-md)',
        background: 'var(--c-surface-active)',
        cursor: 'pointer', fontSize: 16, transition: 'all 0.2s',
        color: 'var(--c-text2)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-text3)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border-md)'; }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

function Inner() {
  const [year, setYear] = useState<number>(1991);
  const [bracket, setBracket] = useState<PlayoffBracket | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('bracket');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 600 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  async function generate() {
    setError(null);
    setBracket(null);
    setLoading(true);
    let msgIdx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2500);
    try {
      const teamsRaw = await getTeamsWithRosters(year);
      const teams: TeamWithRoster[] = teamsRaw.map(t => ({
        team: t.team, players: t.players, winPct: t.winPct,
        rawWinPct: t.winPct, adjustedScore: t.winPct, seed: 0,
      }));
      const { east, west } = selectPlayoffTeams(teams, year);
      const result = simulateBracket(east, west, year);
      setBracket(result);
      setTab('bracket');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text1)', fontFamily: "'Roboto Condensed', sans-serif", transition: 'background 0.3s, color 0.3s' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'var(--c-header-bg)',
        borderBottom: '1px solid var(--c-header-border)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #C8102E 0%, #1D428A 100%)' }} />
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: isMobile ? '0 12px' : '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: isMobile ? 22 : 26 }}>🏀</span>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: isMobile ? 17 : 20, lineHeight: 1, letterSpacing: '0.02em', color: 'var(--c-text1)' }}>
                NBA<span style={{ color: '#C8102E' }}>alternate</span>
              </div>
              {!isMobile && (
                <div style={{ fontSize: 9, color: 'var(--c-text4)', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Parallel Universe Playoffs
                </div>
              )}
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Tabs */}
            {bracket && (
              <>
                <div style={{
                  display: 'flex', background: 'var(--c-surface)',
                  border: '1px solid var(--c-border-md)', borderRadius: 8, padding: 3, gap: 2,
                }}>
                  {([['bracket', '🏆', 'Bracket'], ['leaders', '📊', 'Leaders']] as const).map(([key, icon, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                      style={{
                        padding: isMobile ? '6px 10px' : '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 13,
                        letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.15s',
                        background: tab === key ? 'var(--c-surface-active)' : 'transparent',
                        color: tab === key ? 'var(--c-text1)' : 'var(--c-text4)',
                      }}
                    >{isMobile ? icon : `${icon} ${label}`}</button>
                  ))}
                </div>
                <button onClick={generate} disabled={loading}
                  title={`Resimulate ${year - 1}–${year} with a new random seed`}
                  style={{
                    padding: '7px 14px', borderRadius: 6,
                    border: '1px solid var(--c-border-md)',
                    background: 'transparent', color: 'var(--c-text3)', cursor: 'pointer',
                    fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 12,
                    letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s',
                    opacity: loading ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.color = 'var(--c-text1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text3)'; }}
                >{isMobile ? '↺' : '↺ Run Again'}</button>
                <button onClick={() => setBracket(null)}
                  style={{
                    padding: '7px 14px', borderRadius: 6, border: '1px solid var(--c-border-md)',
                    background: 'transparent', color: 'var(--c-text4)', cursor: 'pointer',
                    fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 12,
                    letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text4)'; }}
                >{isMobile ? '←' : '← New'}</button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── LANDING ── */}
      {!bracket && !loading && (
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px 48px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(200,16,46,0.1)', border: '1px solid rgba(200,16,46,0.3)',
              borderRadius: 999, padding: '5px 14px', marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8102E', display: 'inline-block', boxShadow: '0 0 8px #C8102E' }} />
              <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', color: '#C8102E', textTransform: 'uppercase' }}>
                What if…?
              </span>
            </div>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 64, lineHeight: 0.95, letterSpacing: '-0.01em', marginBottom: 16, color: 'var(--c-text1)' }}>
              REWRITE<br />
              <span style={{
                background: 'linear-gradient(90deg, #C8102E 0%, #FF4D6A 40%, #C8102E 60%, #9E0820 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite', display: 'inline-block',
              }}>NBA HISTORY</span>
            </h1>
            <p style={{ color: 'var(--c-text3)', fontSize: 16, lineHeight: 1.5, maxWidth: 400, margin: '0 auto' }}>
              Pick a season. We'll grab the real standings, remix the brackets,
              and simulate every game — box score and all.
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border-md)',
            borderRadius: 16, padding: 32,
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
          }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 12, letterSpacing: '0.15em', color: 'var(--c-text4)', textTransform: 'uppercase' }}>Season</label>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 13, color: 'var(--c-text4)', letterSpacing: '0.05em' }}>{year - 1}–{year}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
                <input type="range" min={YEAR_RANGE.min} max={YEAR_RANGE.max} value={year}
                  onChange={e => setYear(Number(e.target.value))} style={{ flex: 1 }} />
                <span style={{
                  fontFamily: '"Bebas Neue", sans-serif', fontSize: 52, lineHeight: 1,
                  color: '#C8102E', letterSpacing: '0.02em', minWidth: 90, textAlign: 'right',
                  textShadow: '0 0 20px rgba(200,16,46,0.4)',
                }}>{year}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingRight: 106 }}>
                {Array.from({ length: YEAR_RANGE.max - YEAR_RANGE.min + 1 }, (_, i) => YEAR_RANGE.min + i).map(y => (
                  <button key={y} onClick={() => setYear(y)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                    fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 10,
                    color: y === year ? '#C8102E' : 'var(--c-text5)', transition: 'color 0.15s',
                  }}>{y}</button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--c-border)', marginBottom: 24 }} />

            {error && (
              <div style={{
                background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.25)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                fontFamily: 'Roboto Condensed, sans-serif', fontSize: 14, color: '#C8102E',
              }}>⚠ {error}</div>
            )}

            <button onClick={generate} disabled={loading}
              style={{
                width: '100%', padding: '16px 0',
                background: 'linear-gradient(135deg, #C8102E 0%, #a00c24 100%)',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 18,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff',
                boxShadow: '0 8px 24px rgba(200,16,46,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                transition: 'all 0.2s', opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(200,16,46,0.55), inset 0 1px 0 rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(200,16,46,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'; }}
            >Generate Alternate Playoffs</button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--c-text5)', marginTop: 24, letterSpacing: '0.05em' }}>
            Historical rosters bundled locally · Standings from ESPN · Simulation is purely fictional
          </p>
        </main>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 120, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 28 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '3px solid var(--c-surface-active)',
              borderTopColor: '#C8102E', animation: 'spin 0.9s linear infinite',
            }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏀</div>
          </div>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: '0.05em', color: 'var(--c-text2)', textAlign: 'center', maxWidth: 320, animation: 'pulse 2.5s ease-in-out infinite' }}>
            {loadingMsg}
          </p>
          <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 13, color: 'var(--c-text4)', marginTop: 10, letterSpacing: '0.05em' }}>
            Loading {year - 1}–{year} season…
          </p>
        </div>
      )}

      {/* ── RESULT ── */}
      {bracket && !loading && (
        <div style={{ animation: 'fadeIn 0.4s ease both' }}>
          {tab === 'bracket' ? <BracketView bracket={bracket} /> : <LeaderboardView bracket={bracket} />}
        </div>
      )}

      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes shimmer { from { background-position:-200% center } to { background-position:200% center } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        * { transition: background-color 0.2s, border-color 0.2s, color 0.2s; }
        input[type=range]::-webkit-slider-thumb { background:#C8102E; }
        input[type=range]::-webkit-slider-runnable-track { background:var(--c-surface-active); }
      `}</style>
    </div>
  );
}

export default function App() {
  return <ThemeProvider><Inner /></ThemeProvider>;
}
