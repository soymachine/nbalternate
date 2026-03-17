import { useState, useEffect } from 'react';
import type { PlayoffBracket } from '../lib/types';
import { buildLeaderboard, topBy, type PlayoffLeader } from '../lib/leaderboard';

interface Props { bracket: PlayoffBracket; }

type Category = 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg';

const CATEGORIES: { key: Category; label: string; abbr: string; accent: string; glow: string }[] = [
  { key: 'ppg', label: 'Points',   abbr: 'PTS', accent: '#C8102E', glow: 'rgba(200,16,46,0.35)'   },
  { key: 'rpg', label: 'Rebounds', abbr: 'REB', accent: '#1D428A', glow: 'rgba(29,66,138,0.35)'   },
  { key: 'apg', label: 'Assists',  abbr: 'AST', accent: '#17a04a', glow: 'rgba(23,160,74,0.35)'   },
  { key: 'spg', label: 'Steals',   abbr: 'STL', accent: '#c89010', glow: 'rgba(200,144,16,0.35)'  },
  { key: 'bpg', label: 'Blocks',   abbr: 'BLK', accent: '#7c3aed', glow: 'rgba(124,58,237,0.35)'  },
];

// Position badge colors sourced from CSS variables (set per theme in theme.tsx)
const POS_CSS: Record<string, { bg: string; color: string }> = {
  PG: { bg: 'var(--c-pos-pg-bg)', color: 'var(--c-pos-pg)' },
  SG: { bg: 'var(--c-pos-sg-bg)', color: 'var(--c-pos-sg)' },
  SF: { bg: 'var(--c-pos-sf-bg)', color: 'var(--c-pos-sf)' },
  PF: { bg: 'var(--c-pos-pf-bg)', color: 'var(--c-pos-pf)' },
  C:  { bg: 'var(--c-pos-c-bg)',  color: 'var(--c-pos-c)'  },
};

function pct(n: number) {
  return n === 0 ? '—' : (n * 100).toFixed(1) + '%';
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: 18, lineHeight: 1 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 18, lineHeight: 1 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 18, lineHeight: 1 }}>🥉</span>;
  return (
    <span style={{
      fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13,
      color: 'var(--c-text4)', minWidth: 20, textAlign: 'center', display: 'inline-block',
    }}>{rank}</span>
  );
}

function StatBar({ value, max, accent }: { value: number; max: number; accent: string }) {
  const w = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: '100%', height: 2, background: 'var(--c-border)', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${w}%`, background: accent, borderRadius: 2, transition: 'width 0.4s ease' }} />
    </div>
  );
}

function LeaderRow({ player, rank, category, accent, glow, maxVal, isFirst, isMobile }: {
  player: PlayoffLeader; rank: number; category: Category;
  accent: string; glow: string; maxVal: number; isFirst: boolean; isMobile: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const pos = POS_CSS[player.position] ?? { bg: 'var(--c-surface-tab)', color: 'var(--c-text2)' };
  const val = player[category] as number;
  const bg = hovered
    ? 'var(--c-row-hover)'
    : isFirst ? 'var(--c-surface-active)' : 'var(--c-surface)';

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: bg,
        border: `1px solid ${isFirst ? 'var(--c-border-md)' : 'var(--c-border-sm)'}`,
        borderLeft: `3px solid ${isFirst ? accent : 'transparent'}`,
        borderRadius: 10, padding: '10px 14px',
        transition: 'background 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ width: 26, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <MedalIcon rank={rank} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 15,
            color: 'var(--c-text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{player.playerName}</span>
          <span style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 10,
            letterSpacing: '0.05em', padding: '2px 6px', borderRadius: 4, flexShrink: 0,
            background: pos.bg, color: pos.color,
          }}>{player.position}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text3)' }}>{player.teamAbb}</span>
          <span style={{ color: 'var(--c-text5)', fontSize: 11 }}>·</span>
          <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)' }}>{player.gp}G</span>
          <span style={{ color: 'var(--c-text5)', fontSize: 11 }}>·</span>
          <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)' }}>{player.mpg} min</span>
        </div>
        <StatBar value={val} max={maxVal} accent={accent} />
      </div>

      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {category !== 'ppg' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 15, color: 'var(--c-stat-dim)', letterSpacing: '0.03em' }}>{player.ppg}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: 'var(--c-text4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>pts</div>
            </div>
          )}
          {category !== 'rpg' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 15, color: 'var(--c-stat-dim)', letterSpacing: '0.03em' }}>{player.rpg}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: 'var(--c-text4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>reb</div>
            </div>
          )}
          {category !== 'apg' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 15, color: 'var(--c-stat-dim)', letterSpacing: '0.03em' }}>{player.apg}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: 'var(--c-text4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>ast</div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 15, color: 'var(--c-stat-dim)', letterSpacing: '0.03em' }}>{pct(player.fgPct)}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: 'var(--c-text4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>fg%</div>
          </div>
        </div>
      )}

      <div style={{
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize: isMobile ? 28 : 36,
        lineHeight: 1, letterSpacing: '0.02em', color: accent, flexShrink: 0,
        minWidth: isMobile ? 40 : 52, textAlign: 'right',
        textShadow: isFirst ? `0 0 16px ${glow}` : 'none',
      }}>{val}</div>
    </div>
  );
}

export function LeaderboardView({ bracket }: Props) {
  const [active, setActive] = useState<Category>('ppg');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const leaders = buildLeaderboard(bracket);
  const cat = CATEGORIES.find(c => c.key === active)!;
  const top = topBy(leaders, active, 15);
  const maxVal = (top[0]?.[active] as number) ?? 1;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '20px 12px 48px' : '32px 16px 64px' }}>

      {/* TITLE */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,184,28,0.08)', border: '1px solid rgba(255,184,28,0.2)',
          borderRadius: 999, padding: '4px 14px', marginBottom: 14,
        }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.25em', color: 'var(--c-champ-text)', textTransform: 'uppercase' }}>
            {bracket.year - 1}–{bracket.year} Alternate Universe
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Oswald, sans-serif', fontWeight: 700,
          fontSize: isMobile ? 30 : 42,
          lineHeight: 0.95, letterSpacing: '0.01em', textTransform: 'uppercase',
          color: 'var(--c-text1)', marginBottom: 0,
        }}>Playoff Leaders</h2>
      </div>

      {/* CATEGORY TABS */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 24,
        background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
        borderRadius: 12, padding: 4,
      }}>
        {CATEGORIES.map(c => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '10px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--c-surface-tab)' : 'transparent',
                borderBottom: isActive ? `2px solid ${c.accent}` : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, lineHeight: 1,
                letterSpacing: '0.03em',
                color: isActive ? c.accent : 'var(--c-text4)',
                textShadow: isActive ? `0 0 10px ${c.glow}` : 'none',
                transition: 'all 0.15s',
              }}>{c.abbr}</span>
              {!isMobile && (
                <span style={{
                  fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 9,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: isActive ? 'var(--c-text2)' : 'var(--c-text4)', transition: 'color 0.15s',
                }}>{c.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION HEADER */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, padding: '0 2px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 18, background: cat.accent, borderRadius: 2, boxShadow: `0 0 8px ${cat.glow}` }} />
          <span style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: cat.accent,
          }}>{cat.label} Per Game</span>
        </div>
        <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)', letterSpacing: '0.05em' }}>
          Top 15 · min. 2 games
        </span>
      </div>

      {/* ROWS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {top.map((p, i) => (
          <LeaderRow
            key={p.playerId}
            player={p}
            rank={p.rank}
            category={active}
            accent={cat.accent}
            glow={cat.glow}
            maxVal={maxVal}
            isFirst={i === 0}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* CHAMPION CALLOUT */}
      <div style={{
        marginTop: 32,
        background: 'linear-gradient(135deg, rgba(255,184,28,0.06) 0%, rgba(255,184,28,0.02) 100%)',
        border: '1px solid rgba(255,184,28,0.18)',
        borderLeft: '3px solid #FFB81C',
        borderRadius: 10, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>🏆</span>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--c-champ-text)', marginBottom: 3 }}>
            Champion
          </div>
          <div style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 20,
            letterSpacing: '0.02em', textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #FFE180 0%, #FFB81C 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {bracket.champion.team.fullName}
          </div>
        </div>
      </div>
    </div>
  );
}
