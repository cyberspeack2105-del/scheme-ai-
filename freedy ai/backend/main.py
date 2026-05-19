from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

import os

# -----------------------------
# Config & Setup
# -----------------------------
# OpenRouter Config
API_KEY = os.environ.get("OPENROUTER_API_KEY", "YOUR_OPENROUTER_API_KEY_HERE")
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "meta-llama/llama-3.3-70b-instruct:free"

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(title="Freedy AI - AI Server")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request Schema
# -----------------------------
class Question(BaseModel):
    prompt: str
    language: str = "Tamil"  # Default language

# -----------------------------
# SYSTEM PROMPT TEMPLATE
# -----------------------------
def get_system_prompt(language: str):
    return f"""
You are a STUDY AI ASSISTANT.

You are allowed to answer ONLY these subjects:
1. Physics
2. Chemistry
3. Biology
4. Mathematics
5. Computer Science

❌ If the question is outside these subjects,
politely reply:
"“This freedy AI assistant is limited to Physics, Chemistry, Biology, Mathematics, and Computer Science subjects only.”."

LANGUAGE RULE:
- Prefer {language}
- If technical words are needed, mix {language} + English

ANSWER FORMAT (STRICT – MUST FOLLOW):

Title:
<topic name>

Definition:
<clear definition>

Key Points:
- point 1
- point 2
- point 3

Working / Explanation:
<step-by-step explanation>

Applications:
- application 1
- application 2

Real World Examples:
- example 1
- example 2

Conclusion:
<short summary>

Do NOT change this structure.
"""

# -----------------------------
# AI Function
# -----------------------------
def ask_deepseek(user_prompt: str, language: str):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": get_system_prompt(language)},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers, timeout=20)
        
        if response.status_code != 200:
            return f"❌ AI server error: {response.text}"
        
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"❌ Connection Error: {str(e)}"

# -----------------------------
# API Endpoint
# -----------------------------
@app.post("/ask")
def ask_ai(question: Question):
    answer = ask_deepseek(question.prompt, question.language)
    return {"answer": answer}

# Root check
@app.get("/")
def read_root():
    return {"message": "AI Server Running on Port 8008"}
