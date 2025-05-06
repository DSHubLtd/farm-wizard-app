import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "@/config/client";
import { signOut } from "@/services/auth";

const LoginContext = createContext();

export const useLoginContext = () => useContext(LoginContext);

const LoginProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    if (token !== null) {
      const res = await client.get("/user/user", {
        headers: {
          // Authorization: `Bearer ${token}`,
          Authorization: `JWT ${token}`,
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        setIsLogged(true);
      } else {
        await signOut();
        setUser({});
        setIsLogged(false);
      }
      setLoading(false);
    } else {
      setUser({});
      setIsLogged(false);
      setLoading(false);
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
