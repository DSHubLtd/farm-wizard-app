import { useEffect, useState } from "react";
import axios from "axios";

// Add manually missed African languages here
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

export const useLanguageData = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await axios.get("https://restcountries.com/v3.1/all");

        const langSet = new Set();

        res.data.forEach((country) => {
          const langs = country.languages;
          if (langs) {
            Object.values(langs).forEach((lang) => langSet.add(lang));
          }
        });

        // Add the missing ones manually
        extraAfricanLanguages.forEach((lang) => langSet.add(lang));

        const formatted = Array.from(langSet)
          .map((lang) => ({
            label: lang,
            value: lang.toLowerCase().replace(/\s+/g, "-"),
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setLanguages(formatted);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { languages, loading };
};
