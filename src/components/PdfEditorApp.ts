import {
  loadPdfForEditing,
  renderPageToCanvas,
  buildTextLayer,
  applyEditsToPdf,
  downloadBlob,
  formatFileSize,
  type PdfForEditing,
  type PageEdit,
  type AddedPageEdit,
  type DetectedTextItem,
} from "../utils/pdfTools";

interface AddedEdit {
  id: number;
  edit: AddedPageEdit;
}

type Snapshot = {
  editsByPage: Map<number, AddedEdit[]>;
  textEditsByPage: Map<number, Map<number, string>>;
};

/**
 * Éditeur de PDF interactif partagé entre /pages/outils/modifier-pdf et
 * /pages/outils/signer-pdf : ajout de texte, zones blanches, signature
 * dessinée, édition en place du texte déjà présent dans le PDF. Fonctionne
 * à la souris comme au tactile (Pointer Events unifiées) et garde un
 * historique pour annuler (Ctrl+Z ou bouton).
 *
 * Attend une structure HTML fixe (identifiants ci-dessous) déjà présente
 * dans la page appelante.
 */
export function mountPdfEditor(): void {
  const dropzone = document.getElementById("dropzone") as HTMLElement;
  const browseBtn = document.getElementById("browse-btn") as HTMLButtonElement;
  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  const errorBox = document.getElementById("error-box") as HTMLElement;
  const editorSection = document.getElementById("editor-section") as HTMLElement;
  const changeFileBtn = document.getElementById("change-file-btn") as HTMLButtonElement;

  const toolTextBtn = document.getElementById("tool-text") as HTMLButtonElement;
  const toolRectBtn = document.getElementById("tool-rect") as HTMLButtonElement;
  const toolSignatureBtn = document.getElementById("tool-signature") as HTMLButtonElement;
  const fontSizeSelect = document.getElementById("font-size") as HTMLSelectElement;
  const fontColorSelect = document.getElementById("font-color") as HTMLSelectElement;
  const undoBtn = document.getElementById("undo-btn") as HTMLButtonElement | null;

  const prevPageBtn = document.getElementById("prev-page") as HTMLButtonElement;
  const nextPageBtn = document.getElementById("next-page") as HTMLButtonElement;
  const pageNumEl = document.getElementById("page-num") as HTMLElement;
  const pageCountEl = document.getElementById("page-count") as HTMLElement;

  const canvas = document.getElementById("page-canvas") as HTMLCanvasElement;
  const overlay = document.getElementById("overlay-layer") as HTMLElement;
  const textEditorLayer = document.getElementById("text-editor-layer") as HTMLElement;
  const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
  const status = document.getElementById("status") as HTMLElement;

  const sigModal = document.getElementById("signature-modal") as HTMLElement | null;
  const sigCanvas = document.getElementById("signature-canvas") as HTMLCanvasElement | null;
  const sigColorSelect = document.getElementById("signature-color") as HTMLSelectElement | null;
  const sigClearBtn = document.getElementById("signature-clear") as HTMLButtonElement | null;
  const sigCancelBtn = document.getElementById("signature-cancel") as HTMLButtonElement | null;
  const sigConfirmBtn = document.getElementById("signature-confirm") as HTMLButtonElement | null;

  const TARGET_WIDTH = 700;
  const MAX_HISTORY = 50;

  let currentFile: File | null = null;
  let pdfDoc: PdfForEditing | null = null;
  let numPages = 1;
  let currentPage = 1;
  let activeTool: "text" | "rect" | "signature" = "text";
  let currentPageWidthPt = 0;

  let editsByPage = new Map<number, AddedEdit[]>();
  let nextEditId = 0;
  let detectedTextByPage = new Map<number, DetectedTextItem[]>();
  let textEditsByPage = new Map<number, Map<number, string>>();

  let pendingSignature: { dataUrl: string; aspect: number } | null = null;
  const history: Snapshot[] = [];

  // ---------- Utilitaires ----------
  function showError(message: string) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
  }
  function clearError() {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
  }

  function pageEdits(pageNumber: number): AddedEdit[] {
    if (!editsByPage.has(pageNumber)) editsByPage.set(pageNumber, []);
    return editsByPage.get(pageNumber)!;
  }

  function cloneMapOfArrays<T>(map: Map<number, T[]>): Map<number, T[]> {
    const out = new Map<number, T[]>();
    for (const [k, v] of map) out.set(k, v.map((item) => ({ ...item })));
    return out;
  }
  function cloneMapOfMaps(map: Map<number, Map<number, string>>): Map<number, Map<number, string>> {
    const out = new Map<number, Map<number, string>>();
    for (const [k, v] of map) out.set(k, new Map(v));
    return out;
  }

  function pushHistory() {
    history.push({
      editsByPage: cloneMapOfArrays(editsByPage),
      textEditsByPage: cloneMapOfMaps(textEditsByPage),
    });
    if (history.length > MAX_HISTORY) history.shift();
    if (undoBtn) undoBtn.disabled = false;
  }

  function undo() {
    const snap = history.pop();
    if (!snap) return;
    editsByPage = snap.editsByPage;
    textEditsByPage = snap.textEditsByPage;
    if (undoBtn) undoBtn.disabled = history.length === 0;
    rebuildOverlay();
    void setupTextLayerForCurrentPage();
  }

  window.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement | null;
    const isEditingField = target && (target.isContentEditable || target.tagName === "TEXTAREA" || target.tagName === "INPUT");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !isEditingField) {
      e.preventDefault();
      undo();
    }
  });
  undoBtn?.addEventListener("click", undo);
  if (undoBtn) undoBtn.disabled = true;

  // ---------- Chargement du fichier ----------
  async function setFile(file: File) {
    clearError();
    currentFile = file;
    dropzone.classList.add("hidden");
    editorSection.classList.remove("hidden");
    status.textContent = "Chargement du PDF…";

    try {
      pdfDoc = await loadPdfForEditing(file);
      numPages = pdfDoc.numPages;
      currentPage = 1;
      editsByPage = new Map();
      detectedTextByPage = new Map();
      textEditsByPage = new Map();
      history.length = 0;
      if (undoBtn) undoBtn.disabled = true;
      pageCountEl.textContent = String(numPages);
      await renderCurrentPage();
      status.textContent = "";
    } catch (err) {
      console.error("Erreur ouverture PDF:", err);
      editorSection.classList.add("hidden");
      dropzone.classList.remove("hidden");
      showError("Impossible d'ouvrir ce PDF. Vérifiez qu'il s'agit bien d'un PDF valide et non protégé par un mot de passe fort.");
    }
  }

  function resetFile() {
    currentFile = null;
    pdfDoc = null;
    editsByPage = new Map();
    detectedTextByPage = new Map();
    textEditsByPage = new Map();
    history.length = 0;
    if (undoBtn) undoBtn.disabled = true;
    dropzone.classList.remove("hidden");
    editorSection.classList.add("hidden");
    fileInput.value = "";
    status.textContent = "";
    overlay.innerHTML = "";
    textEditorLayer.innerHTML = "";
  }

  browseBtn.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("click", (e) => {
    if (e.target === browseBtn) return;
    fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files?.[0]) void setFile(fileInput.files[0]);
  });
  changeFileBtn.addEventListener("click", resetFile);

  (["dragover", "dragenter"] as const).forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("border-teal-400", "bg-teal-50/40");
    }),
  );
  (["dragleave", "drop"] as const).forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-teal-400", "bg-teal-50/40");
    }),
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) void setFile(file);
  });

  // ---------- Rendu de page ----------
  async function renderCurrentPage() {
    if (!pdfDoc) return;
    const info = await renderPageToCanvas(pdfDoc, currentPage, canvas, TARGET_WIDTH);
    currentPageWidthPt = info.widthPt;
    overlay.style.width = `${canvas.width}px`;
    overlay.style.height = `${canvas.height}px`;
    pageNumEl.textContent = String(currentPage);
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= numPages;
    rebuildOverlay();
    await setupTextLayerForCurrentPage();
  }

  prevPageBtn.addEventListener("click", async () => {
    if (currentPage > 1) {
      currentPage--;
      await renderCurrentPage();
    }
  });
  nextPageBtn.addEventListener("click", async () => {
    if (currentPage < numPages) {
      currentPage++;
      await renderCurrentPage();
    }
  });

  // ---------- Texte déjà présent dans le PDF (édition en place) ----------
  async function setupTextLayerForCurrentPage() {
    if (!pdfDoc) return;
    textEditorLayer.style.width = `${canvas.width}px`;
    textEditorLayer.style.height = `${canvas.height}px`;

    let items: DetectedTextItem[];
    let textDivs: HTMLElement[];
    try {
      const built = await buildTextLayer(pdfDoc, currentPage, textEditorLayer, TARGET_WIDTH);
      textDivs = built.textDivs;
      items = built.items;
      detectedTextByPage.set(currentPage, items);
    } catch (err) {
      console.error("Détection du texte impossible sur cette page:", err);
      return;
    }

    const pageTextEdits = textEditsByPage.get(currentPage);

    for (const item of items) {
      const span = textDivs[item.index];
      if (!span) continue;

      const savedText = pageTextEdits?.get(item.index);
      if (savedText !== undefined) {
        span.textContent = savedText;
        span.classList.add("detected-edited");
      }

      span.addEventListener("click", (e) => {
        e.stopPropagation();
        startEditingDetectedText(span, item);
      });
    }
  }

  function startEditingDetectedText(span: HTMLElement, item: DetectedTextItem) {
    if (span.classList.contains("detected-editing")) return;
    span.classList.add("detected-editing");
    span.contentEditable = "true";
    span.focus();

    const range = document.createRange();
    range.selectNodeContents(span);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    function commit() {
      span.removeEventListener("blur", commit);
      span.contentEditable = "false";
      span.classList.remove("detected-editing");

      const newText = span.textContent ?? "";
      if (newText === item.str) {
        const pageMap = textEditsByPage.get(currentPage);
        pageMap?.delete(item.index);
        span.classList.remove("detected-edited");
        return;
      }

      pushHistory();
      let pageMap = textEditsByPage.get(currentPage);
      if (!pageMap) {
        pageMap = new Map();
        textEditsByPage.set(currentPage, pageMap);
      }
      pageMap.set(item.index, newText);
      span.classList.add("detected-edited");
    }

    span.addEventListener("blur", commit);
    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        span.blur();
      }
      if (e.key === "Escape") {
        span.textContent = item.str;
        span.blur();
      }
    });
  }

  // ---------- Éléments ajoutés (texte, zone blanche, signature) ----------
  function rebuildOverlay() {
    overlay.innerHTML = "";
    for (const added of pageEdits(currentPage)) {
      overlay.appendChild(buildEditElement(added));
    }
  }

  function colorToCss(color: [number, number, number]): string {
    const [r, g, b] = color;
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  }

  function updateEditElementGeometry(el: HTMLElement, edit: AddedPageEdit) {
    el.style.left = `${edit.xFrac * canvas.width}px`;
    el.style.top = `${edit.yFrac * canvas.height}px`;
    if (edit.type === "rect" || edit.type === "image") {
      el.style.width = `${edit.wFrac * canvas.width}px`;
      el.style.height = `${edit.hFrac * canvas.height}px`;
    }
  }

  function buildEditElement(added: AddedEdit): HTMLElement {
    const { edit } = added;
    const el = document.createElement("div");
    el.className = "edit-el";
    el.dataset.id = String(added.id);
    updateEditElementGeometry(el, edit);

    if (edit.type === "text") {
      const textEl = document.createElement("div");
      textEl.className = "edit-text";
      textEl.textContent = edit.text;
      textEl.style.color = colorToCss(edit.color);
      textEl.style.fontSize = `${edit.fontSize * (canvas.width / currentPageWidthPt)}px`;
      el.appendChild(textEl);
    } else if (edit.type === "rect") {
      el.classList.add("edit-rect");
    } else if (edit.type === "image") {
      const img = document.createElement("img");
      img.src = edit.dataUrl;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.display = "block";
      img.draggable = false;
      el.appendChild(img);
    }

    attachMoveAndResize(el, added);

    const del = document.createElement("div");
    del.className = "edit-del";
    del.textContent = "×";
    del.title = "Supprimer";
    del.addEventListener("pointerdown", (e) => e.stopPropagation());
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      pushHistory();
      const arr = pageEdits(currentPage);
      const idx = arr.findIndex((it) => it.id === added.id);
      if (idx !== -1) arr.splice(idx, 1);
      rebuildOverlay();
    });
    el.appendChild(del);

    if (edit.type === "rect" || edit.type === "image") {
      const handle = document.createElement("div");
      handle.className = "edit-resize-handle";
      attachResize(handle, el, added);
      el.appendChild(handle);
    }

    return el;
  }

  /** Double-clic (ou tap) sur un texte ajouté : ré-édite son contenu. */
  function editAddedText(el: HTMLElement, added: AddedEdit) {
    if (added.edit.type !== "text") return;
    const textEl = el.querySelector(".edit-text") as HTMLElement | null;
    if (!textEl) return;

    const input = document.createElement("textarea");
    input.className = "edit-input";
    input.value = added.edit.text;
    input.style.left = el.style.left;
    input.style.top = el.style.top;
    overlay.appendChild(input);
    input.focus();
    input.select();

    function commit() {
      input.remove();
      const value = input.value.trim();
      pushHistory();
      if (!value) {
        const arr = pageEdits(currentPage);
        const idx = arr.findIndex((it) => it.id === added.id);
        if (idx !== -1) arr.splice(idx, 1);
      } else if (added.edit.type === "text") {
        added.edit.text = value;
      }
      rebuildOverlay();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        input.blur();
      }
      if (e.key === "Escape") {
        input.value = added.edit.type === "text" ? added.edit.text : "";
        input.blur();
      }
    });
  }

  /** Déplacement au pointer (souris + tactile unifiés). */
  function attachMoveAndResize(el: HTMLElement, added: AddedEdit) {
    let startX = 0;
    let startY = 0;
    let startXFrac = 0;
    let startYFrac = 0;
    let moved = false;
    let historyPushed = false;

    el.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".edit-del, .edit-resize-handle")) return;
      e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      startXFrac = added.edit.xFrac;
      startYFrac = added.edit.yFrac;
      moved = false;
      historyPushed = false;

      function onMove(ev: PointerEvent) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.hypot(dx, dy) < 4) return;
        if (!historyPushed) {
          pushHistory();
          historyPushed = true;
        }
        moved = true;
        added.edit.xFrac = Math.min(1, Math.max(0, startXFrac + dx / canvas.width));
        added.edit.yFrac = Math.min(1, Math.max(0, startYFrac + dy / canvas.height));
        updateEditElementGeometry(el, added.edit);
      }

      function onUp() {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        if (!moved && added.edit.type === "text") {
          editAddedText(el, added);
        }
      }

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
    });
  }

  function attachResize(handle: HTMLElement, el: HTMLElement, added: AddedEdit) {
    handle.addEventListener("pointerdown", (e) => {
      if (added.edit.type !== "rect" && added.edit.type !== "image") return;
      e.stopPropagation();
      handle.setPointerCapture(e.pointerId);
      const edit = added.edit;
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = edit.wFrac;
      const startH = edit.hFrac;
      let historyPushed = false;

      function onMove(ev: PointerEvent) {
        if (!historyPushed) {
          pushHistory();
          historyPushed = true;
        }
        const dx = (ev.clientX - startX) / canvas.width;
        const dy = (ev.clientY - startY) / canvas.height;
        edit.wFrac = Math.max(0.02, startW + dx);
        edit.hFrac = Math.max(0.02, startH + dy);
        updateEditElementGeometry(el, edit);
      }
      function onUp() {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
      }
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    });
  }

  // ---------- Outils ----------
  function setActiveTool(tool: "text" | "rect" | "signature") {
    activeTool = tool;
    const buttons: [HTMLButtonElement, string][] = [
      [toolTextBtn, "text"],
      [toolRectBtn, "rect"],
      [toolSignatureBtn, "signature"],
    ];
    for (const [btn, name] of buttons) {
      const isActive = name === tool;
      btn.classList.toggle("bg-teal-600", isActive);
      btn.classList.toggle("text-white", isActive);
      btn.classList.toggle("border-teal-600", isActive);
      btn.classList.toggle("border-gray-300", !isActive);
      btn.classList.toggle("text-gray-700", !isActive);
    }
  }
  toolTextBtn.addEventListener("click", () => setActiveTool("text"));
  toolRectBtn.addEventListener("click", () => setActiveTool("rect"));
  toolSignatureBtn?.addEventListener("click", () => {
    if (pendingSignature) {
      setActiveTool("signature");
      return;
    }
    openSignatureModal();
  });

  // ---------- Placement : texte ----------
  let pendingTextXFrac = 0;
  let pendingTextYFrac = 0;

  function openTextInput() {
    const input = document.createElement("textarea");
    input.className = "edit-input";
    const xFrac = pendingTextXFrac;
    const yFrac = pendingTextYFrac;
    input.style.left = `${xFrac * canvas.width}px`;
    input.style.top = `${yFrac * canvas.height}px`;
    overlay.appendChild(input);
    input.focus();

    function commit() {
      input.remove();
      const value = input.value.trim();
      if (!value) {
        rebuildOverlay();
        return;
      }
      pushHistory();
      const color = fontColorSelect.value.split(",").map(Number) as [number, number, number];
      pageEdits(currentPage).push({
        id: nextEditId++,
        edit: {
          type: "text",
          xFrac,
          yFrac,
          text: value,
          fontSize: Number(fontSizeSelect.value),
          color,
        },
      });
      rebuildOverlay();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        input.blur();
      }
      if (e.key === "Escape") {
        input.value = "";
        input.blur();
      }
    });
  }

  // ---------- Interaction sur le stage (placement de nouveaux éléments) ----------
  let dragStart: { x: number; y: number } | null = null;
  let dragPreview: HTMLElement | null = null;

  overlay.addEventListener("pointerdown", (e) => {
    if (e.target !== overlay) return; // clic sur un élément existant : ignoré ici
    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "text") {
      pendingTextXFrac = x / canvas.width;
      pendingTextYFrac = y / canvas.height;
      openTextInput();
      return;
    }

    if (activeTool === "signature") {
      if (!pendingSignature) return;
      pushHistory();
      const wFrac = 0.28;
      // aspect = largeur/hauteur du dessin d'origine ; on la préserve en pixels canvas.
      const hFrac = (wFrac * canvas.width) / pendingSignature.aspect / canvas.height;
      pageEdits(currentPage).push({
        id: nextEditId++,
        edit: {
          type: "image",
          xFrac: x / canvas.width,
          yFrac: y / canvas.height,
          wFrac,
          hFrac,
          dataUrl: pendingSignature.dataUrl,
        },
      });
      pendingSignature = null;
      setActiveTool("text");
      rebuildOverlay();
      return;
    }

    // outil rectangle : début de glisser (souris + tactile via Pointer Events)
    overlay.setPointerCapture(e.pointerId);
    dragStart = { x, y };
    dragPreview = document.createElement("div");
    dragPreview.className = "edit-el edit-rect";
    dragPreview.style.left = `${x}px`;
    dragPreview.style.top = `${y}px`;
    dragPreview.style.width = "0px";
    dragPreview.style.height = "0px";
    overlay.appendChild(dragPreview);
  });

  overlay.addEventListener("pointermove", (e) => {
    if (!dragStart || !dragPreview) return;
    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const left = Math.min(x, dragStart.x);
    const top = Math.min(y, dragStart.y);
    const w = Math.abs(x - dragStart.x);
    const h = Math.abs(y - dragStart.y);
    dragPreview.style.left = `${left}px`;
    dragPreview.style.top = `${top}px`;
    dragPreview.style.width = `${w}px`;
    dragPreview.style.height = `${h}px`;
  });

  overlay.addEventListener("pointerup", (e) => {
    if (!dragStart || !dragPreview) return;
    const rect = overlay.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, canvas.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, canvas.height));
    const left = Math.min(x, dragStart.x);
    const top = Math.min(y, dragStart.y);
    const w = Math.abs(x - dragStart.x);
    const h = Math.abs(y - dragStart.y);

    dragPreview.remove();
    dragPreview = null;
    dragStart = null;

    if (w < 8 || h < 8) return; // trop petit, ignoré

    pushHistory();
    pageEdits(currentPage).push({
      id: nextEditId++,
      edit: {
        type: "rect",
        xFrac: left / canvas.width,
        yFrac: top / canvas.height,
        wFrac: w / canvas.width,
        hFrac: h / canvas.height,
      },
    });
    rebuildOverlay();
  });

  // ---------- Signature : pad de dessin ----------
  function openSignatureModal() {
    if (!sigModal || !sigCanvas) return;
    sigModal.classList.remove("hidden");
    const ctx = sigCanvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    function pos(e: PointerEvent) {
      const rect = sigCanvas!.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * sigCanvas!.width,
        y: ((e.clientY - rect.top) / rect.height) * sigCanvas!.height,
      };
    }

    function onDown(e: PointerEvent) {
      drawing = true;
      const p = pos(e);
      lastX = p.x;
      lastY = p.y;
      sigCanvas!.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (!drawing || !ctx) return;
      const p = pos(e);
      ctx.strokeStyle = sigColorSelect?.value || "#111827";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x;
      lastY = p.y;
    }
    function onUp() {
      drawing = false;
    }

    sigCanvas.addEventListener("pointerdown", onDown);
    sigCanvas.addEventListener("pointermove", onMove);
    sigCanvas.addEventListener("pointerup", onUp);
    sigCanvas.addEventListener("pointercancel", onUp);

    function onClear() {
      ctx?.clearRect(0, 0, sigCanvas!.width, sigCanvas!.height);
    }
    function onCancel() {
      cleanup();
    }
    function onConfirm() {
      pendingSignature = { dataUrl: sigCanvas!.toDataURL("image/png"), aspect: sigCanvas!.width / sigCanvas!.height };
      cleanup();
      setActiveTool("signature");
      status.textContent = "Cliquez sur la page pour placer votre signature.";
    }

    function cleanup() {
      sigCanvas!.removeEventListener("pointerdown", onDown);
      sigCanvas!.removeEventListener("pointermove", onMove);
      sigCanvas!.removeEventListener("pointerup", onUp);
      sigCanvas!.removeEventListener("pointercancel", onUp);
      sigClearBtn?.removeEventListener("click", onClear);
      sigCancelBtn?.removeEventListener("click", onCancel);
      sigConfirmBtn?.removeEventListener("click", onConfirm);
      sigModal!.classList.add("hidden");
    }

    sigClearBtn?.addEventListener("click", onClear);
    sigCancelBtn?.addEventListener("click", onCancel);
    sigConfirmBtn?.addEventListener("click", onConfirm);
  }

  // ---------- Export ----------
  exportBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    clearError();
    exportBtn.disabled = true;
    status.textContent = "Génération du PDF modifié…";
    try {
      const byPageIndex = new Map<number, PageEdit[]>();

      function pushEdit(pageNumber: number, edit: PageEdit) {
        const idx = pageNumber - 1;
        if (!byPageIndex.has(idx)) byPageIndex.set(idx, []);
        byPageIndex.get(idx)!.push(edit);
      }

      for (const [pageNumber, edits] of editsByPage) {
        for (const added of edits) pushEdit(pageNumber, added.edit);
      }

      for (const [pageNumber, pageMap] of textEditsByPage) {
        const items = detectedTextByPage.get(pageNumber) || [];
        for (const [itemIndex, newText] of pageMap) {
          const item = items.find((it) => it.index === itemIndex);
          if (!item) continue;
          pushEdit(pageNumber, {
            type: "textReplace",
            xPt: item.xPt,
            yBaselinePt: item.yBaselinePt,
            widthPt: item.widthPt,
            heightPt: item.heightPt,
            fontSize: item.fontSize,
            text: newText,
          });
        }
      }

      const blob = await applyEditsToPdf(currentFile, byPageIndex);
      downloadBlob(blob, "pdf-modifie.pdf");
      status.textContent = `PDF modifié téléchargé (${formatFileSize(blob.size)}).`;
    } catch (err) {
      console.error("Erreur export PDF:", err);
      status.textContent = "";
      showError(err instanceof Error ? err.message : "Erreur inattendue pendant la génération du PDF.");
    } finally {
      exportBtn.disabled = false;
    }
  });
}
