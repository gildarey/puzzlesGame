require('dotenv').config();

const express = require('express');
const cors = require('cors');
const configRoutes = require('./routes/configRoutes'); // routes
const fs = require('fs');
const path = require('path');

const axios = require('axios');

const app = express();

const PORT = process.env.PORT || 5000;
const HOSTNAME = 'localhost';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiApiUrl = process.env.OPENAI_API_URL;
const openaiModel = process.env.OPENAI_MODEL;

app.use(cors());

app.use(express.json());

// configRoutes
app.use('/api', configRoutes);

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});

//Too slow.... not in use
app.post('/api/generateWords', async (req, res) => {
    const {language, prompTopic, shortWords, mediumWords, longWords, boardDimensions} = req.body;

    try {
        let prompt = generatePrompt(language, prompTopic, shortWords, mediumWords, longWords, boardDimensions);

        const openaiResponse = await axios.post(
            openaiApiUrl,
            {
                model: openaiModel,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const responseContent = openaiResponse.data.choices[0].message.content;

        const cleanedResponse = responseContent.replace(/```json|\n```/g, '').trim();

        const extractedWords = JSON.parse(cleanedResponse);

        res.status(200).json({
            message: 'Words generated successfully',
            words: extractedWords,
        });
    } catch (error) {
        console.error('Error generating words from OpenAI:', error.toString());
        console.error('res from OpenAI:', error.response.data);
        res.status(500).json({message: 'Error creating case', error: error.toString()});
    }
});

//aux methods
const generatePrompt = (language, topic, shortWords, mediumWords, longWords, boardDimensions) => {
    let prompt = "You are helping to create a crossword puzzle. Generate a list of words based on the following criteria:\n";
    prompt += `- Language: ${language}\n`;
    prompt += `- Topic: ${topic}\n`;
    prompt += "- Word lengths:\n";
    prompt += `  - ${shortWords} words with 2-3 letters.\n`;
    prompt += `  - ${mediumWords} words with 4-6 letters.\n`;
    prompt += `  - ${longWords} words with 7-8 letters.\n`;
    prompt += `- Ensure words are commonly known and suitable for a crossword puzzle of dimension ${boardDimensions.rows}x${boardDimensions.cols}.\n`;
    prompt += "- Provide a short clue for each word, relevant to the topic.\n";
    prompt += "- Reference trustworthy sources like RAE, Wikipedia, or official sites.\n";
    prompt += "- Output as a JSON object with 'word' and 'hint'. Example: [{ word: 'EXAMPLE', hint: 'This is an example' }]. RETURN THIS FORMAT ONLY, do not add comments or additional text, just the JSON LIST.\n";

    return prompt;
};