class BaseAdapter {
  constructor(providerName, defaultModel) {
    this.providerName = providerName;
    this.defaultModel = defaultModel;
  }

  /**
   * Convert normalized AIRequest into provider-specific request format,
   * execute, and return normalized response object.
   *
   * @param {Object} aiRequest
   * @param {Object} credentials { apiKey, baseUrl, modelId }
   * @returns {Promise<Object>} Normalized Response
   */
  async execute(aiRequest, credentials) {
    throw new Error('execute() method must be implemented by adapter subclass');
  }
}

module.exports = BaseAdapter;
