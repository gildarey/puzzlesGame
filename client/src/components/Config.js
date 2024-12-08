import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import '../assets/Config.css';

const Config = ({t, onSettingsChange}) => {
    const {i18n} = useTranslation();
    const [config, setConfig] = useState({});
    const [language, setLanguage] = useState(i18n.language);
    const [theme, setTheme] = useState('Light');
    const [difficulty, setDifficulty] = useState(1);
    const [topic, setTopic] = useState('random');

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL;
        axios.get(`${apiUrl}/api/config`)
            .then(response => {
                setConfig(response.data);
            })
            .catch(error => console.error('Error fetching config:', error));
    }, []);

    useEffect(() => {
        const themes = t('config.themes', {returnObjects: true});
        document.body.classList.toggle('dark-theme', theme === themes[1]);
    }, [theme, t]);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setLanguage(lang);
        onSettingsChange({language: lang, difficulty, topic});
    };

    const handleDifficultyChange = (e) => {
        setDifficulty(parseInt(e.target.value, 10));
        onSettingsChange({language, difficulty: parseInt(e.target.value, 10), topic});
    };

    const handleTopicChange = (e) => {
        setTopic(e.target.value);
        onSettingsChange({language, difficulty, topic: e.target.value});
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
                        {t('config.themes', {returnObjects: true}).map((theme, index) => (
                            <option key={index} value={theme}>{theme}</option>
                        ))}
                    </select>
                </div>
                <div className="config-item">
                    <label>{t('config.difficulty')}</label>
                    <select value={difficulty} onChange={handleDifficultyChange}>
                        <option value="1">{t('config.difficulties.1')}</option>
                        <option value="2">{t('config.difficulties.2')}</option>
                        <option value="3">{t('config.difficulties.3')}</option>
                    </select>
                </div>
                <div className="config-item">
                    <label>{t('config.topic')}</label>
                    <select value={topic} onChange={handleTopicChange}>
                        {Object.keys(t('config.topics', {returnObjects: true})).map((key) => (
                            <option key={key} value={key}>{t(`config.topics.${key}`)}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Config;