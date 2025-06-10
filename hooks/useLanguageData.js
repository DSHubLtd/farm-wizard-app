import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/config/client";

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

        setLanguages(res.data); // Set the languages returned from your backend
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
