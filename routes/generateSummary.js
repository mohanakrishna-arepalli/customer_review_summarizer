const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({ project: 'stoked-cosine-444912-f3', location: 'us-central1' });
const model = 'gemini-exp-1206';

const textsi_1 = {
    text: `You are a helpful assistant designed to analyze customer reviews and summarize them.
    Your output should be formatted as follows:

    **Summary:** [A short paragraph summarizing the overall sentiment and key points from the reviews]

    **Pros:**
    - [Pro point 1]
    - [Pro point 2]
    - ...

    **Cons:**
    - [Con point 1]
    - [Con point 2]
    - ...

    Please keep the pros and cons limited to the most important aspects based on the text.`
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
        console.log('Data:', data);
        // Check if data.real_reviews exists and is an array
        if (!data || !data.real_reviews || !Array.isArray(data.real_reviews)) {
            return res.status(400).json({ error: 'Invalid reviews data structure.' });
        }
        const reviews = data.real_reviews.map(reviewObj => reviewObj.review);
        console.log('Reviews:', reviews);
        // Combine all reviews into a single string
        const reviewText = reviews.join('\n');
        console.log('Review Text:', reviewText);
        // Send the reviews to Vertex AI
        const text1 = {
            text: `Summarize the following reviews: ${reviewText}`
        };

        const req = {
            contents: [
                { role: 'user', parts: [text1] }
            ],
        };

        const streamingResp = await generativeModel.generateContentStream(req);
        console.log('Streaming response:', streamingResp);
        let summarizedResponse = "";
        for await (const item of streamingResp.stream) {
            if (item && item.candidates && item.candidates[0] && item.candidates[0].content && item.candidates[0].content.parts && item.candidates[0].content.parts[0] && item.candidates[0].content.parts[0].text) {
                summarizedResponse += item.candidates[0].content.parts[0].text;
            } else {
                console.log('Streaming item:', item);
            }
        }

        console.log('Summary:', summarizedResponse);
        res.json({ summary: summarizedResponse });
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

module.exports = router;