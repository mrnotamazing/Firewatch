import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Camera, Lock, Menu, X } from 'lucide-react';
import LogoMark from './LogoMark';

// "Report Hazard" isn't repeated here — the standalone CTA button already covers it,
// and duplicating it as a nav link was making the bar feel crowded.
const navItems = [
  { to: '/heatmap', label: 'Heatmap' },
  { to: '/accountability', label: 'Transparency' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/quiz', label: "While You're At It" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-ink bg-paper">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 sm:gap-2.5" onClick={() => setMenuOpen(false)}>
          <LogoMark size={26} />
          <span className="flex flex-col items-end justify-center">
            <span className="font-display text-[21px] font-bold uppercase leading-none tracking-tight text-ink sm:text-[26px]">
              FireWatch
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-ink/45 sm:inline">Bengaluru</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `border-b-2 py-1 font-display text-[15px] font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? 'border-ember text-ink' : 'border-transparent text-ink/45 hover:border-line hover:text-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/report"
          className="hidden items-center gap-1.5 bg-ember px-4 py-2 font-display text-[14px] font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-ember-2 lg:flex"
        >
          <Camera size={14} strokeWidth={2.5} />
          Report Hazard
        </NavLink>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink/20 text-ink lg:hidden"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="animate-fade-in-down border-t border-ink/10 bg-paper lg:hidden">
          <NavLink
            to="/report"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 bg-ember px-4 py-3 font-display text-[14px] font-semibold uppercase tracking-wide text-paper"
          >
            <Camera size={15} strokeWidth={2.5} />
            Report Hazard
          </NavLink>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block border-t border-ink/10 px-4 py-3 font-display text-[14px] font-semibold uppercase tracking-wide ${
                  isActive ? 'bg-paper-2 text-ink' : 'text-ink/60'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-1.5 border-t border-ink/10 px-4 py-3 font-mono text-[12px] uppercase tracking-wide text-ink/45"
          >
            <Lock size={11} /> Officer Login
          </NavLink>
        </nav>
      )}
    </header>
  );
}
