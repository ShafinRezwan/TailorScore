declare module "pdfjs-dist/build/pdf.mjs" {
  const pdfjsLib: any;
  export = pdfjsLib;
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const workerUrl: string;
  export default workerUrl;
}
