import { Lead } from './types';

export function generateLeadAudit(lead: Partial<Lead>): string {
  const insights = [
    "Your website lacks a clear CTA and has inconsistent branding, which likely reduces conversions.",
    "The mobile experience feels slightly disconnected from the desktop version, leading to potential drop-offs.",
    "Your value proposition is strong, but the typography hierarchy could be improved for better readability.",
    "I noticed a few performance bottlenecks on the homepage that might be affecting your SEO rankings.",
    "The lack of social proof or case studies on the main landing page might be hindering user trust.",
  ];

  // Deterministic pick
  const index = (lead.name?.length || 0) % insights.length;
  return insights[index];
}
