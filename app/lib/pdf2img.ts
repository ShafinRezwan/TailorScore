export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // Import the core ESM build
    const lib = await import("pdfjs-dist/build/pdf.mjs");

    
    const { default: workerUrl } = await import(
      "pdfjs-dist/build/pdf.worker.min.mjs?url"
    );

    // Point pdf.js to that URL (ensures version match)
    lib.GlobalWorkerOptions.workerSrc = workerUrl;

    pdfjsLib = lib;
    return lib;
  })();

  return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return { imageUrl: "", file: null, error: "Canvas 2D context unavailable" };
    }

    // Ensure integer sizes
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    context.imageSmoothingEnabled = true;
    
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    return await new Promise<PdfConversionResult>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
            return;
          }

          const originalName = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${originalName}.png`, {
            type: "image/png",
          });

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        "image/png",
        1.0
      );
    });
  } catch (err: any) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err?.message || String(err)}`,
    };
  }
}
