/**
 * @fileoverview Celebrio AI - Primary Application Entrypoint
 * @module server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT, DEFAULT_GEMINI_KEY } = require('./src/config/constants');
const {
  helmetMiddleware,
  apiLimiter,
  aiGenerationLimiter,
  requestTimeoutMiddleware
} = require('./src/middleware/security');
const { sanitizeInput, validatePlanInput } = require('./src/middleware/validator');
const { callGeminiAPI, cleanAndParseJSON } = require('./src/services/geminiService');
const {
  responseCache,
  getCacheKey,
  getFromCache,
  setInCache
} = require('./src/services/cacheService');

// Route modules
const planRoutes = require('./src/routes/planRoutes');
const creativeRoutes = require('./src/routes/creativeRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();

// Disable x-powered-by header for security hardening
app.disable('x-powered-by');

// 1. Security & Protection Middlewares
app.use(helmetMiddleware);
app.use(requestTimeoutMiddleware);
app.use('/api/', apiLimiter);
app.use('/api/generate', aiGenerationLimiter);

// 2. CORS & Parser Middlewares
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-custom-api-key']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!DEFAULT_GEMINI_KEY,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 4. Mount API Routes
app.use('/api', planRoutes);
app.use('/api', creativeRoutes);
app.use('/api', chatRoutes);

// 5. Utilities attached for test harness compatibility
app.cleanAndParseJSON = cleanAndParseJSON;
app.sanitizeInput = sanitizeInput;
app.getCacheKey = getCacheKey;
app.getFromCache = getFromCache;
app.setInCache = setInCache;
app.responseCache = responseCache;
app.callGeminiAPI = callGeminiAPI;
app.validatePlanInput = validatePlanInput;

// Start server only if run directly (clean testing imports)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Celebrio AI Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
