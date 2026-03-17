import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';

const DARK = `
  --c-bg:#080E1A; --c-surface:#0F1623; --c-surface2:#0C1420; --c-surface3:#111827;
  --c-surface-active:#1a2640; --c-header-bg:#0A1020; --c-header-border:rgba(255,255,255,0.07);
  --c-modal-bg:#0C1420; --c-game-header:#111827; --c-champ-bg:linear-gradient(90deg,#0A0C08 0%,#1a1500 30%,#221900 50%,#1a1500 70%,#0A0C08 100%);
  --c-border:rgba(255,255,255,0.06); --c-border-md:rgba(255,255,255,0.1); --c-border-sm:rgba(255,255,255,0.04);
  --c-text1:#e8f0ff; --c-text2:#8099bb; --c-text3:#4a6080; --c-text4:#2a3a55; --c-text5:#253545;
  --c-text-off:#2e4060; --c-score-off:#1a2535; --c-stat-dim:#3a5070;
  --c-row-hover:rgba(255,255,255,0.03); --c-overlay:rgba(0,0,0,0.85);
  --c-win-bg:rgba(255,184,28,0.1); --c-win-border:rgba(255,184,28,0.3);
  --c-pill-off:rgba(255,255,255,0.05); --c-pill-off-text:#3a4f6a;
  --c-sep:rgba(255,255,255,0.08); --c-tfoot-border:rgba(255,255,255,0.08);
  --c-plus:#4ade80; --c-minus:#f87171;
  --c-scrollbar:#1E2A3D; --c-thumb:#2a3a55;
`;

const LIGHT = `
  --c-bg:#eef1f7; --c-surface:#ffffff; --c-surface2:#f8f9fc; --c-surface3:#f3f4f6;
  --c-surface-active:#dbeafe; --c-header-bg:#ffffff; --c-header-border:rgba(0,0,0,0.08);
  --c-modal-bg:#ffffff; --c-game-header:#f3f4f6; --c-champ-bg:linear-gradient(90deg,#fefce8 0%,#fffbeb 30%,#fffdf5 50%,#fffbeb 70%,#fefce8 100%);
  --c-border:rgba(0,0,0,0.07); --c-border-md:rgba(0,0,0,0.12); --c-border-sm:rgba(0,0,0,0.04);
  --c-text1:#111827; --c-text2:#374151; --c-text3:#6b7280; --c-text4:#9ca3af; --c-text5:#d1d5db;
  --c-text-off:#9ca3af; --c-score-off:#d1d5db; --c-stat-dim:#9ca3af;
  --c-row-hover:rgba(0,0,0,0.025); --c-overlay:rgba(0,0,0,0.6);
  --c-win-bg:rgba(217,119,6,0.08); --c-win-border:rgba(217,119,6,0.25);
  --c-pill-off:rgba(0,0,0,0.05); --c-pill-off-text:#6b7280;
  --c-sep:rgba(0,0,0,0.07); --c-tfoot-border:rgba(0,0,0,0.08);
  --c-plus:#16a34a; --c-minus:#dc2626;
  --c-scrollbar:#e5e7eb; --c-thumb:#9ca3af;
`;

const Ctx = createContext<{ mode: ThemeMode; toggle: () => void }>({ mode: 'dark', toggle() {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    let el = document.getElementById('nba-theme') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'nba-theme';
      document.head.appendChild(el);
    }
    el.textContent = `:root{${mode === 'dark' ? DARK : LIGHT}}`;
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <Ctx.Provider value={{ mode, toggle: () => setMode(m => m === 'dark' ? 'light' : 'dark') }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);

/** ESPN CDN logo — works for all current + historical franchises */
export const espnLogo = (id: number) =>
  `https://a.espncdn.com/i/teamlogos/nba/500/${id}.png`;
