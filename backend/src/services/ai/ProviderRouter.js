const GeminiAdapter = require('./adapters/GeminiAdapter');
const OpenAIAdapter = require('./adapters/OpenAIAdapter');
const GrokAdapter = require('./adapters/GrokAdapter');
const healthTracker = require('./AIHealthTracker');
const platformConfigService = require('../platformConfig.service');

class ProviderRouter {
  constructor() {
    this.adapters = {
      gemini: new GeminiAdapter(),
      openai: new OpenAIAdapter(),
      grok: new GrokAdapter(),
    };
  }

  getAdapter(providerName) {
    const key = (providerName || '').toLowerCase();
    return this.adapters[key] || null;
  }

  async getPrioritizedProviders() {
    try {
      const config = await platformConfigService.getConfig();
      const priorityList = config.ai?.providersPriority || ['gemini', 'openai', 'grok'];
      
      // Filter out disabled or rate limited if alternatives exist
      const available = priorityList.filter((p) => {
        const health = healthTracker.getHealth(p);
        return health.status !== 'DISABLED' && health.status !== 'RATE_LIMITED';
      });

      return available.length > 0 ? available : priorityList;
    } catch (e) {
      return ['gemini', 'openai', 'grok'];
    }
  }
}

module.exports = new ProviderRouter();
