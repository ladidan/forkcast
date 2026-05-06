import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import ThemeToggle from './ThemeToggle';
import { isPathActive, normalizePathname } from '../../utils/path';
import { useCallSearch } from '../../contexts/CallSearchContext';

const NavLinkItem: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => (
  <Link
    to={to}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'text-purple-700 dark:text-purple-300'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
    }`}
  >
    {label}
  </Link>
);

interface NavItem {
  to: string;
  label: string;
  /** When set, treats any descendant path as active (e.g. /upgrades matches /upgrade/*). */
  alsoActiveOn?: string[];
}

const navItems: NavItem[] = [
  { to: '/upgrades', label: 'Upgrades', alsoActiveOn: ['/upgrade/'] },
  { to: '/eips', label: 'EIPs' },
  { to: '/calls', label: 'Calls' },
  { to: '/decisions', label: 'Decisions' },
  { to: '/planner', label: 'Planner' },
  { to: '/devnets', label: 'Devnets' },
];

const isItemActive = (pathname: string, item: NavItem): boolean => {
  if (isPathActive(pathname, item.to)) return true;
  return (item.alsoActiveOn ?? []).some((prefix) =>
    prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix
  );
};

const SiteNav: React.FC = () => {
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openSearch } = useCallSearch();
  // Call detail pages use a much wider canvas (LAYOUT_DEFAULT in CallPage); widen the
  // nav to match so the logo / nav / contextual actions align with the page below.
  const onCallDetail = openSearch !== null;
  const headerPadding = onCallDetail ? 'px-4 sm:px-6 xl:px-8 2xl:px-10' : 'px-6';
  const navMaxWidth = onCallDetail ? 'max-w-[1800px]' : 'max-w-4xl';

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className={`sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 ${headerPadding}`}>
      <nav className={`relative ${navMaxWidth} mx-auto h-14 flex items-center justify-between gap-4`}>
        <Logo size="sm" />

        {/* Absolutely centered relative to the nav so widths of logo / right-cluster don't drift it. */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navItems.map((item) => (
            <NavLinkItem
              key={item.to}
              to={item.to}
              label={item.label}
              active={isItemActive(pathname, item)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {openSearch && (
            <>
              <Link
                to="/calls"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                ← All Calls
              </Link>
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search this call"
                title="Search this call"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className={`md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 -mx-6 px-6`}>
          <div className={`${navMaxWidth} mx-auto py-3`}>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-1 py-2 text-sm ${
                  isItemActive(pathname, item)
                    ? 'text-purple-700 dark:text-purple-300 font-medium'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteNav;
