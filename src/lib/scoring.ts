import { Lead } from './types';

export function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 20; // Re-adjusted base score

  // Basic Contactability (Real-world priority)
  if (lead.email && lead.email !== 'unknown') score += 25;
  if (lead.website) score += 10;
  
  // Industry-Specific Weights (Simulating "Agency Sweet Spot")
  const highGrowthIndustries = ['technology', 'software', 'fintech', 'healthtech', 'e-commerce', 'marketing'];
  const legacyIndustries = ['construction', 'mfg', 'manufacturing', 'logistics', 'legal'];
  
  const industry = (lead.industry || '').toLowerCase();
  if (highGrowthIndustries.some(h => industry.includes(h))) {
    score += 20; // High growth companies prioritize branding
  } else if (legacyIndustries.some(l => industry.includes(l))) {
    score += 15; // Legacy industries have more "Creative Debt"
  }

  // SMB / Mid-Market Sweet Spot (11-200 is best for creative agencies)
  if (lead.company_size === '11-50' || lead.company_size === '51-200') {
    score += 20;
  } else if (lead.company_size === '1-10') {
    score += 10; // Often too small/budget-constrained
  }

  // Simulated "Social Presence" Signal (Deterministic simulation based on name/length)
  const nameLength = (lead.name || '').length;
  if (nameLength > 5 && nameLength < 15) {
    score += 10; // Simulating a robust but not overly corporate presence
  }

  // Creative "Vulnerability" Urgency (Analyzing the audit text)
  const auditText = (lead.audit || '').toLowerCase();
  const urgencyKeywords = ['broken', 'missing', 'slow', 'poor', 'outdated', 'no mobile', 'security', 'error', 'fails'];
  const highValueKeywords = ['scaling', 'growth', 'hiring', 'expansion', 'new market', 'funding'];

  if (urgencyKeywords.some(k => auditText.includes(k))) {
    score += 15; // Higher priority if something is "broken"
  }
  
  if (highValueKeywords.some(k => auditText.includes(k))) {
    score += 10; // Higher value if they are growing
  }

  // Cap at 100
  return Math.min(score, 100);
}

export function getScoreColor(score: number): string {
  if (score >= 60) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
}
