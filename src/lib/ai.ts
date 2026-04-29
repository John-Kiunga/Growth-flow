import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateOutreachMessage(lead: any, type: string) {
  const prompt = `Write a short, direct human message to ${lead.name} from ${lead.company}.
  Context: Offering ${type} services.
  
  CRITICAL RULES:
  - NO AI NOISE: Avoid "I hope this finds you well", "I was impressed by", "I noticed your profile", "fellow professional".
  - ACT LIKE A HUMAN: Use simplified, casual but professional language. 
  - SHORT: Max 2 sentences. 
  - DIRECT: State the observation/value and ask a simple question.
  - TONE: Busy founder-to-founder. No fluff.
  - RETURN ONLY THE MESSAGE TEXT. No labels like "Message:" or quotation marks.
  - EXAMPLE STYLE: Hey ${lead.name}, saw ${lead.company}'s site. It's solid but noticed the mobile load is a bit sluggish—could probably fix that in a day. Open to a quick look?`;

  const fetchWithRetry = async (retries = 2, delay = 1000): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text.replace(/^["']|["']$/g, '').trim();
    } catch (error: any) {
      if (retries > 0 && (error?.message?.includes('429') || error?.message?.includes('503'))) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  return await fetchWithRetry();
}

export async function generateLinkedInComment(postContent: string, tone: string = 'Human') {
  const prompt = `Write a natural, authentic comment for this LinkedIn post. 
  
  Tone: ${tone}
  Post Content: "${postContent}"
  
  CRITICAL RULES:
  - NO AI NOISE: Avoid "Great post", "Insightful share", "Thank you for sharing", "I couldn't agree more".
  - NO CLICHES: Do not summarize the post or use generic business jargon.
  - ADD VALUE: Share a specific thought, ask a pointed question, or offer a unique perspective.
  - LANGUAGE: Use simplified, everyday language. 
  - LENGTH: 1-2 short sentences.
  - TONE FIDELITY: If tone is Witty, be actually funny. If Expert, be concise and data-backed.
  - RETURN ONLY THE COMMENT TEXT. No labels or surrounding quotes.`;

  const fetchWithRetry = async (retries = 2, delay = 1000): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      if (!response.text) throw new Error("Empty response from AI");
      return response.text.replace(/^["']|["']$/g, '').trim();
    } catch (error: any) {
      if (retries > 0 && (error?.message?.includes('429') || error?.message?.includes('503'))) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    console.error("Comment generation error:", error);
    throw error;
  }
}

export async function analyzePostForLeads(postContent: string) {
  const prompt = `Perform a high-level creative audit on this content. 
  Identify "Visual Debt" (outdated UI), "Technical Lag" (slow/unoptimized SEO), or "Brand Schism" (inconsistent messaging).
  
  RULES:
  1. REASON: Max 20 words. Be provocative and identify a specific creative gap. (e.g., "Generic brand presence masks true technical value in a competitive SaaS market.")
  2. SUGGESTED SERVICE: One specific service.
  3. OPPORTUNITY FOUND: True only if there's a clear B2B service gap.
  
  Return in JSON format.`;

  const fetchWithRetry = async (currentPrompt: string, retries = 3, delay = 2000): Promise<any> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: currentPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              opportunityFound: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              suggestedService: { type: Type.STRING }
            },
            required: ["opportunityFound", "reason", "confidence", "suggestedService"]
          }
        }
      });
      const cleaned = cleanJsonResponse(response.text);
      return JSON.parse(cleaned);
    } catch (error: any) {
      const isRetryable = error?.message?.includes('429') || 
                          error?.message?.includes('503') || 
                          error?.message?.includes('deadline') ||
                          error?.message?.includes('JSON');

      if (retries > 0 && isRetryable) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(currentPrompt, retries - 1, delay * 1.5);
      }
      throw error;
    }
  };

  try {
    // Basic pre-check: if it's just a URL, adjust the prompt's context slightly
    const isUrlOnly = postContent.trim().startsWith('http') && !postContent.trim().includes(' ');
    const finalPrompt = isUrlOnly 
      ? `A URL was provided: "${postContent}". Based on the URL slug keywords (like brand audit, perception gap, etc.), identify a likely visual or strategic gap. ${prompt}`
      : prompt;

    const analysis = await fetchWithRetry(finalPrompt);
    
    // If AI couldn't find anything but it's a URL, give a specific hint
    if (!analysis.opportunityFound && isUrlOnly) {
      analysis.reason = "I can see the link, but for a perfect creative audit, try pasting the actual post text!";
    }
    
    return analysis;
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      opportunityFound: false,
      reason: "Analysis timed out. Paste the full post text for a deeper creative audit.",
      offset: 0,
      suggestedService: "General Outreach"
    };
  }
}

export async function generateResponseStrategy(audit: any, content: string) {
  const prompt = `Based on this Creative Audit and the original Post Content, generate a multi-channel outreach strategy.

  Audit: ${JSON.stringify(audit)}
  Post: "${content}"

  RULES:
  1. STRATEGIC COMMENT: A public comment that adds value and subtly hints at your expertise. NO cliches like "Great post".
  2. PATTERN-INTERRUPT DM: A private message that addresses the "Visual Debt" or "Technical Lag" found in the audit. 
  3. EMAIL SUBJECT: A punchy, 3-word subject line for a cold email.

  TONE: Direct, human, non-salesy.
  
  Return in JSON format.`;

  const fetchWithRetry = async (retries = 2, delay = 1000): Promise<any> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strategicComment: { type: Type.STRING },
              directMessage: { type: Type.STRING },
              emailSubject: { type: Type.STRING }
            },
            required: ["strategicComment", "directMessage", "emailSubject"]
          }
        }
      });
      const cleaned = cleanJsonResponse(response.text);
      return JSON.parse(cleaned);
    } catch (error: any) {
      const isRetryable = error?.message?.includes('429') || 
                          error?.message?.includes('503') || 
                          error?.message?.includes('JSON');

      if (retries > 0 && isRetryable) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  return await fetchWithRetry();
}

export interface Prospect {
  name: string;
  company: string;
  website: string;
  industry: string;
  location: string;
  potential_need: string;
  linkedin_url: string;
  marketing_audit: string;
  confidence_score: number;
  strategic_rationale: string;
}

function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?|```/g, '').trim();
  
  // Find the first '[' or '{' and the last ']' or '}'
  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');
  const start = (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) ? firstBracket : firstBrace;
  
  const lastBracket = cleaned.lastIndexOf(']');
  const lastBrace = cleaned.lastIndexOf('}');
  const end = (lastBracket !== -1 && (lastBrace === -1 || lastBracket > lastBrace)) ? lastBracket : lastBrace;

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned;
}

export async function findProspects(niche: string, location: string): Promise<Prospect[]> {
  const prompt = `
    Find 10-12 REAL B2B prospects for an agency looking to sell creative services (Design, SEO, Maintenance).
    Use Google Search to find actual businesses in the specified niche and location.
    
    TARGETING RULES:
    1. Focus on REAL Startups (Series A/B), Seed-stage companies, and high-growth SMBs.
    2. Focus on REAL localized markets or niche players within the industry.
    3. AVOID massive corporations like Google, Meta, or Fortune 500 companies.
    4. Companies should have a clear, verifiable existence.

    Niche: ${niche}
    Location: ${location}

    For each prospect, provide:
    1. Company Name (Official)
    2. Website URL (Verified)
    3. Industry
    4. Location
    5. Primary contact/decision maker name (Real person if possible, or very realistic)
    6. A specific potential marketing/design need based on their current web presence.
    7. A "Marketing Audit" summary (Max 20 words identifying a glaring gap).
    8. A 0-100 confidence score based on "Creative Debt".
    9. A VERIFIED LinkedIn profile URL (must be a real, accessible URL like https://www.linkedin.com/in/username - ABSOLUTELY NO HALLUCINATIONS).
    10. A "Strategic Rationale": One sentence explaining the business upside of targeting them right now based on recent news or their specific market position.

    SEARCH INTENT: You are a high-performance sales scouter. You must return REAL companies and REAL people that actually exist in the world today.
    
    Return the results as a valid JSON array.
  `;

  const fetchWithRetry = async (retries = 3, delay = 2000): Promise<Prospect[]> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                website: { type: Type.STRING },
                industry: { type: Type.STRING },
                location: { type: Type.STRING },
                name: { type: Type.STRING },
                potential_need: { type: Type.STRING },
                marketing_audit: { type: Type.STRING },
                confidence_score: { type: Type.NUMBER },
                linkedin_url: { type: Type.STRING },
                strategic_rationale: { type: Type.STRING }
              },
              required: ["company", "website", "industry", "location", "name", "potential_need", "marketing_audit", "confidence_score", "linkedin_url", "strategic_rationale"]
            }
          }
        }
      });

      const cleanedText = cleanJsonResponse(response.text);
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        if (retries > 0) {
          console.warn("JSON Parse failed, retrying...", parseError);
          await new Promise(res => setTimeout(res, delay));
          return fetchWithRetry(retries - 1, delay * 1.5);
        }
        throw parseError;
      }
    } catch (error: any) {
      const isRetryable = error?.message?.includes('429') || 
                          error?.message?.includes('503') || 
                          error?.message?.includes('deadline') ||
                          error?.message?.includes('JSON') ||
                          error?.message?.includes('end of JSON');

      if (retries > 0 && isRetryable) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    console.error("Prospecting error final failure:", error);
    return [];
  }
}
