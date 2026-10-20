const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// 1. SECURITY HEADERS (Helmet with tailored CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// 2. RATE LIMITING (Prevent abuse & DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // Limit each IP to 120 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after a few minutes.' }
});

const aiGenerationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 40, // Max 40 AI generation requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI generation rate limit reached. Please wait a moment before generating more plans.' }
});

app.use('/api/', apiLimiter);
app.use('/api/generate', aiGenerationLimiter);

// 3. CORS & BODY PARSERS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-custom-api-key']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 4. IN-MEMORY CACHE FOR HIGH EFFICIENCY
const responseCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

function getCacheKey(prefix, data) {
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return `${prefix}:${hash}`;
}

function getFromCache(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.value;
}

function setInCache(key, value) {
  // Simple LRU purge if cache exceeds 200 items
  if (responseCache.size > 200) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  responseCache.set(key, { value, timestamp: Date.now() });
}

// 5. INPUT SANITIZATION & VALIDATION MIDDLEWARE
function sanitizeInput(val) {
  if (typeof val === 'string') {
    return val.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return val;
}

function validatePlanInput(req, res, next) {
  const { eventTitle, guestCount, budgetTotal } = req.body;

  if (eventTitle && typeof eventTitle === 'string' && eventTitle.length > 200) {
    return res.status(400).json({ error: 'Event title exceeds maximum allowed length of 200 characters.' });
  }

  if (guestCount !== undefined) {
    const count = parseInt(guestCount, 10);
    if (isNaN(count) || count < 1 || count > 50000) {
      return res.status(400).json({ error: 'Guest count must be a positive number between 1 and 50,000.' });
    }
    req.body.guestCount = count;
  }

  if (budgetTotal !== undefined) {
    const budget = parseFloat(budgetTotal);
    if (isNaN(budget) || budget <= 0 || budget > 100000000) {
      return res.status(400).json({ error: 'Budget must be a positive number up to 100,000,000.' });
    }
    req.body.budgetTotal = budget;
  }

  // Sanitize text fields
  for (const key of Object.keys(req.body)) {
    req.body[key] = sanitizeInput(req.body[key]);
  }

  next();
}

// 6. HELPER TO CALL GEMINI API WITH MULTI-MODEL RESILIENCE
async function callGeminiAPI(prompt, systemInstruction = '', requestedModel = null, customKey = null) {
  const apiKey = customKey || DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Please enter your API key in Settings.');
  }

  // Model cascade: primary first, then fallback
  const modelsToTry = [
    requestedModel || process.env.DEFAULT_MODEL || 'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
  ];
  const uniqueModels = [...new Set(modelsToTry)];

  let lastError = null;

  for (const model of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95
        }
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Model ${model} request returned status ${response.status}`);
        lastError = new Error(`Upstream model error (${response.status})`);
        continue; // Try next model in cascade
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Empty response received from AI model.');
      }

      return {
        text,
        modelUsed: model,
        usage: data.usageMetadata || null
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// Helper: Safely parse JSON from model output
function cleanAndParseJSON(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (e1) {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {}
    }
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      } catch (e3) {}
    }
    throw new Error('Malformed JSON received from AI engine.');
  }
}

// 7. API ROUTES

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!DEFAULT_GEMINI_KEY,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// General prompt generation endpoint
app.post('/api/generate', async (req, res) => {
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

// Comprehensive Event Plan Generator (Structured JSON)
app.post('/api/generate-plan', validatePlanInput, async (req, res) => {
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

    const systemInstruction = `You are Celebrio AI, an elite event planning director with 20+ years of luxury wedding, milestone birthday, and high-impact community event production experience. 
Your output MUST be 100% valid, parseable JSON only, without any markdown formatting or commentary outside the JSON. Return only the JSON object.`;

    const prompt = `Create a comprehensive, production-ready, highly detailed master plan for the following event:
- Event Title: ${eventTitle}
- Event Type: ${eventType}
- Target Date: ${eventDate}
- Location: ${location}
- Guest Count: ${guestCount}
- Total Budget: ${currency}${budgetTotal}
- Aesthetic / Vibe: ${themeVibe}
- Special Requirements: ${specialNotes}

Please return a single JSON object matching this schema EXACTLY:
{
  "summary": {
    "title": "string",
    "tagline": "string",
    "eventType": "${eventType}",
    "guestCount": number,
    "budgetTotal": number,
    "currency": "${currency}",
    "aesthetic": "string",
    "keyVision": "string"
  },
  "theme": {
    "conceptName": "string",
    "description": "string",
    "colorPalette": [
      { "name": "string", "hex": "#HEXCODE", "usage": "string" },
      { "name": "string", "hex": "#HEXCODE", "usage": "string" },
      { "name": "string", "hex": "#HEXCODE", "usage": "string" },
      { "name": "string", "hex": "#HEXCODE", "usage": "string" },
      { "name": "string", "hex": "#HEXCODE", "usage": "string" }
    ],
    "decorHighlights": ["string", "string", "string", "string"],
    "signatureDrink": {
      "name": "string",
      "recipe": "string",
      "mocktailAlternative": "string"
    },
    "musicVibe": "string"
  },
  "budget": {
    "total": number,
    "categories": [
      {
        "id": "venue",
        "name": "Venue & Facilities",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      },
      {
        "id": "catering",
        "name": "Catering & Beverage",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      },
      {
        "id": "decor",
        "name": "Decor & Floral",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      },
      {
        "id": "photo_video",
        "name": "Photography & Video",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      },
      {
        "id": "entertainment",
        "name": "Music & Entertainment",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      },
      {
        "id": "stationery",
        "name": "Invitations & Signage",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      },
      {
        "id": "attire_favors",
        "name": "Attire, Gifts & Favors",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      },
      {
        "id": "emergency",
        "name": "Contingency Buffer (5-10%)",
        "allocated": number,
        "percentage": number,
        "notes": "string",
        "savingTip": "string"
      }
    ]
  },
  "timelineMilestones": [
    { "id": "m1", "timeframe": "6-12 Months Before", "phase": "Foundation & Booking", "task": "string", "priority": "High", "done": false },
    { "id": "m2", "timeframe": "4-6 Months Before", "phase": "Vendor Contracting", "task": "string", "priority": "High", "done": false },
    { "id": "m3", "timeframe": "2-3 Months Before", "phase": "Design & Invitations", "task": "string", "priority": "Medium", "done": false },
    { "id": "m4", "timeframe": "1 Month Before", "phase": "Final RSVPs & Headcount", "task": "string", "priority": "High", "done": false },
    { "id": "m5", "timeframe": "1-2 Weeks Before", "phase": "Run of Show & Rehearsal", "task": "string", "priority": "High", "done": false },
    { "id": "m6", "timeframe": "Day Before", "phase": "Prep & Check-in", "task": "string", "priority": "Medium", "done": false }
  ],
  "runOfShow": [
    { "time": "09:00 AM", "activity": "string", "lead": "string", "location": "string", "notes": "string" },
    { "time": "11:30 AM", "activity": "string", "lead": "string", "location": "string", "notes": "string" },
    { "time": "01:00 PM", "activity": "string", "lead": "string", "location": "string", "notes": "string" },
    { "time": "03:00 PM", "activity": "string", "lead": "string", "location": "string", "notes": "string" },
    { "time": "05:00 PM", "activity": "string", "lead": "string", "location": "string", "notes": "string" },
    { "time": "07:30 PM", "activity": "string", "lead": "string", "location": "string", "notes": "string" },
    { "time": "10:00 PM", "activity": "string", "lead": "string", "location": "string", "notes": "string" }
  ],
  "vendors": [
    { "id": "v1", "category": "Venue", "role": "Venue Coordinator", "estimatedCost": number, "status": "Contacted", "keyQuestions": "string", "priority": "Critical" },
    { "id": "v2", "category": "Catering", "role": "Head Caterer & Bar", "estimatedCost": number, "status": "Researching", "keyQuestions": "string", "priority": "Critical" },
    { "id": "v3", "category": "Photography", "role": "Lead Photographer", "estimatedCost": number, "status": "Inquired", "keyQuestions": "string", "priority": "High" },
    { "id": "v4", "category": "Entertainment", "role": "DJ / Live Ensemble", "estimatedCost": number, "status": "Researching", "keyQuestions": "string", "priority": "Medium" },
    { "id": "v5", "category": "Decor & Floral", "role": "Floral Designer", "estimatedCost": number, "status": "Researching", "keyQuestions": "string", "priority": "Medium" }
  ],
  "personalizedIdeas": {
    "signatureActivities": [
      { "title": "string", "description": "string", "supplies": "string" },
      { "title": "string", "description": "string", "supplies": "string" },
      { "title": "string", "description": "string", "supplies": "string" }
    ],
    "invitationCopy": {
      "headline": "string",
      "opening": "string",
      "details": "string",
      "rsvpNote": "string",
      "dressCodeAdvice": "string"
    },
    "guestExperienceTouch": "string"
  }
}
Monetary values must sum to approximately ${budgetTotal}. Percentages must sum to 100. Hex codes must be valid #RRGGBB.`;

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

// Speech & Toast Writer endpoint
app.post('/api/generate-speech', async (req, res) => {
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

    const systemInstruction = `You are an elite speechwriter and public speaking coach. You write captivating, authentic, emotionally resonant speeches with clear stage cues in [brackets]. Output formatted markdown.`;

    const prompt = `Write a memorable ${durationMinutes}-minute ${speechType.replace(/_/g, ' ')} for an event.
- Speaker Name: ${sanitizeInput(speakerName)}
- Honoree: ${sanitizeInput(honoreeName)}
- Relationship: ${sanitizeInput(relationship)}
- Desired Tone: ${sanitizeInput(tone)}
- Key Memories & Themes: ${sanitizeInput(keyMemories)}

Structure:
1. Warm Opening Hook
2. Personal Story / Connection
3. Direct Tribute to the Honoree
4. Toast Call-to-Action
Include delivery cues in [brackets like this].`;

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

// Vendor RFP / Inquiry Email Generator
app.post('/api/generate-vendor-rfp', async (req, res) => {
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

    const systemInstruction = `You are a professional luxury event coordinator. You draft polite, structured, professional vendor request-for-proposals (RFPs) and inquiry emails.`;

    const prompt = `Draft a professional vendor inquiry email:
- Category: ${sanitizeInput(vendorCategory)}
- Business Name: ${sanitizeInput(vendorName)}
- Event Info: ${sanitizeInput(eventDetails)}
- Target Budget: ${sanitizeInput(budgetRange)}
- Specific Questions: ${sanitizeInput(specificQuestions)}

Provide:
1. Subject line
2. Email Body (polite, structured bullet points)
3. Checklist of what the vendor should reply with.`;

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

// Conversational AI Event Planner Co-pilot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, eventContext, history = [] } = req.body;
    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const contextSummary = eventContext ? `
CURRENT ACTIVE EVENT CONTEXT:
- Title: ${sanitizeInput(eventContext.summary?.title || 'Event')}
- Type: ${sanitizeInput(eventContext.summary?.eventType || 'Celebration')}
- Budget: ${eventContext.summary?.currency || '$'}${eventContext.summary?.budgetTotal || 0}
- Guest Count: ${eventContext.summary?.guestCount || 0}
- Aesthetic: ${sanitizeInput(eventContext.theme?.conceptName || '')}
` : 'No active event selected yet.';

    const systemInstruction = `You are Celebrio AI Co-Pilot, an expert event planning partner.
${contextSummary}
Keep answers structured, crisp, inspiring, and ready to implement. If recommending budget cuts, timeline tweaks, or vendor negotiation tactics, provide exact numbers and wording.`;

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

// Start server only if run directly (allows clean testing imports)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Celebrio AI Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
