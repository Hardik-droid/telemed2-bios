"use strict";

const axios = require("axios");
const show = require("../config/services/logging");

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "moonshotai/kimi-k2.5";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "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";

/**
 * Send a non-streaming request to the NVIDIA Kimi K2.5 model.
 * @param {Array<{role,content}>} messages
 * @param {number} maxTokens
 * @returns {Promise<string>} - raw text response
 */
async function callNvidia(messages, maxTokens = 1024) {
  const response = await axios.post(
    NVIDIA_API_URL,
    {
      model: NVIDIA_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.6,
      top_p: 1.0,
      stream: false,
      chat_template_kwargs: { thinking: false },
    },
    {
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );
  return response.data.choices[0].message.content.trim();
}

/**
 * Extract the first valid JSON object from a string that may contain
 * reasoning text before/after the JSON block.
 */
function extractJSON(text) {
  // Strip markdown code fences if present
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response");
  return JSON.parse(stripped.slice(start, end + 1));
}

/**
 * Analyse patient-reported symptoms and return a structured triage assessment.
 */
async function analyseSymptoms(symptoms, lang = "en") {
  const langLabel = lang === "hi" ? "Hindi" : lang === "pa" ? "Punjabi" : "English";

  const messages = [
    {
      role: "system",
      content: `You are a highly experienced medical triage assistant for a rural telemedicine platform in India.
Your role is to assist healthcare workers — NOT replace doctors.
Always respond in ${langLabel}.
Respond ONLY with a valid JSON object. No markdown, no code fences, no extra text before or after the JSON.`,
    },
    {
      role: "user",
      content: `Patient reports these symptoms: "${symptoms}"

Return this exact JSON structure:
{
  "urgency": "low|medium|high|critical",
  "urgencyColor": "#22c55e|#f59e0b|#ef4444|#7c3aed",
  "summary": "2-3 sentence plain-language summary of likely conditions",
  "recommendations": ["action 1", "action 2", "action 3"],
  "seekEmergencyCare": true or false,
  "disclaimer": "This is AI-assisted triage only. A qualified doctor must make the final diagnosis."
}`,
    },
  ];

  const text = await callNvidia(messages, 1024);
  show.info("[AI] symptom analysis raw length: " + text.length);
  return extractJSON(text);
}

/**
 * Summarise a voice-transcribed symptom narrative into a structured clinical note.
 */
async function summariseTranscript(transcript, lang = "en") {
  const langLabel = lang === "hi" ? "Hindi" : lang === "pa" ? "Punjabi" : "English";

  const messages = [
    {
      role: "system",
      content: `You are a medical scribe for a telemedicine clinic.
Convert patient voice transcripts into structured clinical notes.
Always respond in ${langLabel}.
Respond ONLY with a valid JSON object. No extra text.`,
    },
    {
      role: "user",
      content: `Patient voice transcript: "${transcript}"

Return this exact JSON structure:
{
  "chiefComplaint": "one sentence",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "estimated duration if mentioned, else Not specified",
  "severity": "mild|moderate|severe",
  "clinicalNote": "structured SOAP-style paragraph",
  "suggestedQuestions": ["follow-up question 1", "follow-up question 2"]
}`,
    },
  ];

  const text = await callNvidia(messages, 1024);
  show.info("[AI] transcript summary raw length: " + text.length);
  return extractJSON(text);
}

/**
 * Real-time AI chat for patients during or after consultation.
 */
async function chatWithAI(messages, lang = "en") {
  const langLabel = lang === "hi" ? "Hindi" : lang === "pa" ? "Punjabi" : "English";

  const systemMsg = {
    role: "system",
    content: `You are a compassionate healthcare assistant for MyHealth, a telemedicine service for rural India.
Always respond in ${langLabel}. Keep responses concise (under 150 words).
Never diagnose. Always recommend consulting a doctor for serious concerns.
Be warm, clear, and use simple language.`,
  };

  const text = await callNvidia([systemMsg, ...messages.slice(-10)], 512);
  return text;
}

module.exports = { analyseSymptoms, summariseTranscript, chatWithAI };
