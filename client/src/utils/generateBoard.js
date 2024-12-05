import axios from 'axios';

export const generateBoard = async (language, difficulty, topic) => {
    const apiURL = process.env.REACT_APP_API_URL;

    console.log(`Generating board with language: ${language}, difficulty: ${difficulty}, topic: ${topic}........`);

    let promptTopic = topic === 'None' || topic === 'Ninguno' ? 'Random' : topic;

    // Define board dimensions and density based on difficulty
    let boardDimensions;
    let density;

    if (difficulty === 1) { // Easy
        boardDimensions = {rows: 8, cols: 8};
        density = 0.4; // 40%
    } else if (difficulty === 2) { // Medium
        boardDimensions = {rows: 10, cols: 10};
        density = 0.5; // 50%
    } else if (difficulty === 3) { // Hard
        boardDimensions = {rows: 12, cols: 12};
        density = 0.6; // 60%
    } else {
        // Default to medium difficulty
        boardDimensions = {rows: 10, cols: 10};
        density = 0.5;
    }

    // Calculate occupied cells and estimated number of words
    const totalCells = boardDimensions.rows * boardDimensions.cols;
    const occupiedCells = totalCells * density;

    const averageWordLength = 4; // Initial average word length
    const numWords = Math.round(occupiedCells / averageWordLength);

    // Distribute words by length
    const shortWords = Math.floor(numWords * 0.25); // 25% short words (2-3 letters)
    const mediumWords = Math.floor(numWords * 0.5); // 50% medium words (4-6 letters)
    const longWords = numWords - (shortWords + mediumWords); // The rest are long words (7-8 letters)

    try {
        // Make a POST request to the backend to generate words
        // const response = await axios.post(`${apiURL}/api/generateWords`, {
        //     language,
        //     promptTopic,
        //     shortWords,
        //     mediumWords,
        //     longWords,
        //     boardDimensions,
        // });
        //
        // const generatedWords = response.data.words || [];
        // console.log('generatedWords:', generatedWords);
        // return { initialData: generatedWords, boardDimensions, density };

    } catch (error) {
        console.error('Error fetching words from backend:', error);
    }

try {
    // Make a GET request to the backend to fetch words
    const response = await axios.get(`${apiURL}/api/getWords`, {});

    const generatedWords = response.data || {};
    const keys = Object.keys(generatedWords);
    if (keys.length === 0) {
        throw new Error('No words returned from backend');
    }

    console.log('keys.length:', keys.length);

    // Select a random key
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const wordsArray = generatedWords[randomKey];
    if (wordsArray.length === 0) {
        throw new Error('No words in the selected category');
    }

    const initialData = [];
    for (const word of wordsArray) {
        initialData.push(word);
    }

    console.log('initialData:', initialData);
    return { initialData, boardDimensions, density };

} catch (error) {
    console.error('Error fetching words from backend:', error);
    return { initialData: [], boardDimensions, density }; // Return an empty array or handle the error as needed
}
};