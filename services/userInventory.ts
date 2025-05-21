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

export const getUserPIventory = async (token: string) => {
  try {
    const res = await client.get(`/user/inventory`, {
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

export const updateInventory = async (
  token: string,
  item: string,
  amount: number
) => {
  try {
    const res = await client.patch(
      `/user/reduce-qty`,
      { name: item, amount },
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("User Inventory Error:", error?.response?.data);
    throw error;
  }
};
export const addToInventory = async (
  // add items to user inventor as gift
  token: string,
  item: string,
  amount: number
) => {
  try {
    const res = await client.patch(
      `/user/add-qty`,
      { name: item, amount },
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("User Inventory Error:", error?.response?.data);
    throw error;
  }
};
