export type LeadStatus = 'New' | 'Prospect' | 'Engaged' | 'Outreach' | 'Meeting' | 'Closed' | 'Lost';
export type OpportunityType = 'Design' | 'SEO' | 'Maintenance' | 'Graphic Design' | 'Marketing';

export interface Lead {
  id: string;
  name: string;
  company: string;
  linkedin_url?: string;
  website?: string;
  email?: string;
  industry?: string;
  company_size?: string;
  score: number;
  audit: string;
  status: LeadStatus;
  opportunity_type?: OpportunityType;
  owner_id?: string;
  created_at: any;
}

export interface LinkedInInteraction {
  id: string;
  lead_id: string;
  post_url?: string;
  post_content?: string;
  generated_comment?: string;
  sent: boolean;
  type: 'Comment' | 'DM';
  created_at: any;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface AppSettings {
  enrichment_api_key?: string;
  templates: OutreachTemplate[];
}
