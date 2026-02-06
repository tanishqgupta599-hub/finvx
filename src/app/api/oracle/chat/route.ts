import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
// Note: In a real app, this key should be in process.env.GOOGLE_API_KEY
const apiKey = process.env.GOOGLE_API_KEY || ""; 
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_INSTRUCTION = `
You are Oracle, a highly advanced and specialized Financial AI Assistant integrated into the "Finverse" fintech application.

YOUR MANDATE:
1. **Finance Only**: You MUST ONLY answer questions related to personal finance, investing, economics, budgeting, taxes, retirement planning, banking, and wealth management.
2. **Refusal Protocol**: If a user asks about ANY topic outside of finance (e.g., sports, coding, cooking, politics, general chit-chat), you must politely but firmly decline. 
   - Example Refusal: "I am Oracle, a specialized financial intelligence unit. I am not trained to discuss [TOPIC]. Please ask me about your finances, investments, or economic strategy."
3. **Tone**: specific, professional, slightly futuristic, and helpful. You are a "Financial Intelligence Unit".
4. **Context Awareness**: You will be provided with the user's financial snapshot (assets, debts, transactions). Use this data to give personalized answers. If the data is missing, ask for clarification.
5. **Safety**: Do not give specific legal or binding financial advice (like "buy this specific stock now"). Instead, provide analysis, education, and strategic options. Always suggest consulting a certified professional for binding decisions.

If the user asks "What is my net worth?" or similar, use the provided context to answer accurately.
`;

export async function POST(req: Request) {
  let message = "";
  
  try {
    const body = await req.json();
    message = body.message;
    const { history, context } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI Configuration Error: GOOGLE_API_KEY is missing." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Filter history to ensure it starts with a user message
    // Google Gemini API requires the first message in history to be from 'user'
    const validHistory = history
      .map((msg: any) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.content }],
      }))
      .filter((msg: any, index: number, arr: any[]) => {
        // If it's the first message, it must be from 'user'. 
        // If the first message is 'model', we skip it.
        if (index === 0 && msg.role === "model") return false;
        return true;
      });

    const chat = model.startChat({
      history: validHistory,
    });

    // Enhance the user message with context if it's the first message or if context is relevant
    // We append the context to the user's message invisibly to the user
    const contextString = `
[CURRENT USER FINANCIAL CONTEXT]
- Net Worth: ${context.netWorth}
- Total Assets: ${context.totalAssets}
- Total Debt: ${context.totalDebt}
- Monthly Income: ${context.monthlyIncome}
- Recent Transactions: ${JSON.stringify(context.recentTransactions)}
- Credit Cards: ${JSON.stringify(context.creditCards)}
- Currency: ${context.currency}
[END CONTEXT]

User Query: ${message}
`;

    const result = await chat.sendMessage(contextString);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Oracle AI Error:", error);
    
    // Fallback mechanism for Rate Limits (429) or other API errors
    // This ensures the app remains functional for demos even if the API quota is exhausted
    const isRateLimit = error.message?.includes("429") || error.status === 429;
    
    if (isRateLimit || error) {
      console.warn("Returning fallback response due to API error.");
      
      // 1. Check if it's a Rewards Maximizer request
      if (message && message.includes("Return ONLY a JSON object") && message.includes("redemption strategies")) {
         const fallbackJSON = JSON.stringify({
          baseline: {
             value: "$45.00",
             cpp: "0.8",
             description: "Statement Credit (Fallback)"
          },
          strategies: [
            {
              partner: "Virgin Atlantic (Simulated)",
              value: "$140.00",
              cpp: "2.5",
              description: "One-way Economy to London (Simulated due to API limit)",
              type: "Travel"
            },
            {
              partner: "Hyatt (Simulated)",
              value: "$120.00",
              cpp: "2.1",
              description: "1 Night at Category 4 Hotel (Simulated due to API limit)",
              type: "Hotel"
            },
             {
              partner: "United Airlines (Simulated)",
              value: "$110.00",
              cpp: "1.9",
              description: "Domestic First Class Upgrade (Simulated due to API limit)",
              type: "Travel"
            }
          ],
          insight: "API Rate Limit Reached. These are simulated high-value examples to demonstrate the UI layout."
         });
         return NextResponse.json({ response: "```json\n" + fallbackJSON + "\n```" });
      }

      // 2. Default Fallback for General Chat
      return NextResponse.json({ 
        response: "I apologize, but my cognitive engines are currently at maximum capacity (Rate Limit Reached). Please try again in a minute. In the meantime: Focusing on high-interest debt repayment is often the best guaranteed return on investment." 
      });
    }

    return NextResponse.json(
      { error: "Failed to process financial query." },
      { status: 500 }
    );
  }
}
