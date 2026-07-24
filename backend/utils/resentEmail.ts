import { Resend } from "resend";
import { PDFGenerator } from "./pdfGenerator";

export const sendInvoiceEmail = async (invoice: any) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const pdfBuffer = await PDFGenerator(invoice);

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev", // use this until you verify a domain
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

  if (error) {
    console.error("Resend failed to send invoice email:", error);
    throw new Error(error.message);
  }
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
  const verifyLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email address",
    html: `
      <p>Welcome! Please confirm your email address to activate your account.</p>
      <p>Click the link below — it expires in 24 hours.</p>
      <a href="${verifyLink}">Verify Email</a>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Resend failed to send verification email:", error);
    throw new Error(error.message);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below — it expires in 1 hour.</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Resend failed to send password reset email:", error);
    throw new Error(error.message);
  }
};
