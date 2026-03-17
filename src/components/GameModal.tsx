import { useEffect } from 'react';
import type { GameResult, PlayerGameStats } from '../lib/types';

interface Props {
  game: GameResult;
  homeTeamName: string;
  awayTeamName: string;
  onClose: () => void;
}

export function GameModal({ game, homeTeamName, awayTeamName, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const awayWon = game.winner === game.awayTeam;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div style={{
        background: '#0C1420',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        width: '100%', maxWidth: 900, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* ── SCOREBOARD HEADER ── */}
        <div style={{
          background: 'linear-gradient(180deg, #111827 0%, #0F1420 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '20px 24px',
        }}>
          {/* Game label */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.25em', color: '#4a6080', textTransform: 'uppercase' }}>
              Game {game.gameNumber} · Final
            </span>
          </div>

          {/* Score display */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {/* Away */}
            <div style={{ flex: 1, textAlign: 'right', paddingRight: 32 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: awayWon ? '#8099bb' : '#2a3a55', marginBottom: 4 }}>
                {game.awayTeam}
              </div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 64, lineHeight: 1, letterSpacing: '0.02em', color: awayWon ? '#fff' : '#2e4060', textShadow: awayWon ? '0 0 20px rgba(255,255,255,0.2)' : 'none' }}>
                {game.awayScore}
              </div>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: '#2a3a55', marginTop: 2 }}>
                {awayTeamName.split(' ').slice(1).join(' ')}
              </div>
            </div>

            {/* Separator */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 12, color: '#2a3a55', letterSpacing: '0.1em' }}>@</span>
              <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Home */}
            <div style={{ flex: 1, textAlign: 'left', paddingLeft: 32 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: !awayWon ? '#8099bb' : '#2a3a55', marginBottom: 4 }}>
                {game.homeTeam}
              </div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 64, lineHeight: 1, letterSpacing: '0.02em', color: !awayWon ? '#fff' : '#2e4060', textShadow: !awayWon ? '0 0 20px rgba(255,255,255,0.2)' : 'none' }}>
                {game.homeScore}
              </div>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: '#2a3a55', marginTop: 2 }}>
                {homeTeamName.split(' ').slice(1).join(' ')}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOX SCORES ── */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <BoxScoreTable players={game.awayBoxScore} teamName={awayTeamName} abbr={game.awayTeam} score={game.awayScore} isWinner={awayWon} />
            <BoxScoreTable players={game.homeBoxScore} teamName={homeTeamName} abbr={game.homeTeam} score={game.homeScore} isWinner={!awayWon} right />
          </div>
        </div>
      </div>

      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
        color: '#8099bb', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', fontFamily: 'sans-serif',
      }}
        onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.target as HTMLElement).style.color = '#fff'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.target as HTMLElement).style.color = '#8099bb'; }}
      >✕</button>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  );
}

function BoxScoreTable({ players, teamName, abbr, score, isWinner, right = false }:
  { players: PlayerGameStats[]; teamName: string; abbr: string; score: number; isWinner: boolean; right?: boolean }) {

  const sorted = [...players].sort((a, b) => b.minutes - a.minutes);
  const totals = players.reduce((a, p) => ({
    pts: a.pts + p.pts, reb: a.reb + p.reb, ast: a.ast + p.ast,
    stl: a.stl + p.stl, blk: a.blk + p.blk, to: a.to + p.turnover,
    fgm: a.fgm + p.fgm, fga: a.fga + p.fga,
    fg3m: a.fg3m + p.fg3m, fg3a: a.fg3a + p.fg3a,
    ftm: a.ftm + p.ftm, fta: a.fta + p.fta,
  }), { pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,fg3m:0,fg3a:0,ftm:0,fta:0 });

  const th: React.CSSProperties = {
    fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 10,
    letterSpacing: '0.12em', color: '#2a3a55', textTransform: 'uppercase',
    padding: '6px 5px', textAlign: 'right', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    fontFamily: '"Bebas Neue", sans-serif', fontSize: 14,
    color: '#5a7090', padding: '5px 5px', textAlign: 'right',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    letterSpacing: '0.03em',
  };

  return (
    <div style={{ borderRight: right ? 'none' : '1px solid rgba(255,255,255,0.05)', padding: '16px 16px' }}>
      {/* Team header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: isWinner ? '#fff' : '#3a4f6a' }}>
            {abbr}
          </div>
          <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: '#2a3a55' }}>{teamName}</div>
        </div>
        {isWinner && (
          <div style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em',
            background: 'rgba(255,184,28,0.1)', border: '1px solid rgba(255,184,28,0.3)',
            color: '#FFB81C', borderRadius: 6, padding: '3px 10px',
          }}>WIN</div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ ...th, textAlign: 'left', paddingLeft: 0 }}>PLAYER</th>
              <th style={th}>MIN</th>
              <th style={{ ...th, color: '#8099bb' }}>PTS</th>
              <th style={th}>REB</th>
              <th style={th}>AST</th>
              <th style={th}>STL</th>
              <th style={th}>BLK</th>
              <th style={th}>TO</th>
              <th style={th}>FG</th>
              <th style={th}>3P</th>
              <th style={th}>FT</th>
              <th style={th}>+/-</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.playerId} style={{ opacity: p.minutes === 0 ? 0.3 : 1 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <td style={{ ...td, textAlign: 'left', fontFamily: 'Roboto Condensed, sans-serif', fontSize: 13, color: '#8099bb', paddingLeft: 0, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.playerName}>
                  {p.playerName}
                  <span style={{ color: '#2a3a55', fontSize: 10, marginLeft: 4 }}>{p.position}</span>
                </td>
                <td style={td}>{p.minutes}</td>
                <td style={{ ...td, fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>{p.pts}</td>
                <td style={td}>{p.reb}</td>
                <td style={td}>{p.ast}</td>
                <td style={td}>{p.stl}</td>
                <td style={td}>{p.blk}</td>
                <td style={td}>{p.turnover}</td>
                <td style={td}>{p.fgm}/{p.fga}</td>
                <td style={td}>{p.fg3m}/{p.fg3a}</td>
                <td style={td}>{p.ftm}/{p.fta}</td>
                <td style={{ ...td, color: p.plusMinus > 0 ? '#4ade80' : p.plusMinus < 0 ? '#f87171' : '#2a3a55', fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>
                  {p.plusMinus > 0 ? '+' : ''}{p.plusMinus}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <td style={{ ...td, textAlign: 'left', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', color: '#4a6080', paddingLeft: 0 }}>TOTALS</td>
              <td style={td} />
              <td style={{ ...td, fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>{score}</td>
              <td style={td}>{totals.reb}</td>
              <td style={td}>{totals.ast}</td>
              <td style={td}>{totals.stl}</td>
              <td style={td}>{totals.blk}</td>
              <td style={td}>{totals.to}</td>
              <td style={td}>{totals.fgm}/{totals.fga}</td>
              <td style={td}>{totals.fg3m}/{totals.fg3a}</td>
              <td style={td}>{totals.ftm}/{totals.fta}</td>
              <td style={td} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
