import { GoogleGenAI, Type } from '@google/genai';
import { ALL_IMPACT_TAGS, ImpactTag } from '../src/types';

// Initialize Gemini client with proper user agent
function getGenAI(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface AISummaryResult {
  summary: string;
  impactTags: string[];
  applicableEntities: string[];
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  keyActionItems: string[];
}

/**
 * Summarize and tag Indian regulatory circulars into plain-language briefs
 */
export async function summarizeRegulatoryNotification(params: {
  regulator: string;
  title: string;
  refNumber?: string;
  rawText: string;
}): Promise<AISummaryResult> {
  const allowedTagsStr = ALL_IMPACT_TAGS.join(', ');
  const fallbackResult: AISummaryResult = {
    summary: `${params.regulator} issued official circular "${params.title}". Regulated entities must review the mandated operational changes and compliance requirements.`,
    impactTags: ['other'],
    applicableEntities: ['Regulated Entities', 'Compliance Officers'],
    urgency: 'MEDIUM',
    keyActionItems: [
      'Review circular provisions with compliance team.',
      'Assess impact on existing operational workflows and reporting.'
    ],
  };

  try {
    const ai = getGenAI();
    const prompt = `You are an elite Indian regulatory compliance intelligence engine (acting for Senior Chartered Accountants, SEBI Registered Investment Advisers, Chief Compliance Officers, and Fintech Legal Counsels).
Analyze the following official Indian regulatory notification from ${params.regulator}:

TITLE: ${params.title}
REFERENCE NO: ${params.refNumber || 'N/A'}
OFFICIAL / RAW TEXT:
${params.rawText}

YOUR TASK:
1. Provide a crisp, 2-3 sentence plain-language executive summary explaining WHAT changed, WHO is affected, and WHY it matters.
2. Select 1 to 3 relevant impact tags ONLY from this allowed list: [${allowedTagsStr}].
3. Identify 2 to 4 key entities/categories directly impacted (e.g. "RIAs & RAs", "Scheduled Commercial Banks", "Payment Aggregators", "Listed Companies", "Tax Deductors").
4. Determine compliance urgency (HIGH, MEDIUM, or LOW) based on penalties, statutory deadlines, or market impact.
5. Provide 2 to 3 concise, bulleted key actionable compliance steps for a compliance team.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are RegIntel, an expert Indian regulatory analyst summarizing notifications from SEBI, RBI, MCA, CBDT, and CBIC with precision, brevity, and zero fluff.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'A 2-3 sentence plain-language executive brief of the circular.',
            },
            impactTags: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: `1-3 tags from allowed list: ${allowedTagsStr}`,
            },
            applicableEntities: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Entities impacted by this circular',
            },
            urgency: {
              type: Type.STRING,
              description: 'HIGH, MEDIUM, or LOW urgency',
            },
            keyActionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: '2-3 concrete actionable compliance steps',
            },
          },
          required: ['summary', 'impactTags', 'applicableEntities', 'urgency', 'keyActionItems'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return fallbackResult;

    const parsed = JSON.parse(text);

    // Validate and clean impact tags to ensure they conform to valid tags
    const cleanedTags = Array.isArray(parsed.impactTags)
      ? parsed.impactTags.map((t: string) => {
          const match = ALL_IMPACT_TAGS.find(
            (at) => at.toLowerCase() === t.toLowerCase() || t.toLowerCase().includes(at.toLowerCase())
          );
          return match || t;
        })
      : ['other'];

    return {
      summary: parsed.summary || fallbackResult.summary,
      impactTags: cleanedTags.length > 0 ? cleanedTags : ['other'],
      applicableEntities: parsed.applicableEntities || fallbackResult.applicableEntities,
      urgency: ['HIGH', 'MEDIUM', 'LOW'].includes(parsed.urgency?.toUpperCase())
        ? parsed.urgency.toUpperCase()
        : 'MEDIUM',
      keyActionItems: parsed.keyActionItems || fallbackResult.keyActionItems,
    };
  } catch (error) {
    console.error('Error generating Gemini summary for circular:', error);
    return fallbackResult;
  }
}

/**
 * Interactive Compliance Q&A on a specific regulatory circular
 */
export async function askComplianceAssistant(params: {
  circularTitle: string;
  regulator: string;
  refNumber?: string;
  rawText: string;
  question: string;
}): Promise<string> {
  try {
    const ai = getGenAI();
    const prompt = `You are RegIntel Assistant, a legal and compliance expert specializing in Indian financial regulations (SEBI, RBI, MCA, CBDT, CBIC).

CIRCULAR INFORMATION:
- Regulator: ${params.regulator}
- Title: ${params.circularTitle}
- Reference: ${params.refNumber || 'N/A'}
- Full Text / Summary Excerpt:
${params.rawText}

USER COMPLIANCE QUESTION:
"${params.question}"

Provide a direct, authoritative, structured, and legally grounded answer for an Indian compliance professional. Cite specific clauses or timelines where mentioned. Avoid unnecessary disclaimers. Keep formatting clean with concise markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert Indian regulatory counsel providing direct, structured, practical compliance guidance.',
      },
    });

    return response.text || 'Unable to generate compliance guidance at this moment.';
  } catch (error: any) {
    console.error('Error in askComplianceAssistant:', error);
    return `AI Assistant Error: ${error?.message || 'Failed to process compliance query.'}`;
  }
}
