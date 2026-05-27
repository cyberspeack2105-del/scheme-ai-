import { NextResponse } from 'next/server';
import { callLLM } from '../../../utils/llm';

export async function POST(request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ detail: "Missing message field" }, { status: 400 });
    }

    const systemPrompt = `You are a precise data extraction AI. 
    Your task is to extract personal information from the user's message regardless of the language used (Tamil, English, etc.).
    
    Extract the following fields:
    - fullName (string)
    - age (integer/string)
    - occupation (MUST BE exactly one of: student, unemployed, employed, business, farmer, retired, other)
    - income (string/number)
    - fatherName (string)
    - motherName (string)

    Rules:
    1. If a field is not mentioned, return empty string "".
    2. For 'occupation', if the user's spoken occupation doesn't perfectly match, map it to the closest valid option.
    3. Output ONLY a clean JSON object. No reasoning, no markdown formatting.`;

    const cleanJsonText = await callLLM(systemPrompt, `Extract data from this text: ${message}`, true);
    
    if (!cleanJsonText) {
      return NextResponse.json({ error: "Failed to extract form data from AI." }, { status: 500 });
    }

    try {
      const parsedData = JSON.parse(cleanJsonText);
      return NextResponse.json(parsedData, { status: 200 });
    } catch (e) {
      console.error("[Next.js API] JSON parsing error on extraction:", e, cleanJsonText);
      return NextResponse.json({ error: "Invalid JSON response from extraction model." }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
