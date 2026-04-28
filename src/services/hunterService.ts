import toast from 'react-hot-toast';

export interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  first_name: string;
  last_name: string;
  position: string;
}

export async function searchEmails(domain: string): Promise<HunterEmail[]> {
  try {
    const res = await fetch(`/api/hunter/search?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();

    if (data.error) {
      if (data.error === 'Hunter.io API key not configured') {
        throw new Error('Hunter.io not configured. Please add VITE_HUNTER_API_KEY to settings.');
      }
      throw new Error(data.error);
    }

    return data.data.emails.map((e: any) => ({
      value: e.value,
      type: e.type,
      confidence: e.confidence,
      first_name: e.first_name,
      last_name: e.last_name,
      position: e.position
    }));
  } catch (error: any) {
    console.error('Hunter Search Error:', error);
    // Silent fail if not configured, or toast if it was an actual API error
    if (error.message.includes('not configured')) {
       // We'll return empty instead of toast here to avoid spamming on load
       return [];
    }
    toast.error(error.message || 'Email discovery failed');
    return [];
  }
}
