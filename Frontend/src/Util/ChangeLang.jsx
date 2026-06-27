import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import languageData from './LanguageData';

const useTranslate = () => {
    const langId = useSelector((state) => state.language.lang);

    const translate = useCallback((key) => {
        if (!key) return key;

        const normalizedKey = key.toLowerCase();

        // If language is English ('en'), return original key
        if (langId === 'en') return key;

        // If language is Amharic ('am'), return translation if exists
        if (langId === 'am') {
            return languageData[normalizedKey] || key;
        }

        // Default fallback
        return key;
    }, [langId]);

    return translate;
};

export default useTranslate;
