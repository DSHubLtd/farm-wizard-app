import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
// import localCountries from "../assets/data/countries.json"; // 👈 Import JSON directly

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

        // const res = await axios.get("https://restcountries.com/v3.1/all");
        let res;
        try {
          // Primary attempt
          res = await axios.get("https://restcountries.com/v3.1/all");
        } catch (primaryError) {
          console.warn(
            "Primary API failed, trying fallback:",
            primaryError.message
          );
          // Fallback attempt
          res = await axios.get("https://restcountries.com/v2/all");
        }
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
        console.error("Failed to fetch countries:", error, error.config);
      } finally {
        setLoading(false);
      }
    };
    /* const fetchCountries = async () => {
      try {
        const cached = await AsyncStorage.getItem(COUNTRY_CACHE_KEY);
        if (cached) {
          setCountries(JSON.parse(cached));
          setLoading(false);
          return;
        }

        let data;

        try {
          const res = await axios.get("https://restcountries.com/v3.1/all");
          data = res.data;
        } catch (err) {
          console.warn("API fetch failed, using local fallback.");
          data = localCountries; // 👈 Use static import fallback
        }

        const formatted = data
          .map((country) => ({
            label: country.name?.common || country.name,
            value: (country.cca2 || country.code)?.toLowerCase(),
            flag: country.flags?.png || "", // Optional: fallback flag logic
          }))
          .filter((c) => c.label && c.value)
          .sort((a, b) => a.label.localeCompare(b.label));

        console.log("Formatted countries for SelectField:", formatted);

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
    };*/

    fetchCountries();
  }, []);

  return { countries, loading };
};
