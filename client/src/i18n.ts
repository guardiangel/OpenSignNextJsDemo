import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n.use(HttpBackend)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        fallbackLng: 'en', // Fallback to English if no other language is detected
        detection: {
            // Specifies the default language to fall back to if the detected language is not available.
            order: ['localStorage', 'navigator'],
            // Defines where the detected language should be cached.
            caches: ['localStorage'],
        },
        ns: ['translation'], // default namespace
        defaultNS: 'translation', // default namespace
        //Enables debug mode, which outputs detailed logs to the console about the translation process.
        debug: false,
        interpolation: {
            escapeValue: false, // Not needed for react as it escapes by default
        },
        supportedLngs: ['en', 'es', 'fr'], // List of allowed languages
    });

export default i18n;
