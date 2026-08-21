import { openPdfBlob } from "./downloadPdf";

// WhatsApp's click-to-chat link (wa.me) can only pre-fill a text message —
// it has no way to attach a file, so the PDF still has to be downloaded and
// attached by hand on the WhatsApp side. This just gets the chat open with
// the right number and a ready-made message.
export const shareOnWhatsApp = (contactNumber: string | undefined, message: string) => {
  const digits = (contactNumber ?? "").replace(/\D/g, "");
  if (!digits) {
    alert("No WhatsApp number on file for this client.");
    return;
  }
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

// Shares the invoice PDF with the file actually attached, via the OS share
// sheet (navigator.share) — this is the only web API that can hand a file to
// WhatsApp directly, and it's only available on browsers/devices that
// support file sharing (mainly mobile). Where it isn't available, there is
// no way to pre-attach the file, so we fall back to downloading the PDF and
// opening the wa.me chat with just the text message.
export const shareInvoicePdf = async (
  pdfData: Blob,
  filename: string,
  contactNumber: string | undefined,
  message: string,
) => {
  const file = new File([pdfData], filename, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: message });
      return;
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
    }
  }

  openPdfBlob(pdfData, filename);
  shareOnWhatsApp(contactNumber, message);
};
