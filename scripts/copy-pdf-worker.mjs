// Copies the pdf.js worker into /public so the reader can load it.
import { copyFileSync, existsSync, mkdirSync } from "fs";
const src = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
if (existsSync(src)) {
  mkdirSync("public", { recursive: true });
  copyFileSync(src, "public/pdf.worker.min.mjs");
}
