/**
 * @fileoverview Event Plan Generation Route Handlers
 * @module routes/planRoutes
 */

const express = require('express');
const router = express.Router();
const { validatePlanInput } = require('../middleware/validator');
const { callGeminiAPI, cleanAndParseJSON } = require('../services/geminiService');
const { getCacheKey, getFromCache, setInCache } = require('../services/cacheService');

/**
 * POST /api/generate-plan
 * Synthesizes a structured JSON master celebration plan.
 */
router.post('/generate-plan', validatePlanInput, async (req, res) => {
  try {
    const {
      eventType = 'celebration',
      eventTitle = 'Celebration',
      eventDate = 'Upcoming',
      guestCount = 75,
      budgetTotal = 15000,
      currency = '$',
      location = 'Local Venue',
      themeVibe = 'Elegant and memorable',
      specialNotes = 'None'
    } = req.body;

    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    const cacheKey = getCacheKey('plan', { eventType, eventTitle, eventDate, guestCount, budgetTotal, currency, location, themeVibe, specialNotes });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const systemInstruction = 'You are Celebrio AI, an elite event planning director. Output 100% valid JSON matching the requested schema without external markdown commentary.';

    const prompt = `Create a comprehensive, production-ready master plan for:
- Event Title: ${eventTitle}
- Event Type: ${eventType}
- Target Date: ${eventDate}
- Location: ${location}
- Guest Count: ${guestCount}
- Total Budget: ${currency}${budgetTotal}
- Aesthetic / Vibe: ${themeVibe}
- Special Notes: ${specialNotes}

Return ONLY this JSON schema:
{
  "summary": { "title": "string", "tagline": "string", "eventType": "${eventType}", "guestCount": number, "budgetTotal": number, "currency": "${currency}", "aesthetic": "string", "keyVision": "string" },
  "theme": { "conceptName": "string", "description": "string", "colorPalette": [{ "name": "string", "hex": "#HEXCODE", "usage": "string" }], "decorHighlights": ["string"], "signatureDrink": { "name": "string", "recipe": "string", "mocktailAlternative": "string" }, "musicVibe": "string" },
  "budget": { "total": number, "categories": [{ "id": "string", "name": "string", "allocated": number, "percentage": number, "notes": "string", "savingTip": "string" }] },
  "timelineMilestones": [{ "id": "string", "timeframe": "string", "phase": "string", "task": "string", "priority": "High", "done": false }],
  "runOfShow": [{ "time": "09:00 AM", "activity": "string", "lead": "string", "location": "string", "notes": "string" }],
  "vendors": [{ "id": "string", "category": "string", "role": "string", "estimatedCost": number, "status": "Researching", "keyQuestions": "string", "priority": "Critical" }],
  "personalizedIdeas": { "signatureActivities": [{ "title": "string", "description": "string", "supplies": "string" }], "invitationCopy": { "headline": "string", "opening": "string", "details": "string", "rsvpNote": "string", "dressCodeAdvice": "string" }, "guestExperienceTouch": "string" }
}
Sum of budget categories must equal approximately ${budgetTotal}. Hex codes must be valid #RRGGBB format.`;

    const apiResult = await callGeminiAPI(prompt, systemInstruction, requestedModel, customKey);
    const planJSON = cleanAndParseJSON(apiResult.text);

    const payload = {
      success: true,
      data: planJSON,
      modelUsed: apiResult.modelUsed
    };

    setInCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Plan generation failed: ' + err.message });
  }
});

module.exports = router;
