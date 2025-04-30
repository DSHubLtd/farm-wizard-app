import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const COUNTRY_CACHE_KEY = "countryList";

export const useCountryData = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const cached = await AsyncStorage.getItem(COUNTRY_CACHE_KEY);
        if (cached) {
          setCountries(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const res = await axios.get("https://restcountries.com/v3.1/all");
        const formatted = res.data
          .map((country) => ({
            label: country.name.common,
            value: country.cca2.toLowerCase(),
            flag: country.flags?.png,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        await AsyncStorage.setItem(
          COUNTRY_CACHE_KEY,
          JSON.stringify(formatted)
        );
        setCountries(formatted);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading };
};
