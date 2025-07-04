// controllers/payment.controller.ts
import { RequestHandler } from "express";
import * as PaymentService from "../payment/payment.service";
import { CreatePaymentValidator, UpdatePaymentStatusValidator } from "../payment/payment.validator";

export const createPayment: RequestHandler = async (req, res) => {
  const parsed = CreatePaymentValidator.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const payment = await PaymentService.createPayment(parsed.data);
  res.status(201).json(payment);
  return;
};

export const getAllPayments: RequestHandler = async (_req, res) => {
  const payments = await PaymentService.getAllPayments();
  res.json(payments);
  return;
};

export const getPaymentById: RequestHandler = async (req, res) => {
  const paymentId = Number(req.params.id);
  const payment = await PaymentService.getPaymentById(paymentId);
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  res.json(payment);
  return;
};

export const updatePaymentStatus: RequestHandler = async (req, res) => {
  const parsed = UpdatePaymentStatusValidator.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const payment = await PaymentService.updatePaymentStatus(Number(req.params.id), parsed.data.paymentStatus);
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  res.json(payment);
  return;
};

export const deletePayment: RequestHandler = async (req, res) => {
  await PaymentService.deletePayment(Number(req.params.id));
  res.status(204).send();
  return;
};
