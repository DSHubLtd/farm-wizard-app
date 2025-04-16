import client from "@/config/client";

export const getUser = async (id: string) => {
  try {
    const res = await client.get(`/user/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("GET Error:", error?.response?.data);
    throw error;
  }
};

export const updateUser = async (id: string, updates: any) => {
  try {
    const res = await client.patch(`/user/${id}`, updates);
    return res.data;
  } catch (error: any) {
    console.error("PATCH Error:", error?.response?.data);
    throw error;
  }
};
