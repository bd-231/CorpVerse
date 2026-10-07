const axios = require('axios');
const BaseAdapter = require('./BaseAdapter');

class GeminiAdapter extends BaseAdapter {
  constructor() {
    super('gemini', 'gemini-1.5-pro');
  }

  async execute(aiRequest, credentials = {}) {
    const startTime = Date.now();
    const apiKey = credentials.apiKey || process.env.GEMINI_API_KEY;
    const model = credentials.modelId || this.defaultModel;
    const baseUrl = credentials.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';

    if (!apiKey) {
      throw new Error('Gemini API Key missing');
    }

    const endpoint = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

    const promptText = `${aiRequest.systemInstruction ? aiRequest.systemInstruction + '\n\n' : ''}${typeof aiRequest.userInput === 'string' ? aiRequest.userInput : JSON.stringify(aiRequest.userInput)}`;

    const response = await axios.post(
      endpoint,
      {
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: aiRequest.temperature || 0.7,
          maxOutputTokens: aiRequest.maxTokens || 2048,
        },
      },
      { timeout: credentials.timeoutMs || 30000 }
    );

    const latencyMs = Date.now() - startTime;
    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let structuredData = {};
    try {
      if (content.includes('{') || content.includes('[')) {
        const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      // Keep empty if unparseable
    }

    return {
      success: true,
      provider: 'gemini',
      model,
      requestId: `gemini-${Date.now()}`,
      content,
      structuredData,
      usage: {
        inputTokens: response.data?.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.data?.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.data?.usageMetadata?.totalTokenCount || 0,
      },
      latencyMs,
    };
  }
}

module.exports = GeminiAdapter;
