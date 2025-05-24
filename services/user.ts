import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "@/config/client";
const token = AsyncStorage.getItem("token");

export const getUser = async (id: string) => {
  try {
    const res = await client.get(`/user/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("GET Error:", error?.response?.data);
    throw error;
  }
};

export const updateUser = async (
  token: string,
  fullName: string,
  password: string,
  selectedIndex: string
) => {
  try {
    const res = await client.patch(
      `/user/update`,
      { fullName, newPassword: password, avatar: selectedIndex },
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("PATCH Error:", error?.response?.data);
    throw error;
  }
};

export const getUserPlantLevels = async (token: string) => {
  try {
    const res = await client.get(`/user-level/get-plant-levels`, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    console.error("Get user plant Error:", error?.response?.data);
    throw error;
  }
};
export const getUserPlantLevel = async (token: string, name: string) => {
  try {
    const res = await client.get(`/user-level/get-plant-level`, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
      params: { plantName: name },
    });
    return res.data;
  } catch (error: any) {
    console.error("Get user plant level Error:", error?.response?.data);
    throw error;
  }
};
export const updatePlantLevels = async (
  token: string,
  plantName: string,
  level: number,
  score: number
) => {
  try {
    const res = await client.patch(
      `/user-level/update`,
      { plantName, level, score },
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("user plant Error:", error?.response?.data);
    throw error;
  }
};

export const submitConversion = async (token: string, amount: number) => {
  try {
    const response = await client.post(
      "/user/submit-conversion",
      {
        amount,
      },
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error: any) {
    console.log("Error inside conversion method", error.message);
    throw error;
  }
};
export const deleteUser = async (token: string, email: string) => {
  try {
    const response = await client.delete(`/user/delete/${email}`, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error: any) {
    console.log("Error inside deleteuser method", error.message);
    throw error;
  }
};
