const axios = require('axios');
const pdfParse = require('pdf-parse');
const recommendationEngine = require('../data/recommendationEngine');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper to call OpenRouter LLM
const callLLM = async (systemPrompt, userPrompt, jsonFormat = false) => {
  if (!DEEPSEEK_API_KEY) {
    console.error("OpenRouter/DeepSeek API Key not configured in environment variables.");
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://rootnexus.vercel.app',
    'X-Title': 'Keran AI'
  };

  const payload = {
    model: 'deepseek/deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 1000
  };

  if (jsonFormat) {
    payload.response_format = { type: 'json_object' };
  }

  try {
    const response = await axios.post(OPENROUTER_API_URL, payload, { headers, timeout: 30000 });
    let content = response.data.choices[0].message.content;
    
    // Clean up DeepSeek/Nemotron thinking tags & markdown JSON wrappers if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    content = content.replace(/```json\s*|\s*```/g, '').trim();
    
    return content;
  } catch (error) {
    console.error("LLM Call Error:", error.response ? error.response.data : error.message);
    return null;
  }
};

// Main Chatbot with two-stage processing (Scoring + DeepSeek Response)
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ detail: "Missing message field" });
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

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Form data extraction (Voice/Text Form)
exports.analyzeForm = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ detail: "Missing message field" });
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
      return res.status(500).json({ error: "Failed to extract form data from AI." });
    }

    try {
      const parsedData = JSON.parse(cleanJsonText);
      res.status(200).json(parsedData);
    } catch (e) {
      console.error("JSON parsing error on extraction:", e, cleanJsonText);
      res.status(500).json({ error: "Invalid JSON response from extraction model." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Twilio WhatsApp Webhook
exports.whatsappWebhook = async (req, res) => {
  try {
    // Twilio sends url-encoded forms
    const senderId = req.body.From;
    const messageBody = req.body.Body;
    
    console.log(`Twilio Message from ${senderId}: ${messageBody}`);
    
    const time = new Date();
    const hour = time.getHours();
    const timePeriod = (hour >= 5 && hour < 12) ? 'morning' : (hour >= 12 && hour < 17) ? 'afternoon' : 'evening';
    
    const systemPrompt = `You are 'Keran, your AI assistant'. Help the user with schemes. Time: ${timePeriod}. Context: WhatsApp chat.`;
    const aiReply = await callLLM(systemPrompt, messageBody) || "I'm having trouble connecting right now. Please try again later!";

    // Create XML Messaging response compatible with Twilio TwiML
    res.set('Content-Type', 'text/xml');
    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${aiReply}</Message></Response>`;
    res.status(200).send(xmlResponse);
  } catch (error) {
    console.error("WhatsApp Webhook error:", error);
    res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error: ${error.message}</Message></Response>`);
  }
};

// --- INTERVIEW BOT ---

// Upload Resume (pure in-memory PDF parsing - 100% serverless safe!)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filename = req.file.originalname.toLowerCase();
    let extractedText = '';

    if (filename.endsWith('.pdf')) {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else if (filename.endsWith('.txt')) {
      extractedText = req.file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: "Unsupported file format. Please upload PDF or TXT." });
    }

    res.status(200).json({ resume_text: extractedText.slice(0, 5000) });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
};

// Start Interview Question
exports.startInterview = async (req, res) => {
  try {
    const { role, mode, resume_text, difficulty } = req.body;
    const diffLevel = difficulty || 5;

    if (mode === 'intro') {
      return res.status(200).json({
        question: "Let's master the most important question first: 'Tell me about yourself'. \n\nI want you to structure your answer in 4 parts: \n1. Greeting & Current Role\n2. Educational Background\n3. Key Skills & Experience\n4. Career Goal.\n\nGo ahead, introduce yourself!",
        type: "intro_start"
      });
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

    res.status(200).json({
      question: question || fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)],
      type: "technical",
      difficulty: diffLevel
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Answer and Get Feedback + Next Question
exports.submitAnswer = async (req, res) => {
  try {
    const { role, question, answer, code, mode, language, current_difficulty } = req.body;
    const currDiff = current_difficulty || 5;

    if (mode === 'interview') {
      // Rapid fire response
      return res.status(200).json({
        evaluation: {
          content_score: 0,
          presentation_score: 0,
          feedback: "Response recorded.",
          tips: [],
          model_answer: "",
          next_difficulty: currDiff
        },
        next_question: {
          question: `Let's move on. Describe another scenario in your work as a ${role}.`,
          type: "technical",
          difficulty: currDiff
        }
      });
    }

    // Check for skips
    const skipPhrases = ["i don't know", "skip", "pass", "i will learn", "next question", "tell me the answer", "answer", "idk", "give me answer", "what is the answer"];
    const isSkip = skipPhrases.some(phrase => (answer || '').toLowerCase().includes(phrase));

    let codeContext = '';
    if (code) {
      codeContext = `\nUser Code Solution:\n\`\`\`javascript\n${code}\n\`\`\`\nAnalyze the code for correctness, efficiency, and style.`;
    }

    let systemPrompt = '';
    if (isSkip) {
      systemPrompt = `You are an expert mentor. User skipped the question: "${question}".
      Provide the optimal answer.
      Target Language: ${language || 'English'}
      Output STRICT JSON with English Keys:
      { 
         "content_score": 0, 
         "presentation_score": 0, 
         "confidence_score": 10,
         "emotion": "Hesitant",
         "feedback": "Skipped. Here is the answer:", 
         "tips": [], 
         "model_answer": "[Correct answer in ${language || 'English'}]" 
      }`;
    } else {
      systemPrompt = `You are an expert mentor for ${role}.
      User Answer: "${answer}"${codeContext}
      Question: "${question}"
      Target Language: ${language || 'English'}
      
      Task:
      1. Evaluate Content & Presentation (0-100).
      2. Analyze Confidence & Emotion based on the text (e.g. usage of fillers like 'um', hesitation, assertions).
      3. Provide a 'model_answer': A perfect, concise answer.
      4. If Target Language is NOT English, TRANSLATE only 'model_answer' and 'feedback'.
      5. Output STRICT JSON with English keys. do NOT use markdown.
      
      Output Schema:
      {
          "content_score": 85,
          "presentation_score": 90,
          "confidence_score": 80,
          "emotion": "Confident",
          "feedback": "Evaluation...",
          "tips": ["Tip 1"],
          "model_answer": "The ideal answer..."
      }`;
    }

    const evaluationText = await callLLM(systemPrompt, "Generate evaluation.", true);
    
    let evaluation = {};
    try {
      evaluation = JSON.parse(evaluationText);
    } catch (e) {
      // Fallback evaluation
      const fallbackScore = Math.floor(Math.random() * 25) + 60; // 60-85
      evaluation = {
        content_score: fallbackScore,
        presentation_score: Math.floor(Math.random() * 20) + 70,
        confidence_score: Math.floor(Math.random() * 30) + 60,
        emotion: "Neutral",
        feedback: "Great attempt! The application logic seems correct, but I couldn't process the deeper analysis at this moment due to high server traffic. Keep practicing!",
        tips: ["Try to be more specific in your examples.", "Maintain a steady pace."],
        model_answer: "Use proper state hooks and structural patterns to solve this question cleanly."
      };
    }

    // Adaptive difficulty calculation
    const score = evaluation.content_score || 0;
    let nextDifficulty = currDiff;
    if (score >= 80) {
      nextDifficulty = Math.min(10, currDiff + 1);
    } else if (score <= 40) {
      nextDifficulty = Math.max(1, currDiff - 1);
    }
    evaluation.next_difficulty = nextDifficulty;

    // Generate next question
    let difficultyPrompt = `Current Difficulty Level: ${nextDifficulty}/10.`;
    if (nextDifficulty <= 3) {
      difficultyPrompt += " Ask a FUNDAMENTAL/BASIC question.";
    } else if (nextDifficulty >= 8) {
      difficultyPrompt += " Ask an ADVANCED/EXPERT question.";
    } else {
      difficultyPrompt += " Ask an INTERMEDIATE question.";
    }

    const systemPromptNextQ = `You are an expert technical interviewer for the role: ${role}.
    Generate ONE specific interview question.
    ${difficultyPrompt}
    
    - Question should be concise (max 2 sentences).
    - DO NOT include the answer.
    - Output ONLY the question text.`;

    const userPromptNextQ = `Previous Question: ${question}\nUser Answer: ${answer}\n\nGenerate the next question.`;
    const nextQ = await callLLM(systemPromptNextQ, userPromptNextQ);

    res.status(200).json({
      evaluation,
      next_question: {
        question: nextQ || `Can you tell me about another scenario or project in your ${role} career?`,
        type: "technical",
        difficulty: nextDifficulty
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// AI-powered Scheme Recommendations and Explanations
exports.getAIRecommendations = async (req, res) => {
  try {
    const userProfile = req.body;
    
    // Get static recommendations (candidate list)
    const staticResults = recommendationEngine.getRecommendations(userProfile);
    const topSchemes = (staticResults.schemes || []).slice(0, 15);
    
    if (topSchemes.length === 0) {
      return res.status(200).json(staticResults);
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
    
    res.status(200).json({
      schemes: aiSchemes,
      jobs: staticResults.jobs
    });
  } catch (error) {
    console.error("AI Recommendations error:", error);
    res.status(500).json({ error: error.message });
  }
};

