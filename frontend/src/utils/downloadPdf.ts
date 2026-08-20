// Triggers a PDF "download" from a blob response in a way that also works on
// iOS Safari, where the <a download> attribute is silently ignored for blob:
// URLs — tapping the button there just does nothing visible. Opening the
// blob in a new tab instead lets the browser's own PDF viewer take over,
// which on mobile always exposes a native Share/Save button, and on desktop
// still shows a normal PDF with the browser's own download control.
export const openPdfBlob = (data: BlobPart, filename: string) => {
  const blob = new Blob([data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const win = window.open(url, "_blank");

  // Some browsers (older iOS Safari, popup-blocked contexts) return null
  // instead of opening the tab — fall back to the direct-download anchor,
  // which still works fine everywhere except the exact case this is for.
  if (!win) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Delay revocation so the new tab has time to actually load the blob.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
