/**
 * @fileoverview Celebrio AI Frontend Client Service
 * Manages communication with backend Gemini AI endpoints and localStorage settings.
 * @module AIService
 */

const AIService = {
  /**
   * Retrieves user-defined custom API key from localStorage.
   * @returns {string} Custom API key or empty string
   */
  getCustomApiKey() {
    return localStorage.getItem('celebrio_custom_api_key') || '';
  },

  /**
   * Persists custom API key in browser storage.
   * @param {string} key - API Key string
   */
  setCustomApiKey(key) {
    if (key) {
      localStorage.setItem('celebrio_custom_api_key', key.trim());
    } else {
      localStorage.removeItem('celebrio_custom_api_key');
    }
  },

  /**
   * Gets preferred model identifier.
   * @returns {string} Model name (e.g., 'gemini-3.5-flash')
   */
  getSelectedModel() {
    return localStorage.getItem('celebrio_selected_model') || 'gemini-3.5-flash';
  },

  /**
   * Sets preferred model identifier.
   * @param {string} model - Model identifier
   */
  setSelectedModel(model) {
    localStorage.setItem('celebrio_selected_model', model);
  },

  /**
   * Constructs HTTP request headers including optional custom API key.
   * @returns {Record<string, string>} Header map
   */
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const customKey = this.getCustomApiKey();
    if (customKey) {
      headers['x-custom-api-key'] = customKey;
    }
    return headers;
  },

  /**
   * Sends parameters to /api/generate-plan to synthesize a full celebration plan.
   * @param {Object} formData - Event parameters
   * @returns {Promise<Object>} Structured event plan object
   * @throws {Error} If generation fails
   */
  async generateEventPlan(formData) {
    const payload = {
      ...formData,
      model: this.getSelectedModel()
    };

    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Generates a tailored speech or toast.
   * @param {Object} params - Speech parameters
   * @returns {Promise<string>} Drafted speech text
   */
  async generateSpeech(params) {
    const payload = {
      ...params,
      model: this.getSelectedModel()
    };

    const response = await fetch('/api/generate-speech', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const result = await response.json();
    return result.speech;
  },

  /**
   * Generates a formal vendor inquiry email and RFP checklist.
   * @param {Object} params - Vendor details and specific requirements
   * @returns {Promise<string>} Drafted RFP inquiry email
   */
  async generateVendorRFP(params) {
    const payload = {
      ...params,
      model: this.getSelectedModel()
    };

    const response = await fetch('/api/generate-vendor-rfp', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const result = await response.json();
    return result.inquiry;
  },

  /**
   * Sends conversational message with active event context to Celebrio Co-Pilot.
   * @param {string} message - User chat message
   * @param {Object} eventContext - Active celebration state
   * @param {Array<{role: string, text: string}>} [history=[]] - Prior turn history
   * @returns {Promise<string>} AI assistant response text
   */
  async chatWithCopilot(message, eventContext, history = []) {
    const payload = {
      message,
      eventContext,
      history,
      model: this.getSelectedModel()
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const result = await response.json();
    return result.reply;
  }
};
