const express = require('express');
const { getConfig } = require('../controllers/configControllers');
const router = express.Router();

router.get('/config', getConfig);

router.get('/getWords', (req, res) => {
    const { topic, difficulty, language } = req.query;
    console.log('topic:', topic);
    res.json({ words: ['example1', 'example2'] }); // Datos estáticos para prueba
});

module.exports = router;
