import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeLanguage } from '../Slices/LanguageSlice';
import classes from './LanguageSelector.module.css';

const LANGUAGES = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'am', name: 'Amharic', flag: '🇪🇹' }
];

const LanguageSelector = () => {
    const dispatch = useDispatch();
    const currentLangId = useSelector((state) => state.language.lang);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = LANGUAGES.find(l => l.id === currentLangId) || LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLangChange = (id) => {
        dispatch(changeLanguage(id));
        setIsOpen(false);
    };

    return (
        <div className={classes.container} ref={dropdownRef}>
            <button 
                className={classes.selectorBtn} 
                onClick={() => setIsOpen(!isOpen)}
                title="Change Language"
            >
                <span className={classes.flag}>{currentLang.flag}</span>
            </button>

            {isOpen && (
                <div className={classes.dropdown}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.id}
                            className={`${classes.langBtn} ${currentLangId === lang.id ? classes.activeLang : ''}`}
                            onClick={() => handleLangChange(lang.id)}
                        >
                            <span className={classes.flag}>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
