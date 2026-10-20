// Celebrio AI Service Client
const AIService = {
  getCustomApiKey() {
    return localStorage.getItem('celebrio_custom_api_key') || '';
  },

  setCustomApiKey(key) {
    if (key) {
      localStorage.setItem('celebrio_custom_api_key', key.trim());
    } else {
      localStorage.removeItem('celebrio_custom_api_key');
    }
  },

  getSelectedModel() {
    return localStorage.getItem('celebrio_selected_model') || 'gemini-3.5-flash';
  },

  setSelectedModel(model) {
    localStorage.setItem('celebrio_selected_model', model);
  },

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const customKey = this.getCustomApiKey();
    if (customKey) {
      headers['x-custom-api-key'] = customKey;
    }
    return headers;
  },

  // Generate a complete event plan
  async generateEventPlan(formData) {
    const payload = {
      ...formData,
      model: this.getSelectedModel()
    };

    try {
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
    } catch (err) {
      console.warn('Backend plan generation error, checking fallback:', err);
      // If server failed, throw with actionable message
      throw new Error(`Generation error: ${err.message}`);
    }
  },

  // Generate a speech or toast
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

  // Generate a vendor RFP inquiry
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

  // Conversational Co-pilot chat
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
