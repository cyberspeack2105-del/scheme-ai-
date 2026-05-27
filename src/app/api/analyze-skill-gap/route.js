import { NextResponse } from 'next/server';
import recommendationEngine from '../../../utils/recommendationEngine';

export async function POST(request) {
  try {
    const { user_skills, target_role } = await request.json();
    console.log("[Next.js API] [Skill Gap API] Request received:", { user_skills, target_role });
    const results = recommendationEngine.analyzeSkillGap(user_skills, target_role);
    console.log("[Next.js API] [Skill Gap API] Response results:", {
      role: results.role,
      matched_count: results.matched_skills ? results.matched_skills.length : 0,
      missing_count: results.missing_skills ? results.missing_skills.length : 0,
      score: results.score
    });
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("[Next.js API] [Skill Gap API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
