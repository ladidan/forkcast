import recentDecisionsRaw from './recent-decisions.json';
import type { KeyDecision } from '../types/eip';

export interface RecentDecision {
  callType: 'acdc' | 'acde' | 'acdt';
  callNumber: string;
  /** ISO date string from the call's artifact directory, e.g. "2026-04-23". */
  date: string;
  decision: KeyDecision;
}

export const recentDecisions = (recentDecisionsRaw as { recent: RecentDecision[] }).recent;
