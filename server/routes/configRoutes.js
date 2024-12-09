const express = require('express');
const { getConfig } = require('../controllers/configControllers');
const router = express.Router();

router.get('/config', getConfig);

router.get('/getWords', (req, res) => {
    const { topic, difficulty, language } = req.query;
    res.json({ words: [
                {
                    "word": "SOL",
                    "hint": "Estrella en el centro del sistema solar."
                },
                {
                    "word": "LUNA",
                    "hint": "Satélite natural de la Tierra."
                },
                {
                    "word": "ATOMO",
                    "hint": "Unidad básica de la materia."
                },
                {
                    "word": "CELULA",
                    "hint": "Unidad básica de los seres vivos."
                },
                {
                    "word": "AGUA",
                    "hint": "Compuesto químico esencial para la vida."
                },
                {
                    "word": "FUEGO",
                    "hint": "Proceso de combustión que produce luz y calor."
                },
                {
                    "word": "ENERGIA",
                    "hint": "Capacidad para realizar trabajo."
                },
                {
                    "word": "GRAVEDAD",
                    "hint": "Fuerza que atrae los objetos hacia el centro de la Tierra."
                },
                {
                    "word": "PLANETA",
                    "hint": "Cuerpo celeste que orbita una estrella."
                },
                {
                    "word": "QUIMICA",
                    "hint": "Ciencia que estudia la composición de la materia."
                }
            ]
        },
        {
            "difficulty": "3",
            "language": "en",
            "words": [
                {
                    "word": "SUN",
                    "hint": "Star at the center of the solar system."
                },
                {
                    "word": "MOON",
                    "hint": "Natural satellite of the Earth."
                },
                {
                    "word": "ATOM",
                    "hint": "Basic unit of matter."
                },
                {
                    "word": "CELL",
                    "hint": "Basic unit of living organisms."
                },
                {
                    "word": "WATER",
                    "hint": "Chemical compound essential for life."
                },
                {
                    "word": "FIRE",
                    "hint": "Combustion process that produces light and heat."
                },
                {
                    "word": "ENERGY",
                    "hint": "Capacity to do work."
                },
                {
                    "word": "GRAVITY",
                    "hint": "Force that attracts objects towards the center of the Earth."
                },
                {
                    "word": "PLANET",
                    "hint": "Celestial body orbiting a star."
                },
                {
                    "word": "CHEMISTRY",
                    "hint": "Science that studies the composition of matter."
                }
            ] }); // Datos estáticos para prueba
});

module.exports = router;
