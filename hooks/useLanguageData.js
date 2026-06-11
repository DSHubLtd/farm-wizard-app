import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/config/client";
import { localLanguages } from "@/constants/fallbackData";

export const useLanguageData = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        // Fetch language data from your backend API
        const res = await axios.get(
          `${API_BASE}/api/v1/external-apis/languages`
        );

        if (Array.isArray(res.data) && res.data.length > 0) {
          setLanguages(res.data); // Set the languages returned from your backend
        } else {
          setLanguages(localLanguages);
        }
      } catch (error) {
        console.warn("Failed to fetch languages, using local fallback:", error?.message);
        setLanguages(localLanguages); // fallback to local data
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { languages, loading };
};
