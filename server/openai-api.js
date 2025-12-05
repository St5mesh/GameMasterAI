const axios = require('axios');

// Configure API base URL - defaults to OpenAI but can be overridden for LM Studio
const API_BASE_URL = process.env.LM_STUDIO_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.OPENAI_API_KEY || '';
const DEFAULT_MODEL = process.env.AI_MODEL_DEFAULT || 'gpt-3.5-turbo';

async function generateResponse(prompt, options = {}) {
    const defaultOptions = {
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 1.0,
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Only add Authorization header if API key is provided
        if (API_KEY) {
            headers['Authorization'] = `Bearer ${API_KEY}`;
        }

        const response = await axios.post(
            `${API_BASE_URL}/chat/completions`,
            requestOptions,
            { headers: headers }
        );
        
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating AI response:', error);
        return null;
    }
}

module.exports = { generateResponse };
