//GMAI/server/routes/gameSession.js

const express = require('express');
const router = express.Router();
const { generateDMResponse, generateCampaign, generateSummary, getProviderInfo } = require('../ai-provider');

// Route to generate AI Dungeon Master and campaign generating responses
router.post('/generate', async (req, res) => {
    // Extract the messages from the request body  
    const messages = req.body.messages;

    console.log('AI DM Processing the following messages');
    console.log(messages);

    // Generate response using configured AI provider (OpenAI or LM Studio)
    try {
        const aiMessage = await generateDMResponse(messages);
        console.log('AI DM processed:', aiMessage);

        // Send the AI's message back as the response 
        res.json(aiMessage);
    } catch (error) {
        console.error('Error generating text:', error.response ? error.response.data : error.message);
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

    // Generate campaign concept using configured AI provider
    try {
        const aiMessage = await generateCampaign(messages);

        // Send the AI's message back as the response 
        res.json(aiMessage);
    } catch (error) {
        console.error('Error generating text:', error.response ? error.response.data : error.message);
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

        // Generate summary using configured AI provider
        const aiSummary = await generateSummary(messages);

        // Send the AI's summary back as the response
        res.json(aiSummary);
    } catch (error) {
        console.error('Error generating text:', error.response ? error.response.data : error.message);
        let errorMessage = error.response ? error.response.data : error.message;
        res.status(500).json({ error: `Error generating text: ${errorMessage}` });
    }

});

// Export the router to be used in other files
module.exports = router;