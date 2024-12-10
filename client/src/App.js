import React, {useState, useEffect} from 'react';
import Config from './components/Config';
import Board from './components/Board';
import Footer from './components/Footer';
import {useTranslation} from 'react-i18next';
import './assets/global.css';
import './i18n/i18n';

function App() {
    const {t} = useTranslation();
    const [settings, setSettings] = useState({language: 'en', difficulty: '1', topic: 'random'});

    const handleSettingsChange = (newSettings) => {
        setSettings(newSettings);
    };

    return (
        <div className="App">
            <h1 className="app-title">{t('title')}</h1>
            <h2 className="app-subtitle">{t('subtitle')}</h2>
            <Config t={t} onSettingsChange={handleSettingsChange}/>
            <Board t={t} settings={settings}/>
            <Footer />
        </div>
    );
}

export default App;