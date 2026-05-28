import { NextResponse } from 'next/server';
import recommendationEngine from '../../../utils/recommendationEngine';
import { callLLM } from '../../../utils/llm';

export async function POST(request) {
  try {
    const { message, context } = await request.json();
    if (!message) {
      return NextResponse.json({ detail: "Missing message field" }, { status: 400 });
    }

    const msgLower = message.toLowerCase().trim();

    // --- STAGE 1: MY OWN AI (Recommendation scoring) ---
    const stopwords = ["i", "need", "want", "for", "a", "the", "please", "give", "me", "am", "looking", "scheme", "loan", "help", "how", "what", "is"];
    const keywords = msgLower.split(' ').filter(w => !stopwords.includes(w));
    
    const userProfile = {
      occupation: "citizen",
      skills: keywords.join(','),
      interest: keywords.join(','),
      location: "india"
    };

    if (msgLower.includes('farmer') || msgLower.includes('agriculture') || msgLower.includes('kisan')) {
      userProfile.occupation = 'farmer';
    } else if (msgLower.includes('student') || msgLower.includes('study') || msgLower.includes('education') || msgLower.includes('degree')) {
      userProfile.occupation = 'student';
    } else if (msgLower.includes('business') || msgLower.includes('startup') || msgLower.includes('entrepreneur') || msgLower.includes('shop')) {
      userProfile.occupation = 'business';
    }

    const recs = recommendationEngine.getRecommendations(userProfile);
    const schemes = (recs.schemes || []).slice(0, 2);

    let stage1Output = '';
    if (schemes.length > 0) {
      schemes.forEach(s => {
        stage1Output += `- Name: ${s.scheme_name}\n  Definition: ${s.description}\n  Link: ${s.official_link}\n`;
      });
    } else {
      stage1Output = 'No specific schemes found in current category.';
    }

    // --- STAGE 2: PRETRAINED AI (DeepSeek via OpenRouter) ---
    const time = new Date();
    const hour = time.getHours();
    const timePeriod = (hour >= 5 && hour < 12) ? 'morning' : (hour >= 12 && hour < 17) ? 'afternoon' : 'evening';

    const systemPrompt = `You are an advanced AI assistant representing 'Keran, your AI assistant'.
    
    Current Server Time Period: ${timePeriod}
    
    Your Task:
    1. Detect the user's language from their message.
    2. Start with a greeting in the user's language (e.g., 'Good Morning', 'Vanakkam', etc.) based on the current time period (${timePeriod}).
    3. Introduce yourself briefly as 'Keran, your AI assistant'.
    4. Use the following structured data from 'My Own AI' (Stage 1) to provide details about matching schemes:
    ---
    ${stage1Output}
    ---
    5. Present the Name, Definition, and Link clearly for each scheme.
    6. If NO schemes were found, politely explain and suggest common schemes.
    7. Answer in the same language the user used.
    8. Be friendly and professional. Use emojis. 🌟`;

    let reply = await callLLM(systemPrompt, `User Message: ${message}`);

    if (!reply) {
      // Fallback if API fails
      if (schemes.length === 0) {
        reply = "I'm having trouble connecting to my brain right now! Please try again later or search for keywords like 'farmer', 'student', or 'loan'.";
      } else {
        reply = "I'm currently having some connection issues, but based on our database, here are some schemes you might be interested in:\n\n";
        schemes.forEach((s, idx) => {
          reply += `*${idx + 1}. ${s.scheme_name}*\n🔗 ${s.official_link}\n\n`;
        });
      }
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("[Next.js API] Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
