import { Lead } from './types.ts';

export async function enrichLead(website?: string): Promise<Partial<Lead>> {
  // Simulating an API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!website) {
    return {
      email: 'hello@company.com',
      industry: 'Unknown',
      company_size: '1-10',
    };
  }

  const industries = ['SaaS', 'Fintech', 'E-commerce', 'Agency', 'Direct-to-Consumer'];
  const sizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

  // Mock deterministic logic based on URL length or characters
  const industryIndex = website.length % industries.length;
  const sizeIndex = (website.charCodeAt(0) || 0) % sizes.length;

  return {
    email: `contact@${website.replace('https://', '').replace('www.', '')}`,
    industry: industries[industryIndex],
    company_size: sizes[sizeIndex],
  };
}
