import { NextResponse } from 'next/server';
import recommendationEngine from '../../../utils/recommendationEngine';
import { callLLM } from '../../../utils/llm';

export async function POST(request) {
  try {
    const userProfile = await request.json();
    console.log("[Next.js API] Received request for /recommend:", userProfile);
    
    // Get static recommendations (candidate list)
    const staticResults = recommendationEngine.getRecommendations(userProfile);
    const topSchemes = (staticResults.schemes || []).slice(0, 15);
    
    if (topSchemes.length === 0) {
      return NextResponse.json(staticResults, { status: 200 });
    }

    const systemPrompt = `You are a friendly, expert government and private welfare scheme advisor.
    Your task is to analyze the user's profile and the provided candidate schemes list:
    1. Select the top 6 most relevant schemes that the user is eligible for.
    2. Rewrite the "description" for each selected scheme to explain in extremely simple, friendly, and user-friendly language (tailored to their profile) why they qualify and how exactly it helps them. Make it easy to read.
    3. Keep the original scheme_id, scheme_name, scheme_type, and official_link exactly unchanged.
    4. Output MUST be a valid JSON array of objects with the exact schema:
    [
      {
        "scheme_id": number,
        "scheme_name": "string",
        "scheme_type": "string",
        "description": "Highly simplified, friendly explanation of benefits tailored to this user. Max 2-3 sentences.",
        "official_link": "string"
      }
    ]
    No other text, markdown wrapper, or reasoning. Output only JSON.`;

    const userPrompt = `User Profile:
    - Occupation: ${userProfile.occupation || 'Not specified'}
    - Skills: ${userProfile.skills || 'Not specified'}
    - Interests: ${userProfile.interest || 'Not specified'}
    - Location: ${userProfile.location || 'India'}
    - Age: ${userProfile.age || 'Not specified'}
    - Income: ${userProfile.income || 'Not specified'}
    
    Candidate Schemes:
    ${JSON.stringify(topSchemes.map(s => ({
      scheme_id: s.scheme_id,
      scheme_name: s.scheme_name,
      scheme_type: s.scheme_type,
      description: s.description,
      official_link: s.official_link
    })), null, 2)}`;

    const responseText = await callLLM(systemPrompt, userPrompt, true);
    
    let aiSchemes = [];
    if (responseText) {
      try {
        aiSchemes = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse AI schemes JSON:", e, responseText);
      }
    }
    
    // Fallback if AI generation failed or returned empty
    if (!aiSchemes || aiSchemes.length === 0) {
      aiSchemes = staticResults.schemes.slice(0, 6).map(s => ({
        scheme_id: s.scheme_id,
        scheme_name: s.scheme_name,
        scheme_type: s.scheme_type,
        description: s.description,
        official_link: s.official_link
      }));
    }
    
    return NextResponse.json({
      schemes: aiSchemes,
      jobs: staticResults.jobs
    }, { status: 200 });
  } catch (error) {
    console.error("[Next.js API] AI Recommendations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
