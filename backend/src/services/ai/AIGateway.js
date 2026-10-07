const providerRouter = require('./ProviderRouter');
const healthTracker = require('./AIHealthTracker');
const platformConfigService = require('../platformConfig.service');
const AIProvider = require('../../models/AIProvider');
const { decrypt } = require('../../utils/encryption');

class AIGateway {
  /**
   * Execute normalized AIRequest through Provider Router with Fallback & Retries
   *
   * @param {Object} aiRequest
   * @returns {Promise<Object>} Normalized AI Response
   */
  async processRequest(aiRequest) {
    const config = await platformConfigService.getConfig();
    const retryPerProvider = config.ai?.retryPerProvider || 3;
    const providerPriority = await providerRouter.getPrioritizedProviders();

    let lastError = null;

    for (const providerName of providerPriority) {
      const adapter = providerRouter.getAdapter(providerName);
      if (!adapter) continue;

      // Try resolving provider API key / DB creds if present
      let credentials = {};
      try {
        const dbProvider = await AIProvider.findOne({
          name: new RegExp(`^${providerName}$`, 'i'),
          status: 'active',
        });
        if (dbProvider && dbProvider.apiKeyEncrypted) {
          credentials = {
            baseUrl: dbProvider.baseUrl,
            apiKey: decrypt(dbProvider.apiKeyEncrypted),
          };
        }
      } catch (e) {
        // Fallback to env variables in adapter
      }

      for (let attempt = 1; attempt <= retryPerProvider; attempt++) {
        try {
          const response = await adapter.execute(aiRequest, credentials);
          healthTracker.recordSuccess(providerName, response.latencyMs);
          return response;
        } catch (err) {
          lastError = err;
          healthTracker.recordFailure(providerName, err);
          console.warn(`[AIGateway] ${providerName} attempt ${attempt} failed: ${err.message}`);
        }
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}

module.exports = new AIGateway();
