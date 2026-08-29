import { NextResponse } from 'next/server';
import { z } from 'zod';
import { callOpenRouter } from '@/lib/openrouter';

const requestSchema = z.object({
  userId: z.string(),
  assumptions: z.record(z.string(), z.number()),
  years: z.number().positive().max(100),
});

const responseSchema = z.object({
  explanation: z.string(),
});

const SYSTEM_PROMPT = `You are the AI financial-literacy engine for financial-doctor.
You provide educational financial analysis and explanations.
You are not a registered investment adviser.
Do not provide personalized buy, sell, hold, or investment instructions.
Do not tell a user which security they should purchase or sell.
Do not guarantee returns or future market performance.
Clearly distinguish facts, retrieved information, assumptions, calculations, and illustrative scenarios.
Never fabricate sources, URLs, statistics, prices, companies, regulations, or financial claims.
When discussing decisions, provide educational context, trade-offs, risks, and questions that could be discussed with a registered financial adviser.

For this task: Given the financial simulation inputs and the deterministic result computed by the system, explain the result to the user.
Return a JSON object: { "explanation": "string" }
The explanation must explicitly state that the simulation is illustrative, not guaranteed, and not personalized investment advice.
Do not recalculate the math. Use the provided projected net worth.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = requestSchema.parse(body);

    const { userId, assumptions, years } = parsedBody;

    // Deterministic arithmetic logic
    const baselineNetWorth = (assumptions as Record<string, number>).baselineNetWorth || 0;
    const monthlyContribution = (assumptions as Record<string, number>).monthlyContribution || 0;
    const assumedAnnualGrowthRate = (assumptions as Record<string, number>).annualGrowthRate || 0.05; // default 5%

    // Basic future value calculation
    let projectedNetWorth = baselineNetWorth;
    for (let i = 0; i < years; i++) {
      projectedNetWorth = projectedNetWorth * (1 + assumedAnnualGrowthRate) + (monthlyContribution * 12);
    }
    
    // Check for NaN or Infinity
    if (!Number.isFinite(projectedNetWorth)) {
      throw new Error("Invalid calculation result");
    }

    const prompt = `Simulation inputs:
Baseline Net Worth: ${baselineNetWorth}
Monthly Contribution: ${monthlyContribution}
Annual Growth Rate: ${assumedAnnualGrowthRate * 100}%
Years: ${years}

Computed Projected Net Worth: ${projectedNetWorth.toFixed(2)}

Please explain this illustrative scenario to the user.`;

    const aiResult = await callOpenRouter<{ explanation: string }>(SYSTEM_PROMPT, prompt, responseSchema);

    const scenario = {
      userId,
      baselineNetWorth,
      assumptions,
      projectedNetWorth,
      projectionYears: years,
      explanation: aiResult.explanation, // Actually the contract doesn't explicitly have explanation inside scenario or outside, let's assume it's part of the scenario or AI result.
      // Wait, CONTRACTS.md has SimulationScenario which only has:
      // userId, baselineNetWorth, assumptions, projectedNetWorth, projectionYears.
      // But we need the explanation somewhere! I will just add explanation to the response or to the scenario.
    };

    // TODO: Write to AI audit log
    console.log('[AUDIT LOG] Simulation:', {
      userId,
      assumptions,
      years,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      scenario: {
        ...scenario,
        explanation: aiResult.explanation
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
