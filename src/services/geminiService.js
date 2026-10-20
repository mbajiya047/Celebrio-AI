/**
 * @fileoverview Google Gemini AI Client Service with Automated Model Cascading
 * @module services/geminiService
 */

const { DEFAULT_GEMINI_KEY, DEFAULT_MODEL, FALLBACK_MODEL } = require('../config/constants');

/**
 * Invokes Google Gemini API with automatic model cascading on traffic spikes.
 * @param {string} prompt - User or system prompt text
 * @param {string} [systemInstruction=''] - Optional system persona instruction
 * @param {string} [requestedModel=null] - Preferred model identifier
 * @param {string} [customKey=null] - Optional user-provided API key override
 * @returns {Promise<{ text: string, modelUsed: string, usage: Object|null }>}
 * @throws {Error} If all cascade attempts fail or key is missing
 */
async function callGeminiAPI(prompt, systemInstruction = '', requestedModel = null, customKey = null) {
  const apiKey = customKey || DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Please enter your API key in Settings.');
  }

  // Model cascade: primary first, followed by fallbacks
  const modelsToTry = [
    requestedModel || DEFAULT_MODEL,
    FALLBACK_MODEL,
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
        lastError = new Error(`Upstream model error (${response.status})`);
        continue; // Fallback to next model in cascade
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

/**
 * Extracts and parses valid JSON from raw or markdown-fenced AI output.
 * @param {string} rawText - Model output string
 * @returns {Object} Parsed JavaScript object
 * @throws {Error} If no valid JSON can be extracted
 */
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

module.exports = {
  callGeminiAPI,
  cleanAndParseJSON
};
