import { snapdom } from "@zumer/snapdom";
import { jsPDF } from "jspdf";

const JPEG_QUALITY = 0.95;
const EXPORT_SCALE = 2; // 2x for crisp prints

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Renders the quote element to a high-res canvas (white background so JPEG
 * has no transparency).
 */
async function quoteToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  return snapdom.toCanvas(el, {
    format: "jpeg",
    scale: EXPORT_SCALE,
    backgroundColor: "#ffffff",
    quality: JPEG_QUALITY,
  });
}

export async function exportQuoteJpeg(
  el: HTMLElement,
  filename: string,
): Promise<void> {
  const canvas = await quoteToCanvas(el);
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  triggerDownload(dataUrl, `${filename}.jpg`);
}

export async function exportQuotePdf(
  el: HTMLElement,
  filename: string,
): Promise<void> {
  const canvas = await quoteToCanvas(el);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pageWidth = 210; // mm
  const pageHeight = 297; // mm
  const imgWidthMm = pageWidth;
  const imgHeightMm = canvas.height * (imgWidthMm / canvas.width);

  // Slice the tall canvas across multiple A4 pages when needed.
  const sliceCanvas = document.createElement("canvas");
  sliceCanvas.width = canvas.width;
  const pages = Math.max(1, Math.ceil(imgHeightMm / pageHeight));

  for (let p = 0; p < pages; p++) {
    if (p > 0) pdf.addPage();
    const sliceHeightMm = Math.min(pageHeight, imgHeightMm - p * pageHeight);
    const srcH = Math.round(sliceHeightMm * (canvas.width / pageWidth));
    const srcY = Math.round(p * pageHeight * (canvas.width / pageWidth));

    sliceCanvas.height = srcH;
    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sliceCanvas.width, srcH);
    ctx.drawImage(
      canvas,
      0,
      srcY,
      canvas.width,
      srcH,
      0,
      0,
      sliceCanvas.width,
      srcH,
    );

    pdf.addImage(
      sliceCanvas.toDataURL("image/jpeg", JPEG_QUALITY),
      "JPEG",
      0,
      0,
      pageWidth,
      sliceHeightMm,
    );
  }

  pdf.save(`${filename}.pdf`);
}
