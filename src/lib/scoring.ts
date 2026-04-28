import { Lead } from './types';

export function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 10; // Base score

  if (lead.website) score += 10;
  if (lead.email && lead.email !== 'unknown') score += 20;

  // SMB bonus
  if (lead.company_size === '1-10' || lead.company_size === '11-50') {
    score += 15;
  }

  // Simulate missing branding signals
  if (lead.website && (lead.website.length % 2 === 0)) {
    score += 20;
  }

  return score;
}

export function getScoreColor(score: number): string {
  if (score >= 60) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
}
