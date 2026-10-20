/**
 * @fileoverview Creative Studio Route Handlers: Speeches, Toasts, and Vendor RFPs
 * @module routes/creativeRoutes
 */

const express = require('express');
const router = express.Router();
const { sanitizeInput } = require('../middleware/validator');
const { callGeminiAPI } = require('../services/geminiService');
const { getCacheKey, getFromCache, setInCache } = require('../services/cacheService');

/**
 * POST /api/generate-speech
 * Generates an authentic speech/toast with delivery cues.
 */
router.post('/generate-speech', async (req, res) => {
  try {
    const {
      speechType = 'toast',
      speakerName = 'The Speaker',
      honoreeName = 'The Honoree',
      relationship = 'Friend',
      tone = 'Heartfelt',
      keyMemories = 'Cherished memories',
      durationMinutes = 3
    } = req.body;

    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    const cacheKey = getCacheKey('speech', { speechType, speakerName, honoreeName, relationship, tone, keyMemories, durationMinutes });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const systemInstruction = 'You are an elite speechwriter. Write captivating, emotionally resonant speeches with delivery cues in [brackets].';
    const prompt = `Write a ${durationMinutes}-minute ${speechType.replace(/_/g, ' ')}:
- Speaker: ${sanitizeInput(speakerName)}
- Honoree: ${sanitizeInput(honoreeName)}
- Relationship: ${sanitizeInput(relationship)}
- Tone: ${sanitizeInput(tone)}
- Memories: ${sanitizeInput(keyMemories)}`;

    const apiResult = await callGeminiAPI(prompt, systemInstruction, requestedModel, customKey);
    const payload = {
      success: true,
      speech: apiResult.text,
      modelUsed: apiResult.modelUsed
    };

    setInCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Speech generation failed' });
  }
});

/**
 * POST /api/generate-vendor-rfp
 * Generates a formal vendor inquiry email and response checklist.
 */
router.post('/generate-vendor-rfp', async (req, res) => {
  try {
    const {
      vendorCategory = 'Services',
      vendorName = 'Vendor',
      eventDetails = 'Upcoming Event',
      budgetRange = 'Market rate',
      specificQuestions = 'Availability and quotes'
    } = req.body;

    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    const cacheKey = getCacheKey('rfp', { vendorCategory, vendorName, eventDetails, budgetRange, specificQuestions });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const systemInstruction = 'You are a professional luxury event coordinator. Draft polite, structured vendor inquiry emails and RFPs.';
    const prompt = `Draft a vendor inquiry email:
- Category: ${sanitizeInput(vendorCategory)}
- Name: ${sanitizeInput(vendorName)}
- Event Details: ${sanitizeInput(eventDetails)}
- Target Budget: ${sanitizeInput(budgetRange)}
- Inquiries: ${sanitizeInput(specificQuestions)}`;

    const apiResult = await callGeminiAPI(prompt, systemInstruction, requestedModel, customKey);
    const payload = {
      success: true,
      inquiry: apiResult.text,
      modelUsed: apiResult.modelUsed
    };

    setInCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Vendor RFP generation failed' });
  }
});

module.exports = router;
