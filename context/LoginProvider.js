import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "@/config/client";
import { signOut } from "@/services/auth";

const LoginContext = createContext();

export const useLoginContext = () => useContext(LoginContext);

const CACHED_USER_KEY = "cachedUser";

const LoginProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persist the user so the session can be restored instantly on next launch,
  // even before (or without) the server confirming the token.
  useEffect(() => {
    if (user && user.email) {
      AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(user)).catch(
        () => {}
      );
    }
  }, [user]);

  const fetchUser = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    if (token === null) {
      setUser({});
      setIsLogged(false);
      setLoading(false);
      return;
    }

    // Optimistically restore the last known session so the user stays signed
    // in across restarts and slow/offline starts.
    try {
      const cached = await AsyncStorage.getItem(CACHED_USER_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
        setIsLogged(true);
      }
    } catch (e) {
      // ignore cache parse errors
    }
    setLoading(false);

    // Validate / refresh against the server in the background.
    try {
      const res = await client.get("/user/user", {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        setIsLogged(true);
      } else {
        // Token explicitly rejected — sign out for real.
        await signOut();
        await AsyncStorage.removeItem(CACHED_USER_KEY);
        setUser({});
        setIsLogged(false);
      }
    } catch (error) {
      // Network/server error: keep the user signed in with the cached session
      // instead of forcing a re-login.
      console.log("Session validation deferred:", error?.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <LoginContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        setLoading,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginProvider;
