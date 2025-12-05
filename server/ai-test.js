require('dotenv').config();

const axios = require('axios');

// Configure API base URL - defaults to OpenAI but can be overridden for LM Studio
const API_BASE_URL = process.env.LM_STUDIO_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.OPENAI_API_KEY || '';

async function testAI() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Only add Authorization header if API key is provided
    if (API_KEY) {
        headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await axios.post(
        `${API_BASE_URL}/chat/completions`,
        {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: 'Once upon a time, in a small village...',
                },
            ],
            max_tokens: 50,
            n: 1,
            stop: null,
            temperature: 1,
        },
        {
            headers: headers
        }
    );

    console.log('AI response:', response.data.choices[0].message.content);
}

testAI();
