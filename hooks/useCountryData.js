import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/config/client";

export const useCountryData = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/v1/external-apis/countries`
        );
        setCountries(res.data);
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
