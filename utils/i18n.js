import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Map your translation base URL
const BASE_URL = "https://farm-wizard-api-n68r.onrender.com/translations/";
// const BASE_URL =
//   "https://raw.githubusercontent.com/your-username/expo-translations/main/";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: [
      "en",
      "fr",
      "de",
      "ar",
      "he",
      "es",
      "pt",
      "id",
      "zh",
      "hi",
      "ru",
      "ha",
      "yo",
      "ig",
      "sw",
    ],
    load: "languageOnly", // e.g. 'en-US' becomes 'en'
    lng: "en",
    debug: false, // turn off logs
    missingKeyHandler: false, // disable missing key logs
    backend: {
      loadPath: `${BASE_URL}{{lng}}.json`,
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    // Custom caching logic
    // saveMissing: false,
    // initImmediate: false,
  });

// Custom caching manually using AsyncStorage
i18n.services.backendConnector.backend.read = async function (
  language,
  namespace,
  callback
) {
  try {
    const cached = await AsyncStorage.getItem(`translations-${language}`);
    if (cached) {
      callback(null, JSON.parse(cached));
      return;
    }

    const response = await fetch(`${BASE_URL}${language}.json`);
    const data = await response.json();
    await AsyncStorage.setItem(
      `translations-${language}`,
      JSON.stringify(data)
    );
    callback(null, data);
  } catch (err) {
    callback(err, false);
  }
};

export default i18n;
