
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_INSTRUCTION = `
You are a highly specialized Tax Optimization Expert for Finverse.
Your goal is to analyze the user's financial profile and generate a personalized "Tax Action Plan" to minimize their tax liability legally.

JURISDICTION: India (FY 2024-25 / AY 2025-26)

YOUR KNOWLEDGE BASE:
1. **Section 80C**: Max ₹1.5L (PPF, ELSS, LIC, EPF).
2. **Section 80D**: Health Insurance (Self: ₹25k/₹50k, Parents: ₹25k/₹50k).
3. **Section 80CCD(1B)**: NPS (Additional ₹50k).
4. **LTCG/STCG**: Harvest losses to offset gains (Grandfathering rules apply).
5. **HRA**: Exemptions based on Rent Paid vs Salary.
6. **New vs Old Regime**: Compare and suggest the better one.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching the following structure:
{
  "totalPotentialSavings": number,
  "steps": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "potentialSaving": number,
      "type": "investment" | "filing" | "harvesting",
      "impactLevel": "high" | "medium" | "low",
      "actionUrl": "string"
    }
  ]
}

RULES:
1. Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.
2. Be realistic with numbers based on the user's income.
3. If data is missing, assume reasonable defaults for a tech professional (e.g., high tax bracket).
4. Generate at least 3 actionable steps.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { context } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI Configuration Error: API Key is missing." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const contextString = `
[USER FINANCIAL PROFILE]
- Annual Income: ${context.annualIncome || "Unknown (Assume ₹20,00,000)"}
- Existing Investments: ${JSON.stringify(context.investments || [])}
- Insurance: ${JSON.stringify(context.insurance || [])}
- Current Tax Regime: ${context.regime || "New"}
- Age: ${context.age || 30}
- Rent Paid: ${context.rentPaid || 0}
[END PROFILE]

Task: Analyze this profile and generate a JSON Tax Action Plan.
`;

    const result = await model.generateContent(contextString);
    const responseText = result.response.text();
    
    // Clean the response if it contains markdown code blocks
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const plan = JSON.parse(cleanedResponse);

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Tax AI Error:", error);

    // Rate Limit / Fallback
    if (error.message?.includes("429") || error.status === 429) {
      return NextResponse.json({
        totalPotentialSavings: 45000,
        steps: [
          {
            id: "fallback-1",
            title: "Maximize Section 80C (Simulated)",
            description: "Invest ₹1.5L in PPF/ELSS to reduce taxable income. (AI Rate Limit Reached)",
            potentialSaving: 30000,
            type: "investment",
            impactLevel: "high",
            actionUrl: "/invest",
            isCompleted: false
          }
        ]
      });
    }

    return NextResponse.json(
      { error: "Failed to generate tax plan." },
      { status: 500 }
    );
  }
}
