//GMAI/server/routes/gameSession.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configure API base URL - defaults to OpenAI but can be overridden for LM Studio
const API_BASE_URL = process.env.LM_STUDIO_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.OPENAI_API_KEY || '';

// Route to generate AI Dungeon Master and campaign generating responses
router.post('/generate', async (req, res) => {
    // Extract the messages from the request body  
    const messages = req.body.messages;

    console.log('AI DM Processing the following messages');
    console.log(messages);

    // Make a POST request to the API for the AI DM
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Only add Authorization header if API key is provided
        if (API_KEY) {
            headers['Authorization'] = `Bearer ${API_KEY}`;
        }

        const response = await axios.post(`${API_BASE_URL}/chat/completions`, {
            model: 'gpt-4',
            messages: messages,
            max_tokens: 300,
            temperature: 0.8
        }, {
            headers: headers
        });

        // Extract the AI's message from the response   
        const aiMessage = response.data.choices[0].message.content.trim();
        console.log('AI DM processed:', aiMessage);


        // Send the AI's message back as the response 
        res.json(aiMessage);
    } catch (error) {
        console.error('Error generating text:', error.response ? error.response.data : error);
        let errorMessage = error.response ? error.response.data : error.message;
        res.status(500).json({ error: `Error generating text: ${errorMessage}` });
    }
});

// Route to generate campaign generating responses 
router.post('/generate-campaign', async (req, res) => {
    // Extract the messages from the request body  
    const messages = req.body.messages;

    console.log('Prepper is Processing the following messages');
    console.log(messages);

    // Make a POST request to the API for the AI DM
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Only add Authorization header if API key is provided
        if (API_KEY) {
            headers['Authorization'] = `Bearer ${API_KEY}`;
        }

        const response = await axios.post(`${API_BASE_URL}/chat/completions`, {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 400,
            temperature: 0.8
        }, {
            headers: headers
        });

        // Extract the AI's message from the response  
        const aiMessage = response.data.choices[0].message.content.trim();

        // Send the AI's message back as the response 
        res.json(aiMessage);
    } catch (error) {
        console.error('Error generating text:', error.response ? error.response.data : error);
        let errorMessage = error.response ? error.response.data : error.message;
        res.status(500).json({ error: `Error generating text: ${errorMessage}` });
    }
});

// Route to generate game session summary   
router.post('/generate-summary', async (req, res) => {
    try {
        // Extract the messages and the existing summary from the request body   
        const messages = req.body.messages;
        //console.log("AI notetaker is processing the following:");
        //console.log(messages);

        // Make a POST request to the Notetaker AI API
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Only add Authorization header if API key is provided
        if (API_KEY) {
            headers['Authorization'] = `Bearer ${API_KEY}`;
        }

        const response = await axios.post(`${API_BASE_URL}/chat/completions`, {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150,
            temperature: 0.8
        }, {
            headers: headers
        });

        // Extract the AI's message from the response  
        const aiSummary = response.data.choices[0].message.content.trim();

        // Send the AI's summary back as the response
        res.json(aiSummary);
    } catch (error) {
        console.error('Error generating text:', error.response ? error.response.data : error);
        let errorMessage = error.response ? error.response.data : error.message;
        res.status(500).json({ error: `Error generating text: ${errorMessage}` });
    }

});

// Export the router to be used in other files
module.exports = router;