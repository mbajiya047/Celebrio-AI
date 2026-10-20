const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to call Gemini API with fallback models
async function callGeminiAPI(prompt, systemInstruction = '', requestedModel = null, customKey = null) {
  const apiKey = customKey || DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Please enter your API key in Settings.');
  }

  // Model cascade: try requested or default first, then fallback
  const modelsToTry = [
    requestedModel || process.env.DEFAULT_MODEL || 'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
  ];
  // Remove duplicates
  const uniqueModels = [...new Set(modelsToTry)];

  let lastError = null;

  for (const model of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const body = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
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
        console.warn(`Model ${model} failed with HTTP ${response.status}:`, errorText.substring(0, 200));
        lastError = new Error(`HTTP ${response.status}: ${errorText.substring(0, 300)}`);
        // Continue to try next model in cascade (especially on 503 or 404)
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Empty response received from Gemini.');
      }

      return {
        text,
        modelUsed: model,
        usage: data.usageMetadata || null
      };
    } catch (err) {
      console.warn(`Attempt with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All model attempts failed');
}

// Extract JSON safely from model response
function cleanAndParseJSON(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (e1) {
    // Attempt markdown code block extraction
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        // Continue to fallback
      }
    }
    // Attempt finding first { and last }
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      } catch (e3) {
        // Continue
      }
    }
    throw new Error('Failed to parse clean JSON from Gemini output: ' + rawText.substring(0, 150));
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!DEFAULT_GEMINI_KEY,
    timestamp: new Date().toISOString()
  });
});

// General prompt generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, model } = req.body;
    const customKey = req.headers['x-custom-api-key'] || null;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await callGeminiAPI(prompt, systemInstruction, model, customKey);
    res.json(result);
  } catch (err) {
    console.error('API /generate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Comprehensive Event Plan Generator (Structured JSON)
app.post('/api/generate-plan', async (req, res) => {
  try {
    const {
      eventType, // "wedding" | "birthday" | "community" | "corporate" | "other"
      eventTitle,
      eventDate,
      guestCount,
      budgetTotal,
      currency = '$',
      location,
      themeVibe,
      specialNotes
    } = req.body;

    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    const systemInstruction = `You are Celebrio AI, a world-class professional event planning director and celebration designer with 20+ years of luxury wedding, milestone birthday, and high-impact community event production experience. 
Your output MUST be 100% valid, parseable JSON only, without any explanatory conversational text outside the JSON. Return only the JSON structure.`;

    const prompt = `Create a comprehensive, production-ready, highly detailed master plan for the following event:
- Event Title: ${eventTitle || 'Celebration'}
- Event Type: ${eventType || 'Celebration'}
- Target Date: ${eventDate || 'Upcoming in 6 months'}
- Location: ${location || 'Local Venue'}
- Guest Count: ${guestCount || 75}
- Total Budget: ${currency}${budgetTotal || 15000}
- Aesthetic / Vibe: ${themeVibe || 'Elegant, memorable, and celebratory'}
- Special Requirements: ${specialNotes || 'None'}

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
    {
      "id": "m1",
      "timeframe": "6-12 Months Before",
      "phase": "Foundation & Booking",
      "task": "string",
      "priority": "High",
      "done": false
    },
    {
      "id": "m2",
      "timeframe": "4-6 Months Before",
      "phase": "Vendor Contracting",
      "task": "string",
      "priority": "High",
      "done": false
    },
    {
      "id": "m3",
      "timeframe": "2-3 Months Before",
      "phase": "Design & Invitations",
      "task": "string",
      "priority": "Medium",
      "done": false
    },
    {
      "id": "m4",
      "timeframe": "1 Month Before",
      "phase": "Final RSVPs & Headcount",
      "task": "string",
      "priority": "High",
      "done": false
    },
    {
      "id": "m5",
      "timeframe": "1-2 Weeks Before",
      "phase": "Run of Show & Rehearsal",
      "task": "string",
      "priority": "High",
      "done": false
    },
    {
      "id": "m6",
      "timeframe": "Day Before",
      "phase": "Prep & Check-in",
      "task": "string",
      "priority": "Medium",
      "done": false
    }
  ],
  "runOfShow": [
    {
      "time": "09:00 AM",
      "activity": "string",
      "lead": "string",
      "location": "string",
      "notes": "string"
    },
    {
      "time": "11:30 AM",
      "activity": "string",
      "lead": "string",
      "location": "string",
      "notes": "string"
    },
    {
      "time": "01:00 PM",
      "activity": "string",
      "lead": "string",
      "location": "string",
      "notes": "string"
    },
    {
      "time": "03:00 PM",
      "activity": "string",
      "lead": "string",
      "location": "string",
      "notes": "string"
    },
    {
      "time": "05:00 PM",
      "activity": "string",
      "lead": "string",
      "location": "string",
      "notes": "string"
    },
    {
      "time": "07:30 PM",
      "activity": "string",
      "lead": "string",
      "location": "string",
      "notes": "string"
    },
    {
      "time": "10:00 PM",
      "activity": "string",
      "lead": "string",
      "location": "string",
      "notes": "string"
    }
  ],
  "vendors": [
    {
      "id": "v1",
      "category": "Venue",
      "role": "Venue Coordinator",
      "estimatedCost": number,
      "status": "Contacted",
      "keyQuestions": "string",
      "priority": "Critical"
    },
    {
      "id": "v2",
      "category": "Catering",
      "role": "Head Caterer & Bar",
      "estimatedCost": number,
      "status": "Researching",
      "keyQuestions": "string",
      "priority": "Critical"
    },
    {
      "id": "v3",
      "category": "Photography",
      "role": "Lead Photographer",
      "estimatedCost": number,
      "status": "Inquired",
      "keyQuestions": "string",
      "priority": "High"
    },
    {
      "id": "v4",
      "category": "Entertainment",
      "role": "DJ / Live Ensemble",
      "estimatedCost": number,
      "status": "Researching",
      "keyQuestions": "string",
      "priority": "Medium"
    },
    {
      "id": "v5",
      "category": "Decor & Floral",
      "role": "Floral Designer",
      "estimatedCost": number,
      "status": "Researching",
      "keyQuestions": "string",
      "priority": "Medium"
    }
  ],
  "personalizedIdeas": {
    "signatureActivities": [
      {
        "title": "string",
        "description": "string",
        "supplies": "string"
      },
      {
        "title": "string",
        "description": "string",
        "supplies": "string"
      },
      {
        "title": "string",
        "description": "string",
        "supplies": "string"
      }
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
All monetary fields must be numbers summing closely to ${budgetTotal || 15000}. Percentages in budget.categories must sum to 100. Ensure palette colors have valid 6-character hex codes (#RRGGBB).`;

    const apiResult = await callGeminiAPI(prompt, systemInstruction, requestedModel, customKey);
    const planJSON = cleanAndParseJSON(apiResult.text);

    res.json({
      success: true,
      data: planJSON,
      modelUsed: apiResult.modelUsed
    });
  } catch (err) {
    console.error('Plan generation failed:', err.message);
    res.status(500).json({
      error: 'Plan generation failed: ' + err.message
    });
  }
});

// Speech & Toast Writer endpoint
app.post('/api/generate-speech', async (req, res) => {
  try {
    const {
      speechType, // "best_man" | "maid_of_honor" | "birthday_host" | "welcome" | "vows" | "community_keynote"
      speakerName,
      honoreeName,
      relationship,
      tone, // "heartfelt", "funny", "inspiring", "sentimental", "poetic"
      keyMemories,
      durationMinutes = 3
    } = req.body;

    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    const systemInstruction = `You are an elite celebrity speechwriter and public speaking coach. You write captivating, authentic, emotionally resonant speeches that make audiences laugh, cry, and cheer without sounding cheesy. Output clean formatted markdown.`;

    const prompt = `Write a memorable ${durationMinutes}-minute ${speechType.replace(/_/g, ' ')} for an event.
- Speaker Name: ${speakerName || 'The Speaker'}
- Person(s) being celebrated: ${honoreeName || 'The Honoree'}
- Relationship: ${relationship || 'Close friend'}
- Desired Tone: ${tone || 'Heartfelt with light humor'}
- Personal stories, inside memories, or key themes to weave in: ${keyMemories || 'Cherished memories and wishes for the future'}

Please structure the speech clearly:
1. Warm Opening Hook (engages the room immediately)
2. Personal Story / Meaningful Connection (brings laughter or emotion)
3. Direct Tribute to the Honoree (sincere appreciation)
4. Toast Call-to-Action (raising glasses to a bright future)
Include delivery cues in [brackets like this: pause for laughter, look at honoree, smile].`;

    const apiResult = await callGeminiAPI(prompt, systemInstruction, requestedModel, customKey);
    res.json({
      success: true,
      speech: apiResult.text,
      modelUsed: apiResult.modelUsed
    });
  } catch (err) {
    console.error('Speech generation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Vendor RFP / Inquiry Email Generator
app.post('/api/generate-vendor-rfp', async (req, res) => {
  try {
    const {
      vendorCategory,
      vendorName,
      eventDetails,
      budgetRange,
      specificQuestions
    } = req.body;

    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    const systemInstruction = `You are a professional luxury event coordinator. You draft polite, concise, professional vendor request-for-proposals (RFPs) and inquiry emails that get rapid, accurate quotes.`;

    const prompt = `Draft a professional vendor inquiry email:
- Vendor Category: ${vendorCategory || 'Catering'}
- Vendor Business Name: ${vendorName || 'Prospective Vendor'}
- Event Info: ${eventDetails || 'Upcoming event'}
- Estimated Budget Allocation: ${budgetRange || 'Competitive'}
- Specific Inquiries/Questions: ${specificQuestions || 'Availability, package pricing, tasting/portfolio review, contract terms'}

Provide:
1. Subject line (punchy & clear)
2. Email Body (polite, structured with bullet points of event requirements)
3. Checklist of what the vendor should reply with.`;

    const apiResult = await callGeminiAPI(prompt, systemInstruction, requestedModel, customKey);
    res.json({
      success: true,
      inquiry: apiResult.text,
      modelUsed: apiResult.modelUsed
    });
  } catch (err) {
    console.error('Vendor RFP generation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Conversational AI Event Planner Co-pilot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, eventContext, history = [] } = req.body;
    const customKey = req.headers['x-custom-api-key'] || null;
    const requestedModel = req.body.model || null;

    const contextSummary = eventContext ? `
CURRENT ACTIVE EVENT CONTEXT:
- Title: ${eventContext.summary?.title || 'Event'}
- Type: ${eventContext.summary?.eventType || 'Celebration'}
- Budget: ${eventContext.summary?.currency || '$'}${eventContext.summary?.budgetTotal || 0}
- Guest Count: ${eventContext.summary?.guestCount || 0}
- Theme & Aesthetic: ${eventContext.theme?.conceptName || ''} (${eventContext.theme?.description || ''})
` : 'No active event selected yet.';

    const systemInstruction = `You are Celebrio AI Co-Pilot, the world's most helpful, intuitive, and knowledgeable celebration and event planning assistant.
You give actionable, concrete, creative advice for weddings, birthday celebrations, and community gatherings.
${contextSummary}
Keep answers structured, crisp, inspiring, and ready to implement. If recommending budget cuts, timeline tweaks, or vendor negotiation tactics, give exact dollar amounts or wording.`;

    let conversationText = '';
    if (history && history.length > 0) {
      conversationText = history.map(h => `${h.role === 'user' ? 'User' : 'Celebrio AI'}: ${h.text}`).join('\n\n') + '\n\n';
    }
    conversationText += `User: ${message}\nCelebrio AI:`;

    const apiResult = await callGeminiAPI(conversationText, systemInstruction, requestedModel, customKey);
    res.json({
      success: true,
      reply: apiResult.text,
      modelUsed: apiResult.modelUsed
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Celebrio AI Server running at http://localhost:${PORT}`);
});
