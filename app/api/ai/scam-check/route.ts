import { NextResponse } from 'next/server';
import { z } from 'zod';
import { callOpenRouter } from '@/lib/openrouter';

const requestSchema = z.object({
  claimText: z.string().min(1).max(5000),
});

const responseSchema = z.object({
  claimText: z.string(),
  verdict: z.enum(['likely_credible', 'unverifiable', 'likely_misleading', 'likely_scam']),
  explanation: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional(),
    })
  ),
});

const SYSTEM_PROMPT = `You are the AI financial-literacy engine for financial-doctor.
You provide educational financial analysis and explanations.
You are not a registered investment adviser.
Do not provide personalized buy, sell, hold, or investment instructions.
Do not tell a user which security they should purchase or sell.
Do not guarantee returns or future market performance.
Clearly distinguish facts, retrieved information, assumptions, calculations, and illustrative scenarios.
Never fabricate sources, URLs, statistics, prices, companies, regulations, or financial claims.
Use retrieved sources for factual claims.
If reliable evidence is unavailable, state that the information is unverifiable.
When discussing decisions, provide educational context, trade-offs, risks, and questions that could be discussed with a registered financial adviser.

For this specific task: Analyze the provided financial claim to determine if it is a scam, misleading, credible, or unverifiable. Return a JSON object matching this schema:
{
  "claimText": "string",
  "verdict": "likely_credible" | "unverifiable" | "likely_misleading" | "likely_scam",
  "explanation": "string",
  "sources": [{ "title": "string", "url": "string", "snippet": "string" }]
}
IMPORTANT: If you have no sources, the verdict MUST be "unverifiable".`;

// Mock retrieval for hackathon
async function retrieveSources(query: string) {
  // In a real implementation, this would call a search API or vector database.
  // For now, we return empty to force 'unverifiable' on unknown claims,
  // or a mock source for a known claim test case.
  if (query.toLowerCase().includes('guaranteed 50% return')) {
    return [
      {
        title: 'SEBI Guidelines on Investment Guarantees',
        url: 'https://www.sebi.gov.in/mock-guidelines',
        snippet: 'No registered entity can guarantee returns in the stock market.',
      },
    ];
  }
  return [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = requestSchema.parse(body);

    const sources = await retrieveSources(parsedBody.claimText);

    let prompt = `Analyze this claim: "${parsedBody.claimText}"\n\n`;
    if (sources.length > 0) {
      prompt += `Use these sources:\n${JSON.stringify(sources, null, 2)}`;
    } else {
      prompt += `No external sources available.`;
    }

    const aiResult = await callOpenRouter(SYSTEM_PROMPT, prompt, responseSchema);

    // Enforce logic: if no sources, verdict must be unverifiable (unless the AI already did this, but enforce it)
    if (aiResult.sources.length === 0 && aiResult.verdict !== 'unverifiable') {
      aiResult.verdict = 'unverifiable';
      aiResult.explanation = 'No reliable sources could be found to verify this claim. Proceed with caution.';
    }

    // TODO: Write to AI audit log (Mocked for now)
    console.log('[AUDIT LOG] Scam check:', {
      prompt: parsedBody.claimText,
      verdict: aiResult.verdict,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ result: aiResult });
  } catch (error) {
    console.error('Scam check error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
