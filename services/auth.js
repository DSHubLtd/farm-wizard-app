import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "@/config/client";

export const signUpUser = async (
  fullName,
  email,
  password
  // notification_token
) => {
  try {
    const response = await client.post(
      "/auth/register",
      {
        fullName,
        email,
        password,
        notification_token: "totif-token",
      },
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      const token = response.data.token;
      //await AsyncStorage.setItem("token", token);
    }
    return response;
  } catch (error) {
    console.log("Error inside singup method", error.message);
  }
};

export const signInUser = async (email, password) => {
  try {
    const response = await client.post(
      "/auth/login",
      {
        email,
        password,
      },
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.success === true) {
      const token = response.data.data.token;
      await AsyncStorage.setItem("token", token);
    }

    return response;
  } catch (error) {
    console.log("Error inside singin method", error.message);
  }
};

export const signOut = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      const res = await client.get("sign-out", {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      if (res.data.success) {
        await AsyncStorage.removeItem("token");
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log("Error inside signout method", error.message);
    return false;
  }
};
