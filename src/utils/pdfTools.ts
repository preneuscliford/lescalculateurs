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

/**
 * Génère une vignette (page 1) et le nombre de pages d'un fichier PDF, pour
 * prévisualisation avant fusion/compression.
 */
export async function getPdfInfo(
  file: File,
  maxWidth = 160,
): Promise<{ thumbnailDataUrl: string; pageCount: number }> {
  const pdfjsLib = await loadPdfjs();
  const bytes = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;

  const page = await doc.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte canvas indisponible");

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  return { thumbnailDataUrl: canvas.toDataURL("image/jpeg", 0.72), pageCount: doc.numPages };
}

/** Fusionne plusieurs fichiers PDF (dans l'ordre donné) en un seul PDF. */
export async function mergePdfs(files: File[]): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let source;
    try {
      source = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(`« ${file.name} » n'a pas pu être lu (${reason}).`);
    }
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

/** Représentation d'un document PDF chargé pour édition page par page (pdf.js). */
export type PdfForEditing = import("pdfjs-dist").PDFDocumentProxy;

/** Charge un PDF pour un rendu page par page (édition), sans le convertir. */
export async function loadPdfForEditing(file: File): Promise<PdfForEditing> {
  const pdfjsLib = await loadPdfjs();
  const bytes = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: bytes }).promise;
}

/** Rend une page du document dans le canvas fourni, à la largeur cible demandée (px). */
export async function renderPageToCanvas(
  doc: PdfForEditing,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth: number,
): Promise<{ widthPt: number; heightPt: number }> {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte canvas indisponible");

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return { widthPt: baseViewport.width, heightPt: baseViewport.height };
}

export interface TextEdit {
  type: "text";
  xFrac: number;
  yFrac: number;
  text: string;
  fontSize: number;
  color: [number, number, number];
}

export interface RectEdit {
  type: "rect";
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
}

export interface ImageEdit {
  type: "image";
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
  /** Data URL PNG (ex. signature dessinée à la main), fond transparent. */
  dataUrl: string;
}

/**
 * Remplacement d'un morceau de texte déjà présent dans le PDF : coordonnées
 * absolues en points PDF (pas des fractions), extraites directement de
 * pdf.js (item.transform / item.width / item.height), indépendantes de
 * l'échelle d'affichage. Le rendu original n'est pas retiré du flux du PDF
 * (ce n'est pas possible simplement avec pdf-lib) : une zone blanche est
 * dessinée par-dessus avant d'écrire le nouveau texte, à la même position.
 */
export interface TextReplaceEdit {
  type: "textReplace";
  xPt: number;
  yBaselinePt: number;
  widthPt: number;
  heightPt: number;
  text: string;
  fontSize: number;
}

/** Édits "ajoutés" par l'utilisateur (positionnés en fractions de page, déplaçables/redimensionnables). */
export type AddedPageEdit = TextEdit | RectEdit | ImageEdit;

export type PageEdit = AddedPageEdit | TextReplaceEdit;

export interface DetectedTextItem {
  /** Index dans le tableau retourné (pas l'index brut pdf.js : un item peut regrouper plusieurs fragments). */
  index: number;
  str: string;
  /** Coin bas-gauche approx. en points PDF (repère bas-gauche, comme pdf-lib). */
  xPt: number;
  yBaselinePt: number;
  widthPt: number;
  heightPt: number;
  fontSize: number;
}

interface RawTextFragment {
  str: string;
  xPt: number;
  yBaselinePt: number;
  widthPt: number;
  heightPt: number;
  fontSize: number;
}

/**
 * Regroupe les fragments de texte bruts de pdf.js en "lignes" éditables :
 * pdf.js segmente souvent une phrase en plusieurs items (par mot, ou selon
 * les changements de police), ce qui rendrait l'édition fastidieuse si
 * chaque fragment restait un élément séparé. On fusionne les fragments qui
 * partagent à peu près la même ligne de base (yBaselinePt proche, tolérance
 * relative à la taille de police) et qui se suivent horizontalement sans
 * trou important.
 */
function groupFragmentsIntoLines(fragments: RawTextFragment[]): DetectedTextItem[] {
  const sorted = [...fragments].sort((a, b) => b.yBaselinePt - a.yBaselinePt || a.xPt - b.xPt);
  const groups: RawTextFragment[][] = [];

  for (const frag of sorted) {
    const last = groups.at(-1);
    const prevFrag = last?.at(-1);
    const sameLine = prevFrag && Math.abs(prevFrag.yBaselinePt - frag.yBaselinePt) < Math.max(frag.fontSize, prevFrag.fontSize) * 0.35;
    const closeEnough = prevFrag && frag.xPt - (prevFrag.xPt + prevFrag.widthPt) < Math.max(frag.fontSize, prevFrag.fontSize) * 1.2;

    if (last && sameLine && closeEnough) {
      last.push(frag);
    } else {
      groups.push([frag]);
    }
  }

  return groups.map((group, index) => {
    const first = group[0];
    const last = group.at(-1)!;
    const needsSpace = (a: RawTextFragment, b: RawTextFragment) => b.xPt - (a.xPt + a.widthPt) > a.fontSize * 0.15;
    let str = first.str;
    for (let i = 1; i < group.length; i++) {
      str += (needsSpace(group[i - 1], group[i]) ? " " : "") + group[i].str;
    }
    return {
      index,
      str,
      xPt: first.xPt,
      yBaselinePt: first.yBaselinePt,
      widthPt: last.xPt + last.widthPt - first.xPt,
      heightPt: Math.max(...group.map((f) => f.heightPt)),
      fontSize: Math.max(...group.map((f) => f.fontSize)),
    };
  });
}

/**
 * Construit la couche de texte interactive d'une page : un <span> positionné
 * en absolu par-dessus chaque ligne de texte détectée (fragments pdf.js
 * regroupés par ligne, cf. groupFragmentsIntoLines), à la même échelle que
 * le rendu canvas. Positionnement calculé directement (pas de dépendance à
 * pdfjs-dist TextLayer, qui suppose des variables CSS internes non
 * documentées propres au lecteur officiel de pdf.js et non fournies par le
 * paquet npm). Ne gère correctement que le texte non pivoté (cas très
 * largement majoritaire en pratique).
 */
export async function buildTextLayer(
  doc: PdfForEditing,
  pageNumber: number,
  container: HTMLElement,
  targetWidth: number,
): Promise<{ textDivs: HTMLElement[]; items: DetectedTextItem[] }> {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / baseViewport.width;
  const pageHeightPt = baseViewport.height;

  const textContent = await page.getTextContent();

  const fragments: RawTextFragment[] = [];
  (textContent.items as any[]).forEach((raw) => {
    if (typeof raw.str !== "string" || !raw.str.trim()) return;
    const transform = raw.transform as number[];
    fragments.push({
      str: raw.str,
      xPt: transform[4],
      yBaselinePt: transform[5],
      widthPt: raw.width,
      heightPt: raw.height,
      fontSize: Math.abs(transform[3]) || raw.height,
    });
  });

  const items = groupFragmentsIntoLines(fragments);

  container.innerHTML = "";
  const textDivs: HTMLElement[] = items.map((item) => {
    // Conversion points PDF (repère bas-gauche) -> pixels canvas (repère haut-gauche)
    const left = item.xPt * scale;
    const baselineFromTop = (pageHeightPt - item.yBaselinePt) * scale;
    const boxHeight = item.heightPt * scale;
    const top = baselineFromTop - boxHeight * 0.8; // approx. ascendant au-dessus de la ligne de base

    const span = document.createElement("span");
    span.textContent = item.str;
    span.style.position = "absolute";
    span.style.left = `${left}px`;
    span.style.top = `${top}px`;
    span.style.width = `${Math.max(item.widthPt * scale, 4)}px`;
    span.style.height = `${Math.max(boxHeight, 4)}px`;
    span.style.fontSize = `${item.fontSize * scale}px`;
    span.style.lineHeight = `${boxHeight}px`;
    span.style.whiteSpace = "pre";

    container.appendChild(span);
    return span;
  });

  return { textDivs, items };
}

/**
 * Applique des ajouts (texte, zones blanches) sur un PDF existant, page par
 * page, sans re-rasteriser le document (le contenu d'origine reste net et
 * le texte d'origine reste sélectionnable).
 * pageIndex dans editsByPage est 0-based.
 */
export async function applyEditsToPdf(file: File, editsByPage: Map<number, PageEdit[]>): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const [pageIndex, edits] of editsByPage) {
    const page = pdfDoc.getPage(pageIndex);
    const { width: pw, height: ph } = page.getSize();

    for (const edit of edits) {
      if (edit.type === "rect") {
        const w = edit.wFrac * pw;
        const h = edit.hFrac * ph;
        const x = edit.xFrac * pw;
        const y = ph - edit.yFrac * ph - h;
        page.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1) });
      } else if (edit.type === "text") {
        const x = edit.xFrac * pw;
        const y = ph - edit.yFrac * ph - edit.fontSize;
        page.drawText(edit.text, {
          x,
          y,
          size: edit.fontSize,
          font,
          color: rgb(edit.color[0], edit.color[1], edit.color[2]),
        });
      } else if (edit.type === "textReplace") {
        // masque l'ancien texte (déjà présent dans le flux du PDF, non
        // retirable simplement) avec une zone blanche généreuse, puis écrit
        // le nouveau texte à la même position de base.
        const padTop = edit.heightPt * 0.25;
        const padBottom = edit.heightPt * 0.3;
        page.drawRectangle({
          x: edit.xPt - 1,
          y: edit.yBaselinePt - padBottom,
          width: edit.widthPt + 2,
          height: edit.heightPt + padTop + padBottom,
          color: rgb(1, 1, 1),
        });
        page.drawText(edit.text, {
          x: edit.xPt,
          y: edit.yBaselinePt,
          size: edit.fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      } else if (edit.type === "image") {
        const png = await pdfDoc.embedPng(edit.dataUrl);
        const w = edit.wFrac * pw;
        const h = edit.hFrac * ph;
        const x = edit.xFrac * pw;
        const y = ph - edit.yFrac * ph - h;
        page.drawImage(png, { x, y, width: w, height: h });
      }
    }
  }

  const outBytes = await pdfDoc.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
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
