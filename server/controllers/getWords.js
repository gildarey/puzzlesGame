const fs = require('fs');
const path = require('path');

// Define the path to the JSON database file
const jsonFilePath = path.join(__dirname, '../data/crosswordDatabase.json');

// Function to get words by criteria
const getWordsByCriteria = (topic, difficulty, language) => {
    const jsonData = readJsonFile();
    if (!jsonData) {
        console.error('Error reading JSON data');
        return [];
    }

    const topicData = jsonData[topic];
    if (!topicData) {
        console.error(`Topic ${topic} not found`);
        return [];
    }

    const filteredWords = topicData.filter(item =>
        item.difficulty === difficulty && item.language === language
    );

    return filteredWords.length > 0 ? filteredWords[0].words : [];
};


//aux methods
// Function to read JSON file
const readJsonFile = () => {
    try {
        const data = fs.readFileSync(jsonFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading or parsing JSON file:', err);
        return null;
    }
};

module.exports = { getWordsByCriteria };