import { OutreachTemplate } from './types';

export const DEFAULT_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'warm',
    name: 'Warm Outreach',
    subject: 'Question about {{company}}',
    body: `Hi {{name}},

I've been following what you're doing at {{company}} and noticed something interesting.

{{audit}}

I've helped similar companies tighten up their branding and CTAs to improve conversion. Would you be open to a 5-minute chat next week?

Best,
[Your Name]`,
  },
  {
    id: 'cold',
    name: 'Intro / Audit',
    subject: 'Feedback on {{company}} website',
    body: `Hi {{name}},

I was looking at {{website}} today and noticed a quick win for your conversion rate:

{{audit}}

I specialize in helping {{industry}} startups like {{company}} scale their creative impact. 

Worth a quick chat?

Thanks,
[Your Name]`,
  },
  {
    id: 'followup',
    name: 'Quick Follow-up',
    subject: 'Re: Feedback on {{company}}',
    body: `Hey {{name}},

Just wanted to bump this to the top of your inbox. Did the feedback on {{company}}'s website make sense?

Happy to dive deeper if you're interested.

Cheers,
[Your Name]`,
  },
];
