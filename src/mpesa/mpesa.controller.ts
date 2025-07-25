// // src/controllers/mpesaController.ts

// import { Request, Response } from "express";
// import { getAccessToken, initiateSTKPush, STKPushPayload } from "../services/mpesaService";

// export const stkPush = async (req: Request, res: Response) => {
//   try {
//     const { phone, amount } = req.body;

//     const accessToken = await getAccessToken();

//     const timestamp = new Date()
//       .toISOString()
//       .replace(/[^0-9]/g, "")
//       .slice(0, -3);

//     const password = Buffer.from(
//       `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
//     ).toString("base64");

//     const payload: STKPushPayload = {
//       BusinessShortCode: process.env.MPESA_SHORTCODE!,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: "CustomerPayBillOnline",
//       Amount: Number(amount),
//       PartyA: phone,
//       PartyB: process.env.MPESA_SHORTCODE!,
//       PhoneNumber: phone,
//       CallBackURL: process.env.MPESA_CALLBACK_URL!,
//       AccountReference: "HotelBooking",
//       TransactionDesc: "Hotel Booking Payment",
//     };

//     const result = await initiateSTKPush(payload, accessToken);

//     res.status(200).json({
//       message: "STK Push initiated",
//       response: result,
//     });
//   } catch (error) {
//     console.error("M-Pesa STK Push Error:", error);
//     res.status(500).json({
//       message: "Failed to initiate STK Push",
//       error: (error as Error).message,
//     });
//   }
// };

// export const mpesaCallback = async (req: Request, res: Response) => {
//   console.log("✅ M-Pesa Callback received:", JSON.stringify(req.body, null, 2));

//   // TODO: verify & update booking/payment status in DB
//   res.status(200).json({ message: "Callback received successfully" });
// };
