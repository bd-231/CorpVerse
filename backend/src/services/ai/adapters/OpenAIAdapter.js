const axios = require('axios');
const BaseAdapter = require('./BaseAdapter');

class OpenAIAdapter extends BaseAdapter {
  constructor() {
    super('openai', 'gpt-4o');
  }

  async execute(aiRequest, credentials = {}) {
    const startTime = Date.now();
    const apiKey = credentials.apiKey || process.env.OPENAI_API_KEY;
    const model = credentials.modelId || this.defaultModel;
    const baseUrl = credentials.baseUrl || 'https://api.openai.com/v1';

    if (!apiKey) {
      throw new Error('OpenAI API Key missing');
    }

    const messages = [];
    if (aiRequest.systemInstruction) {
      messages.push({ role: 'system', content: aiRequest.systemInstruction });
    }
    messages.push({
      role: 'user',
      content: typeof aiRequest.userInput === 'string' ? aiRequest.userInput : JSON.stringify(aiRequest.userInput),
    });

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages,
        temperature: aiRequest.temperature || 0.7,
        max_tokens: aiRequest.maxTokens || 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: credentials.timeoutMs || 30000,
      }
    );

    const latencyMs = Date.now() - startTime;
    const content = response.data?.choices?.[0]?.message?.content || '';

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
      provider: 'openai',
      model,
      requestId: response.data?.id || `openai-${Date.now()}`,
      content,
      structuredData,
      usage: {
        inputTokens: response.data?.usage?.prompt_tokens || 0,
        outputTokens: response.data?.usage?.completion_tokens || 0,
        totalTokens: response.data?.usage?.total_tokens || 0,
      },
      latencyMs,
    };
  }
}

module.exports = OpenAIAdapter;
