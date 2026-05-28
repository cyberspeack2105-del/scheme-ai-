import { NextResponse } from 'next/server';
import { callLLM } from '../../../../utils/llm';

export async function POST(request) {
  try {
    const { role, mode, resume_text, difficulty } = await request.json();
    const diffLevel = difficulty || 5;

    if (mode === 'intro') {
      return NextResponse.json({
        question: "Let's master the most important question first: 'Tell me about yourself'. \n\nI want you to structure your answer in 4 parts: \n1. Greeting & Current Role\n2. Educational Background\n3. Key Skills & Experience\n4. Career Goal.\n\nGo ahead, introduce yourself!",
        type: "intro_start"
      }, { status: 200 });
    }

    let difficultyPrompt = `Current Difficulty Level: ${diffLevel}/10.`;
    if (diffLevel <= 3) {
      difficultyPrompt += " Ask a FUNDAMENTAL/BASIC question.";
    } else if (diffLevel >= 8) {
      difficultyPrompt += " Ask an ADVANCED/EXPERT question.";
    } else {
      difficultyPrompt += " Ask an INTERMEDIATE question.";
    }

    const systemPrompt = `You are an expert technical interviewer for the role: ${role}.
    Generate ONE specific interview question.
    ${difficultyPrompt}
    
    - Question should be concise (max 2 sentences).
    - DO NOT include the answer.
    - Output ONLY the question text.`;

    const userPrompt = resume_text ? `Resume Context: ${resume_text.slice(0, 1500)}\n\nGenerate the question.` : "Generate the question.";
    const question = await callLLM(systemPrompt, userPrompt);

    const fallbackQuestions = [
      `Describe a challenging project you worked on as a ${role}.`,
      `What are your key strengths relevant to ${role}?`,
      "How do you handle tight deadlines?",
      "Explain a complex technical concept to a non-technical person."
    ];

    return NextResponse.json({
      question: question || fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)],
      type: "technical",
      difficulty: diffLevel
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
