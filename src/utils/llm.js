import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const callLLM = async (systemPrompt, userPrompt, jsonFormat = false) => {
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
    
    // Clean up DeepSeek thinking tags & markdown JSON wrappers
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    content = content.replace(/```json\s*|\s*```/g, '').trim();
    
    return content;
  } catch (error) {
    console.error("LLM Call Error:", error.response ? error.response.data : error.message);
    return null;
  }
};
