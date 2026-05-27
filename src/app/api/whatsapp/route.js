import { NextResponse } from 'next/server';
import { callLLM } from '../../../utils/llm';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const senderId = formData.get('From');
    const messageBody = formData.get('Body');
    
    console.log(`[Next.js API] Twilio Message from ${senderId}: ${messageBody}`);
    
    const time = new Date();
    const hour = time.getHours();
    const timePeriod = (hour >= 5 && hour < 12) ? 'morning' : (hour >= 12 && hour < 17) ? 'afternoon' : 'evening';
    
    const systemPrompt = `You are 'Keran, your AI assistant'. Help the user with schemes. Time: ${timePeriod}. Context: WhatsApp chat.`;
    const aiReply = await callLLM(systemPrompt, messageBody) || "I'm having trouble connecting right now. Please try again later!";

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${aiReply}</Message></Response>`;
    
    return new Response(xmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error("[Next.js API] WhatsApp Webhook error:", error);
    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error: ${error.message}</Message></Response>`;
    return new Response(xmlResponse, {
      status: 500,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
