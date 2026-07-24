const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const docs = require('../docs/registry');

/**
 * POST /api/chat
 * Gemini 2.5 Flash powered chat for the Help/Explain panel.
 *
 * Body: {
 *   explainDocKey: string,       // to load grounding doc as system context
 *   language: 'en'|'ta'|'hi',
 *   questionText: string,        // the current onboarding question being asked
 *   messages: [{ role: 'user'|'model', content: string }]
 * }
 *
 * Response: { reply: string, grounded: boolean }
 */
router.post('/', async (req, res) => {
  const { explainDocKey, language = 'en', questionText = '', messages = [] } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(503).json({
      reply: 'Gemini API key not configured. Please set GEMINI_API_KEY in backend/.env',
      grounded: false,
    });
  }

  // Load grounding doc content
  const doc = docs[explainDocKey];
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const docContent = doc ? (doc[lang] || doc.en || '') : '';

  // Build system instruction
  const LANG_LABELS = { en: 'English', ta: 'Tamil', hi: 'Hindi' };
  const systemInstruction = `You are a friendly, helpful assistant for Myntra seller onboarding.
You are helping a first-time seller in India understand the following onboarding question:
"${questionText}"

Use the following reference information to ground your answers:
---
${docContent}
---

Always respond in ${LANG_LABELS[lang] || 'English'}.
Keep responses concise (2-4 sentences) and use simple, clear language suitable for first-time sellers.
If the user asks something outside your grounding context, still try to help generally but note that they should contact Myntra support for specifics.
Do not invent facts about Myntra policies not present in the reference information.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
    });

    // Build chat history (all previous turns except the last user message)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    // Send the last user message
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const result = await chat.sendMessage(lastUserMsg);
    const reply = result.response.text();

    return res.json({ reply, grounded: true });
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    return res.status(500).json({
      reply: 'Sorry, I could not get an answer right now. Please try again or contact support.',
      grounded: false,
    });
  }
});

module.exports = router;
