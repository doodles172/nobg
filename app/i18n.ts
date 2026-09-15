import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import nl from "./locales/nl.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";

export const resources = {
  en: { translation: en },
  nl: { translation: nl },
  fr: { translation: fr },
  de: { translation: de },
} as const;

export const supportedLngs = Object.keys(resources) as (keyof typeof resources)[];

export function detectLangFromHeader(acceptLanguage: string | null) {
  const lang = acceptLanguage
    ?.split(",")[0]
    ?.split("-")[0]
    ?.toLowerCase();
  return supportedLngs.includes(lang as (typeof supportedLngs)[number])
    ? (lang as (typeof supportedLngs)[number])
    : "en";
}

if (!i18next.isInitialized) {
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs,
      detection: {
        order: ["navigator"],
        caches: ["localStorage"],
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

export default i18next;
