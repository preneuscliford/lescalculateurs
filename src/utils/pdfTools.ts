let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function loadPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjsLib;
    })();
  }
  return pdfjsLibPromise;
}

async function loadJsPdf() {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
}

async function loadPdfLib() {
  return import("pdf-lib");
}

/** Fusionne plusieurs fichiers PDF (dans l'ordre donné) en un seul PDF. */
export async function mergePdfs(files: File[]): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const source = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const bytes = await merged.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export type CompressLevel = "leger" | "moyen" | "fort";

const COMPRESS_SETTINGS: Record<CompressLevel, { scale: number; quality: number }> = {
  leger: { scale: 1.5, quality: 0.8 },
  moyen: { scale: 1.15, quality: 0.6 },
  fort: { scale: 0.9, quality: 0.4 },
};

/**
 * Compresse un PDF en le re-rasterisant page par page (via pdf.js) puis en
 * reconstruisant un nouveau PDF avec des images JPEG compressées (via jsPDF).
 * Efficace sur les PDF scannés/issus de photos ; le texte perd sa
 * sélectionnabilité (attendu, cf. avertissement affiché à l'utilisateur).
 */
export async function compressPdf(
  file: File,
  level: CompressLevel,
): Promise<{ blob: Blob; originalSize: number; newSize: number }> {
  const pdfjsLib = await loadPdfjs();
  const jsPDF = await loadJsPdf();
  const { scale, quality } = COMPRESS_SETTINGS[level];

  const bytes = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;

  let outputPdf: InstanceType<typeof jsPDF> | null = null;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Contexte canvas indisponible");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", quality);

    const orientation = viewport.width > viewport.height ? "l" : "p";
    const sizePt = [viewport.width * 0.75, viewport.height * 0.75] as [number, number];

    if (!outputPdf) {
      outputPdf = new jsPDF({ orientation, unit: "pt", format: sizePt });
    } else {
      outputPdf.addPage(sizePt, orientation);
    }
    outputPdf.addImage(dataUrl, "JPEG", 0, 0, sizePt[0], sizePt[1]);
  }

  if (!outputPdf) throw new Error("PDF vide");

  const blob = outputPdf.output("blob");
  return { blob, originalSize: file.size, newSize: blob.size };
}

/** Applique un rendu "scan" simple (niveaux de gris + contraste renforcé) sur un canvas. */
function applyScanEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const contrast = 1.35;
  const midpoint = 128;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const adjusted = (gray - midpoint) * contrast + midpoint;
    const clamped = Math.max(0, Math.min(255, adjusted));
    data[i] = clamped;
    data[i + 1] = clamped;
    data[i + 2] = clamped;
  }

  ctx.putImageData(imageData, 0, 0);
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = dataUrl;
  });
}

/** Convertit une ou plusieurs images (photos de documents) en un PDF, une image par page. */
export async function imagesToPdf(files: File[], enhance: boolean): Promise<Blob> {
  const jsPDF = await loadJsPdf();
  let outputPdf: InstanceType<typeof jsPDF> | null = null;

  for (const file of files) {
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Contexte canvas indisponible");

    ctx.drawImage(img, 0, 0);
    if (enhance) applyScanEffect(ctx, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const orientation = canvas.width > canvas.height ? "l" : "p";
    const sizePt = [canvas.width * 0.75, canvas.height * 0.75] as [number, number];

    if (!outputPdf) {
      outputPdf = new jsPDF({ orientation, unit: "pt", format: sizePt });
    } else {
      outputPdf.addPage(sizePt, orientation);
    }
    outputPdf.addImage(dataUrl, "JPEG", 0, 0, sizePt[0], sizePt[1]);
  }

  if (!outputPdf) throw new Error("Aucune image fournie");
  return outputPdf.output("blob");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
