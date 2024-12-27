const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({ project: 'stoked-cosine-444912-f3', location: 'us-central1' });
const model = 'gemini-exp-1206';

const textsi_1 = {
    text: `You are a helpful assistant designed to support service provider and provide suggestions for improvement to the product or service.
    Your output should be formatted as follows:

    [Provide a short paragraph summarizing the overall sentiment and key points from the reviews, such as general customer satisfaction, concerns, or areas that stand out positively or negatively.]

    Improvements:

    [Improvement point 1, such as improving response time, product quality, etc.]
    [Improvement point 2, such as enhancing customer support, offering more options, etc.]
    ...
    Considerations:

    [Consideration point 1, such as market trends, customer preferences, etc.]
    [Consideration point 2, such as the need for a more personalized approach or addressing recurring issues, etc.]
  
    Please keep the improvements and considerations limited to the most important aspects based on the text.`
};

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 1,
        topP: 1,
        seed: 0,
    },
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        }
    ],
    systemInstruction: {
        parts: [textsi_1]
    },
});


router.post('/:productId', async (req, res) => {
    const { productId } = req.params;
    const filePath = path.join(__dirname, './data', `${productId}.json`);

    try {
        const rawData = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(rawData);

        // Check if data.real_reviews exists and is an array
        if (!data || !data.real_reviews || !Array.isArray(data.real_reviews)) {
            return res.status(400).json({ error: 'Invalid reviews data structure.' });
        }
        const reviews = data.real_reviews.map(reviewObj => reviewObj.review);

        // Combine all reviews into a single string
        const reviewText = reviews.join('\n');

        // Send the reviews to Vertex AI
        const text1 = {
            text: `Analyze the following reviews and provide suggestions for improvement to the product or service: ${reviewText}`
        };

        const req = {
            contents: [
                { role: 'user', parts: [text1] }
            ],
        };

        const streamingResp = await generativeModel.generateContentStream(req);

        let summarizedResponse = "";
        for await (const item of streamingResp.stream) {
            if (item && item.candidates && item.candidates[0] && item.candidates[0].content && item.candidates[0].content.parts && item.candidates[0].content.parts[0] && item.candidates[0].content.parts[0].text) {
                summarizedResponse += item.candidates[0].content.parts[0].text;
            } else {
                console.log('Streaming item:', item);
            }
        }
        console.log('Suggestions:', summarizedResponse);
        res.json({ summary: summarizedResponse });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

module.exports = router;