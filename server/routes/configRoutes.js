const express = require('express');
const { getConfig } = require('../controllers/configControllers');
const { getWordsByCriteria } = require('../utils/getWords');
const router = express.Router();

// Route to get configuration
router.get('/config', getConfig);

// Route to get words by criteria
router.get('/getWords', (req, res) => {
    const { topic, difficulty, language } = req.query;

    console.log('Getting words by criteria:', topic, difficulty, language);

    try {
        const words = getWordsByCriteria(topic, difficulty, language);
        res.status(200).json({ words });
    } catch (error) {
        console.error('Error getting words by criteria:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;