import { useEffect } from 'react';
import type { GameResult, PlayerGameStats } from '../lib/types';
import { espnLogo } from '../lib/theme';

interface Props {
  game: GameResult;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId?: number;
  awayTeamId?: number;
  onClose: () => void;
}

export function GameModal({ game, homeTeamName, awayTeamName, homeTeamId, awayTeamId, onClose }: Props) {
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
        background: 'var(--c-overlay)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div style={{
        background: 'var(--c-modal-bg)',
        border: '1px solid var(--c-border-md)',
        borderRadius: 16,
        width: '100%', maxWidth: 920, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* ── TV SCOREBOARD HEADER ── */}
        <div style={{
          background: 'var(--c-game-header)',
          borderBottom: '1px solid var(--c-border)',
          padding: '20px 32px 18px',
        }}>
          {/* Game label */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.25em', color: 'var(--c-text4)', textTransform: 'uppercase' }}>
              Game {game.gameNumber} · Final
            </span>
          </div>

          {/* Score row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>

            {/* Away */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 28 }}>
              {awayTeamId && (
                <img
                  src={espnLogo(awayTeamId)} alt={game.awayTeam}
                  width={56} height={56}
                  style={{ objectFit: 'contain', marginBottom: 6, opacity: awayWon ? 1 : 0.35 }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: awayWon ? 'var(--c-text2)' : 'var(--c-text4)', marginBottom: 2 }}>
                {game.awayTeam}
              </div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 72, lineHeight: 1, letterSpacing: '0.02em', color: awayWon ? 'var(--c-text1)' : 'var(--c-score-off)', textShadow: awayWon ? '0 0 20px rgba(255,255,255,0.1)' : 'none' }}>
                {game.awayScore}
              </div>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)', marginTop: 2 }}>
                {awayTeamName.split(' ').slice(1).join(' ')}
              </div>
            </div>

            {/* Separator */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 4 }}>
              <div style={{ width: 1, height: 56, background: 'var(--c-sep)' }} />
              <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 12, color: 'var(--c-text4)', letterSpacing: '0.1em' }}>@</span>
              <div style={{ width: 1, height: 56, background: 'var(--c-sep)' }} />
            </div>

            {/* Home */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 28 }}>
              {homeTeamId && (
                <img
                  src={espnLogo(homeTeamId)} alt={game.homeTeam}
                  width={56} height={56}
                  style={{ objectFit: 'contain', marginBottom: 6, opacity: !awayWon ? 1 : 0.35 }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: !awayWon ? 'var(--c-text2)' : 'var(--c-text4)', marginBottom: 2 }}>
                {game.homeTeam}
              </div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 72, lineHeight: 1, letterSpacing: '0.02em', color: !awayWon ? 'var(--c-text1)' : 'var(--c-score-off)', textShadow: !awayWon ? '0 0 20px rgba(255,255,255,0.1)' : 'none' }}>
                {game.homeScore}
              </div>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)', marginTop: 2 }}>
                {homeTeamName.split(' ').slice(1).join(' ')}
              </div>
            </div>
          </div>

          {/* Winner badge */}
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <span style={{
              display: 'inline-block',
              fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
              background: 'var(--c-win-bg)', border: '1px solid var(--c-win-border)',
              color: '#FFB81C', borderRadius: 6, padding: '3px 12px',
            }}>
              {game.winner} wins
            </span>
          </div>
        </div>

        {/* ── BOX SCORES ── */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--c-border-sm)' }}>
            <BoxScoreTable players={game.awayBoxScore} teamName={awayTeamName} abbr={game.awayTeam} score={game.awayScore} isWinner={awayWon} logoId={awayTeamId} />
            <BoxScoreTable players={game.homeBoxScore} teamName={homeTeamName} abbr={game.homeTeam} score={game.homeScore} isWinner={!awayWon} logoId={homeTeamId} right />
          </div>
        </div>
      </div>

      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'var(--c-surface-active)', border: '1px solid var(--c-border-md)',
        borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
        color: 'var(--c-text3)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--c-text3)'; }}
      >✕</button>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  );
}

function BoxScoreTable({ players, teamName, abbr, score, isWinner, logoId, right = false }: {
  players: PlayerGameStats[]; teamName: string; abbr: string;
  score: number; isWinner: boolean; logoId?: number; right?: boolean;
}) {
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
    letterSpacing: '0.12em', color: 'var(--c-text4)', textTransform: 'uppercase',
    padding: '6px 5px', textAlign: 'right', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    fontFamily: '"Bebas Neue", sans-serif', fontSize: 14,
    color: 'var(--c-text3)', padding: '5px 5px', textAlign: 'right',
    borderBottom: '1px solid var(--c-border-sm)',
    letterSpacing: '0.03em',
  };

  return (
    <div style={{ borderRight: right ? 'none' : '1px solid var(--c-border)', padding: '16px 16px' }}>
      {/* Team header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoId && (
            <img
              src={espnLogo(logoId)} alt={abbr} width={32} height={32}
              style={{ objectFit: 'contain', opacity: isWinner ? 1 : 0.4 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: isWinner ? 'var(--c-text1)' : 'var(--c-text3)' }}>
              {abbr}
            </div>
            <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)' }}>{teamName}</div>
          </div>
        </div>
        {isWinner && (
          <div style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em',
            background: 'var(--c-win-bg)', border: '1px solid var(--c-win-border)',
            color: '#FFB81C', borderRadius: 6, padding: '3px 10px',
          }}>WIN</div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
              <th style={{ ...th, textAlign: 'left', paddingLeft: 0 }}>PLAYER</th>
              <th style={th}>MIN</th>
              <th style={{ ...th, color: 'var(--c-text2)' }}>PTS</th>
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
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--c-row-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <td style={{ ...td, textAlign: 'left', fontFamily: 'Roboto Condensed, sans-serif', fontSize: 13, color: 'var(--c-text2)', paddingLeft: 0, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.playerName}>
                  {p.playerName}
                  <span style={{ color: 'var(--c-text4)', fontSize: 10, marginLeft: 4 }}>{p.position}</span>
                </td>
                <td style={td}>{p.minutes}</td>
                <td style={{ ...td, fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--c-text1)' }}>{p.pts}</td>
                <td style={td}>{p.reb}</td>
                <td style={td}>{p.ast}</td>
                <td style={td}>{p.stl}</td>
                <td style={td}>{p.blk}</td>
                <td style={td}>{p.turnover}</td>
                <td style={td}>{p.fgm}/{p.fga}</td>
                <td style={td}>{p.fg3m}/{p.fg3a}</td>
                <td style={td}>{p.ftm}/{p.fta}</td>
                <td style={{ ...td, color: p.plusMinus > 0 ? 'var(--c-plus)' : p.plusMinus < 0 ? 'var(--c-minus)' : 'var(--c-text4)', fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>
                  {p.plusMinus > 0 ? '+' : ''}{p.plusMinus}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid var(--c-tfoot-border)' }}>
              <td style={{ ...td, textAlign: 'left', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', color: 'var(--c-text3)', paddingLeft: 0 }}>TOTALS</td>
              <td style={td} />
              <td style={{ ...td, fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--c-text1)' }}>{score}</td>
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
