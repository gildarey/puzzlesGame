import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../assets/Config.css';

const Config = ({ t, onSettingsChange }) => {
    const { i18n } = useTranslation();
    const [config, setConfig] = useState({});
    const [language, setLanguage] = useState(i18n.language);
    const [theme, setTheme] = useState('Light');
    const [difficulty, setDifficulty] = useState('Easy');
    const [topic, setTopic] = useState('None');

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL;
        axios.get(`${apiUrl}/api/config`)
            .then(response => {
                setConfig(response.data);
            })
            .catch(error => console.error('Error fetching config:', error));
    }, []);

    useEffect(() => {
        const themes = t('config.themes', { returnObjects: true });
        console.log('Config:', themes);
        document.body.classList.toggle('dark-theme', theme === themes[1]);
    }, [theme, t]);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setLanguage(lang);
        onSettingsChange({ language: lang, difficulty, topic });
    };

    const handleDifficultyChange = (e) => {
        setDifficulty(e.target.value);
        onSettingsChange({ language, difficulty: e.target.value, topic });
    };

    const handleTopicChange = (e) => {
        setTopic(e.target.value);
        onSettingsChange({ language, difficulty, topic: e.target.value });
    };

    useEffect(() => {
        setLanguage(i18n.language);
    }, [i18n.language]);

    return (
        <div className="config-container">
            <h2>{t('config.title')}</h2>
            <div className="config-row">
                <div className="config-item">
                    <label>{t('config.language')}</label>
                    <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
                        <option value="en">{t('config.languages.english')}</option>
                        <option value="es">{t('config.languages.spanish')}</option>
                    </select>
                </div>
                <div className="config-item">
                    <label>{t('config.theme')}</label>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                        {t('config.themes', { returnObjects: true }).map((theme, index) => (
                            <option key={index} value={theme}>{theme}</option>
                        ))}
                    </select>
                </div>
                <div className="config-item">
                    <label>{t('config.difficulty')}</label>
                    <select value={difficulty} onChange={handleDifficultyChange} disabled>
                        {t('config.difficulties', { returnObjects: true }).map((level, index) => (
                            <option key={index} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
                <div className="config-item">
                    <label>{t('config.topic')}</label>
                    <select value={topic} onChange={handleTopicChange} disabled>
                        {t('config.topics', { returnObjects: true }).map((topic, index) => (
                            <option key={index} value={topic}>{topic}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Config;