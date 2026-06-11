import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/config/client";
import { localCountries } from "@/constants/fallbackData";

export const useCountryData = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/v1/external-apis/countries`
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCountries(res.data);
        } else {
          setCountries(localCountries);
        }
      } catch (err) {
        console.warn("API fetch failed, using local fallback.");
        setCountries(localCountries); // fallback to local data
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading };
};
