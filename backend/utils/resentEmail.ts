import nodemailer from "nodemailer";
import { PDFGenerator } from "./pdfGenerator";

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

export const sendInvoiceEmail = async (invoice: any) => {
  const pdfBuffer = await PDFGenerator(invoice);

  await getTransporter().sendMail({
    from: process.env.GMAIL_USER,
    to: invoice.clientEmail,
    subject: `Invoice ${invoice.invoiceNo} from Your Business`,
    html: `<p>Dear ${invoice.clientName},</p>
           <p>Please find your invoice <strong>${invoice.invoiceNo}</strong> attached.</p>
           <p>Total Amount: <strong>€${invoice.total}</strong></p>
           <p>Thank you for your business.</p>`,
    attachments: [
      {
        filename: `${invoice.invoiceNo}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
) => {
  const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
  const verifyLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

  await getTransporter().sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Verify your email address",
    html: `
      <p>Welcome! Please confirm your email address to activate your account.</p>
      <p>Click the link below — it expires in 24 hours.</p>
      <a href="${verifyLink}">Verify Email</a>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
) => {
  const baseUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  await getTransporter().sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below — it expires in 1 hour.</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};