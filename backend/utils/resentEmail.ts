import { Resend } from "resend";
import { PDFGenerator } from "./pdfGenerator";

export const sendInvoiceEmail = async (invoice: any) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const pdfBuffer = await PDFGenerator(invoice);

  await resend.emails.send({
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
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  await resend.emails.send({
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
};
