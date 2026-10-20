/**
 * @fileoverview Conversational AI Co-Pilot Route Handlers
 * @module routes/chatRoutes
 */

const express = require('express');
const router = express.Router();
const { sanitizeInput } = require('../middleware/validator');
const { callGeminiAPI } = require('../services/geminiService');
const { getCacheKey, getFromCache, setInCache } = require('../services/cacheService');

/**
 * POST /api/generate
 * General prompt execution endpoint with caching.
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, model } = req.body;
    const customKey = req.headers['x-custom-api-key'] || null;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    const cacheKey = getCacheKey('gen', { prompt: sanitizedPrompt, systemInstruction, model });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const result = await callGeminiAPI(sanitizedPrompt, systemInstruction, model, customKey);
    setInCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

/**
 * POST /api/chat
 * Multi-turn context-aware chat with Celebrio Co-Pilot.
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, eventContext, history = [] } = req.body;
    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const contextSummary = eventContext ? `
CURRENT EVENT CONTEXT:
- Title: ${sanitizeInput(eventContext.summary?.title || 'Event')}
- Type: ${sanitizeInput(eventContext.summary?.eventType || 'Celebration')}
- Budget: ${eventContext.summary?.currency || '$'}${eventContext.summary?.budgetTotal || 0}
- Guest Count: ${eventContext.summary?.guestCount || 0}
- Aesthetic: ${sanitizeInput(eventContext.theme?.conceptName || '')}
` : 'No active event context.';

    const systemInstruction = `You are Celebrio AI Co-Pilot, an expert event planning partner. ${contextSummary} Provide structured, actionable planning advice.`;

    let conversationText = '';
    if (Array.isArray(history) && history.length > 0) {
      conversationText = history.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'Celebrio AI'}: ${sanitizeInput(h.text)}`).join('\n\n') + '\n\n';
    }
    conversationText += `User: ${sanitizeInput(message)}\nCelebrio AI:`;

    const apiResult = await callGeminiAPI(conversationText, systemInstruction, requestedModel, customKey);
    res.json({
      success: true,
      reply: apiResult.text,
      modelUsed: apiResult.modelUsed
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Chat error' });
  }
});

module.exports = router;
