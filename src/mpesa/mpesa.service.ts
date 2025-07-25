// // src/services/mpesaService.ts

// import axios from "axios";

// export interface STKPushPayload {
//   BusinessShortCode: string;
//   Password: string;
//   Timestamp: string;
//   TransactionType: string;
//   Amount: number;
//   PartyA: string;
//   PartyB: string;
//   PhoneNumber: string;
//   CallBackURL: string;
//   AccountReference: string;
//   TransactionDesc: string;
// }

// export async function getAccessToken(): Promise<string> {
//   const auth = Buffer.from(
//     `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
//   ).toString("base64");

//   const response = await axios.get(
//     "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
//     {
//       headers: {
//         Authorization: `Basic ${auth}`,
//       },
//     }
//   );

//   return response.data.access_token;
// }

// export async function initiateSTKPush(payload: STKPushPayload, accessToken: string) {
//   const response = await axios.post(
//     "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
//     payload,
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );

//   return response.data;
// }
