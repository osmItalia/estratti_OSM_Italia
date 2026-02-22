import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "it",
        lng: "it",
        backend: {
            loadPath: "/locales/{{lng}}.json"
        },
        detection: { order: ["localStorage", "navigator"] },
        interpolation: { escapeValue: false },
        react: {
            useSuspense: false
        }
    });

export default i18n;
