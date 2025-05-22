import client from "@/config/client";

export const submitWithdrwal = async (
  amount: number,
  destination: string,
  provider: string,
  withdrawType: string,
  reference: string,
  network: string,
  token: string
) => {
  try {
    const response = await client.post(
      "/withdrawal/request",
      {
        amount,
        destination,
        provider,
        withdrawType,
        reference,
        network,
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
    console.log("Error inside withdrawal method", error.message);
    throw error;
  }
};
