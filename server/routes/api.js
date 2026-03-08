"use strict";

const express = require("express");
const router = express.Router();
const { analyseSymptoms, summariseTranscript, chatWithAI } = require("../src/ai/aiService");
const show = require("../src/config/services/logging");

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// POST /api/ai/symptoms — analyse patient symptoms
router.post("/ai/symptoms", async (req, res) => {
  const { symptoms, lang = "en" } = req.body;

  if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 5) {
    return res.status(400).json({ error: "symptoms field is required (min 5 chars)" });
  }

  if (symptoms.length > 2000) {
    return res.status(400).json({ error: "symptoms text too long (max 2000 chars)" });
  }

  try {
    const result = await analyseSymptoms(symptoms.trim(), lang);
    show.info(`AI symptom analysis completed [lang:${lang}]`);
    res.json(result);
  } catch (err) {
    show.error(`AI symptom analysis failed: ${err.message}`);
    res.status(500).json({ error: err.message || "AI analysis failed" });
  }
});

// POST /api/ai/transcript — summarise voice transcript
router.post("/ai/transcript", async (req, res) => {
  const { transcript, lang = "en" } = req.body;

  if (!transcript || typeof transcript !== "string" || transcript.trim().length < 10) {
    return res.status(400).json({ error: "transcript field is required (min 10 chars)" });
  }

  if (transcript.length > 5000) {
    return res.status(400).json({ error: "transcript too long (max 5000 chars)" });
  }

  try {
    const result = await summariseTranscript(transcript.trim(), lang);
    show.info(`AI transcript summary completed [lang:${lang}]`);
    res.json(result);
  } catch (err) {
    show.error(`AI transcript summary failed: ${err.message}`);
    res.status(500).json({ error: err.message || "Transcript summarisation failed" });
  }
});

// POST /api/ai/chat — patient assistant chat
router.post("/ai/chat", async (req, res) => {
  const { messages, lang = "en" } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array" });
  }

  const validRoles = ["user", "assistant"];
  const isValid = messages.every(
    (m) => validRoles.includes(m.role) && typeof m.content === "string" && m.content.trim()
  );
  if (!isValid) {
    return res.status(400).json({ error: "Each message must have role (user|assistant) and content" });
  }

  try {
    const reply = await chatWithAI(messages, lang);
    show.info(`AI chat response generated [lang:${lang}]`);
    res.json({ reply });
  } catch (err) {
    show.error(`AI chat failed: ${err.message}`);
    res.status(500).json({ error: err.message || "AI chat failed" });
  }
});

// GET /api/rooms — live room stats (for admin/monitoring)
router.get("/rooms", (req, res) => {
  try {
    const { totalRoomsRunning, allRooms } = require("../src/lib/socketServer");
    const rooms = allRooms();
    const roomStats = rooms.map((r) => ({
      roomId: r._roomId,
      peerCount: r._participants ? r._participants.peers.length : 0,
    }));
    res.json({
      totalRooms: roomStats.length,
      rooms: roomStats,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve room stats" });
  }
});

module.exports = router;
