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
