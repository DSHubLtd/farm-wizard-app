import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, I18nManager } from "react-native";
import { Picker } from "@react-native-picker/picker";
import "../utils/i18n";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Updates from "expo-updates";
const LANGUAGE_KEY = "user-language";

export default function LanguageSwitching() {
  const { t, i18n } = useTranslation();
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState("English");
  const [loading, setLoading] = useState(false);
  const rtlLanguages = ["ar", "he"]; // Add more RTL languages if needed

  const languageMap = {
    English: "en",
    French: "fr",
    German: "de",
    Arabic: "ar",
    Hebrew: "he",
    Hausa: "ha",
    Yoruba: "yo",
    Igbo: "ig",
    Swahili: "sw",
    Zulu: "zu",
    Xhosa: "xh",
    Amharic: "am",
    Oromo: "om",
    Tigrinya: "ti",
    Lingala: "ln",
    Kinyarwanda: "rw",
    Luganda: "lg",
    Shona: "sn",
    Wolof: "wo",
    Ewe: "ee",
    Fula: "ff",
    Tswana: "tn",
    Berber: "ber", // Note: this may not have a single ISO code
  };

  // 🔁 Load saved language on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      const savedLangCode = await AsyncStorage.getItem(LANGUAGE_KEY);
      const savedLangName = Object.keys(languageMap).find(
        (key) => languageMap[key] === savedLangCode
      );
      if (savedLangCode && savedLangName) {
        await i18n.changeLanguage(savedLangCode);
        setSelectedLang(savedLangName);
      } else {
        setSelectedLang("English"); // default
      }

      await AsyncStorage.removeItem("user-language");

      // Remove all translation caches
      const keys = await AsyncStorage.getAllKeys();
      const translationKeys = keys.filter((key) =>
        key.startsWith("translations-")
      );
      await AsyncStorage.multiRemove(translationKeys);
    };
    loadSavedLanguage();
  }, []);

  // 🌍 Load language list from API
  useEffect(() => {
    const extraAfricanLanguages = [
      "Hausa",
      "Igbo",
      "Yoruba",
      "Amharic",
      "Oromo",
      "Tigrinya",
      "Shona",
      "Zulu",
      "Xhosa",
      "Tswana",
      "Wolof",
      "Ewe",
      "Fula",
      "Berber",
      "Lingala",
      "Kinyarwanda",
      "Luganda",
    ];

    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data) => {
        const langSet = new Set();

        // Extract from country languages
        data.forEach((country) => {
          if (country.languages) {
            Object.values(country.languages).forEach((lang) =>
              langSet.add(lang)
            );
          }
        });

        // Manually add African languages
        extraAfricanLanguages.forEach((lang) => langSet.add(lang));

        // Filter to only those available in languageMap
        const allLangs = Array.from(langSet);
        const filtered = allLangs.filter((lang) => languageMap[lang]);

        setLanguages(filtered);
        setLoading(false);
      });
  }, []);

  // 🌐 When language is changed by user

  const changeLanguage = async (langName) => {
    setLoading(true);
    const code = languageMap[langName];
    if (code) {
      const isRTL = rtlLanguages.includes(code);
      if (I18nManager.isRTL !== isRTL) {
        await I18nManager.forceRTL(isRTL);
        // Note: forceRTL requires app restart for layout to
        //Updates.reloadAsync(); // force app reload
        console.log("App needs to restart to apply RTL layout.");
      }

      await AsyncStorage.setItem(LANGUAGE_KEY, code); // persist
      await i18n.changeLanguage(code);
      setSelectedLang(langName);
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={{ fontSize: 24 }}>{t("edit_profile")}</Text>
          {/* <Text style={{ fontSize: 18 }}>
            {t("hello_user", { name: "John" })}
          </Text> */}
          <View className="bg-white rounded-2xl w-full ">
            <Picker
              selectedValue={selectedLang}
              onValueChange={(value) => changeLanguage(value)}
            >
              {languages.map((lang, index) => (
                <Picker.Item label={lang} value={lang} key={index} />
              ))}
            </Picker>
          </View>
        </>
      )}
    </View>
  );
}
