import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useMetaTags } from '../hooks/useMetaTags';
import { getUpgradeById } from '../data/upgrades';
import { getUpgradeStatusColor } from '../utils/colors';
import { isPathActive, normalizePathname } from '../utils/path';

const upgrade = getUpgradeById('glamsterdam')!;

interface TabItem {
  path: string;
  label: string;
  /** Shorter label used at < sm widths so all tabs stay readable inline. */
  mobileLabel: string;
}

const tabs: TabItem[] = [
  { path: '/upgrade/glamsterdam', label: 'Overview', mobileLabel: 'Overview' },
  { path: '/upgrade/glamsterdam/stakeholders', label: 'Stakeholders', mobileLabel: 'Stakeholders' },
  { path: '/upgrade/glamsterdam/devnet-inclusion', label: 'Devnet Inclusion', mobileLabel: 'Devnets' },
  { path: '/upgrade/glamsterdam/client-priority', label: 'Client Priority', mobileLabel: 'Priority' },
  { path: '/upgrade/glamsterdam/test-complexity', label: 'Test Complexity', mobileLabel: 'Complexity' },
];

const GlamsterdamUpgradePage: React.FC = () => {
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);
  const [overflow, setOverflow] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  useMetaTags({
    title: 'Glamsterdam Upgrade - Forkcast',
    description: 'Glamsterdam network upgrade: overview, stakeholder impact, EIP candidates, client prioritization, and test complexity.',
    url: 'https://forkcast.org/upgrade/glamsterdam',
  });

  // useLayoutEffect avoids a visible scroll jump on first paint when the active tab starts off-screen.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const activeEl = activeTabRef.current;
    if (!scroller || !activeEl) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const fullyVisible =
      activeRect.left >= scrollerRect.left && activeRect.right <= scrollerRect.right;
    if (fullyVisible) return;

    const target =
      scroller.scrollLeft +
      (activeRect.left - scrollerRect.left) -
      (scrollerRect.width - activeRect.width) / 2;
    scroller.scrollTo({ left: target, behavior: 'auto' });
  }, [pathname]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const update = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const left = scroller.scrollLeft > 1;
      const right = scroller.scrollLeft < maxScroll - 1;
      setOverflow((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    };
    update();

    scroller.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/upgrades" className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 mb-6 inline-block text-sm font-medium">
            ← All Network Upgrades
          </Link>

          <div className="pb-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between lg:justify-start gap-3 mb-3">
                  <h1 className="text-3xl font-light text-slate-900 dark:text-slate-100 tracking-tight">
                    <span className="lg:hidden">Glamsterdam</span>
                    <span className="hidden lg:inline">{upgrade.name}</span>
                  </h1>
                  <span className={`lg:hidden px-3 py-1 text-xs font-medium rounded ${getUpgradeStatusColor(upgrade.status)}`}>
                    {upgrade.status}
                  </span>
                </div>
                <p className="text-base text-slate-600 dark:text-slate-300 mb-2 leading-relaxed max-w-2xl">{upgrade.description}</p>
                {upgrade.metaEipLink && (
                  <div className="mb-4">
                    <a
                      href={upgrade.metaEipLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 underline decoration-1 underline-offset-2 transition-colors"
                    >
                      View Meta EIP Discussion
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              <div className="hidden lg:block">
                <span className={`px-3 py-1 text-xs font-medium rounded ${getUpgradeStatusColor(upgrade.status)}`}>
                  {upgrade.status}
                </span>
              </div>
            </div>
          </div>

          {/* The tab bar's bottom border serves as the page-section divider, replacing the header's border-b. */}
          <div className="relative -mx-6 mt-4">
            <div
              ref={scrollerRef}
              className="overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 min-w-max">
                {tabs.map((tab) => {
                  // Overview is the parent path of every other tab, so it must match exactly
                  // or it would always look active. The other tabs use prefix matching.
                  const active =
                    tab.path === '/upgrade/glamsterdam'
                      ? pathname === tab.path
                      : isPathActive(pathname, tab.path);
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      ref={active ? activeTabRef : undefined}
                      className={`pb-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                        active
                          ? 'border-purple-600 dark:border-purple-400 text-purple-700 dark:text-purple-300'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <span className="sm:hidden">{tab.mobileLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent transition-opacity duration-150 ${
                overflow.left ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent transition-opacity duration-150 ${
                overflow.right ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>

        {/* Tab content */}
        <Outlet />
      </div>
    </div>
  );
};

export default GlamsterdamUpgradePage;
