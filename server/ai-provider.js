// server/ai-provider.js
// Abstraction layer for AI providers (OpenAI, LM Studio, etc.)

const axios = require('axios');

/**
 * Get AI provider configuration from environment variables
 */
function getProviderConfig() {
    const provider = process.env.AI_PROVIDER || 'openai';
    
    if (provider === 'lmstudio') {
        return {
            provider: 'lmstudio',
            baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
            models: {
                dm: process.env.LM_STUDIO_MODEL_DM || 'local-model',
                campaign: process.env.LM_STUDIO_MODEL_CAMPAIGN || 'local-model',
                summary: process.env.LM_STUDIO_MODEL_SUMMARY || 'local-model'
            },
            requiresAuth: false
        };
    }
    
    // Default to OpenAI
    return {
        provider: 'openai',
        baseURL: 'https://api.openai.com/v1',
        models: {
            dm: 'gpt-4',
            campaign: 'gpt-3.5-turbo',
            summary: 'gpt-3.5-turbo'
        },
        apiKey: process.env.OPENAI_API_KEY,
        requiresAuth: true
    };
}

/**
 * Generate AI response using configured provider
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Generation options (model, max_tokens, temperature)
 * @returns {Promise<string>} - Generated text response
 */
async function generateAIResponse(messages, options = {}) {
    const config = getProviderConfig();
    
    const {
        modelType = 'dm',  // 'dm', 'campaign', or 'summary'
        max_tokens = 300,
        temperature = 0.8
    } = options;
    
    // Select the appropriate model based on modelType
    const model = config.models[modelType] || config.models.dm;
    
    console.log(`Using AI Provider: ${config.provider}, Model: ${model}`);
    
    const requestBody = {
        model: model,
        messages: messages,
        max_tokens: max_tokens,
        temperature: temperature
    };
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Add authorization header only if required (OpenAI needs it, LM Studio doesn't)
    if (config.requiresAuth) {
        if (!config.apiKey) {
            throw new Error('OpenAI API key is required but not configured');
        }
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    
    try {
        const response = await axios.post(
            `${config.baseURL}/chat/completions`,
            requestBody,
            { headers }
        );
        
        // Extract the AI's message from the response
        const aiMessage = response.data.choices[0].message.content.trim();
        return aiMessage;
        
    } catch (error) {
        console.error('Error generating AI response:', error.response ? error.response.data : error.message);
        
        // Provide helpful error messages based on provider
        if (config.provider === 'lmstudio' && error.code === 'ECONNREFUSED') {
            throw new Error(`Cannot connect to LM Studio at ${config.baseURL}. Make sure LM Studio is running with a server started.`);
        }
        
        throw error;
    }
}

/**
 * Generate Dungeon Master response
 */
async function generateDMResponse(messages) {
    return generateAIResponse(messages, {
        modelType: 'dm',
        max_tokens: 300,
        temperature: 0.8
    });
}

/**
 * Generate campaign concept
 */
async function generateCampaign(messages) {
    return generateAIResponse(messages, {
        modelType: 'campaign',
        max_tokens: 400,
        temperature: 0.8
    });
}

/**
 * Generate game session summary
 */
async function generateSummary(messages) {
    return generateAIResponse(messages, {
        modelType: 'summary',
        max_tokens: 150,
        temperature: 0.8
    });
}

/**
 * Get current provider information (for debugging/status)
 */
function getProviderInfo() {
    const config = getProviderConfig();
    return {
        provider: config.provider,
        baseURL: config.baseURL,
        models: config.models
    };
}

module.exports = {
    generateDMResponse,
    generateCampaign,
    generateSummary,
    getProviderInfo
};
