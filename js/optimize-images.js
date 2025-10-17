/**
 * --------------------------------------------------------
 * Image Optimization Script using Sharp (Enhanced Version)
 * --------------------------------------------------------
 * ✅ Convierte JPG, JPEG, PNG → WebP
 * ✅ Reoptimiza archivos .webp existentes
 * ✅ Limita el ancho máximo (sin agrandar imágenes pequeñas)
 * ✅ Ajusta calidad WebP (por defecto 75)
 * ✅ Muestra advertencia si una imagen > 500 KB
 * --------------------------------------------------------
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const rootDir = "./assets";
const quality = 75; // Ajuste de calidad (0–100)
const widthLimit = 1200; // Máximo ancho permitido
const sizeWarning = 500 * 1024; // 500 KB

function getAllImages(dir) {
  let resultado = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      resultado = resultado.concat(getAllImages(filePath));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      resultado.push(filePath);
    }
  });
  return resultado;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let outputFile = filePath;

  // Si no es WebP, crear un nuevo archivo convertido
  if (ext !== ".webp") {
    outputFile = filePath.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  }

  try {
    await sharp(filePath)
      .resize({ width: widthLimit, withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputFile);

    const newSize = fs.statSync(outputFile).size;

    if (newSize > sizeWarning) {
      console.warn(
        `⚠️  ${path.relative(".", outputFile)} — ${(newSize / 1024).toFixed(
          1
        )} KB (supera 500 KB)`
      );
    } else {
      console.log(`✅ Optimizado: ${path.relative(".", outputFile)}`);
    }

    // Si era JPG/PNG, elimina el original
    if (ext !== ".webp") {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`❌ Error al procesar ${filePath}:`, err.message);
  }
}

async function main() {
  console.log("🚀 Iniciando optimización de imágenes...");
  const images = getAllImages(rootDir);
  console.log(`${images.length} archivos detectados.\n`);

  for (const file of images) {
    await optimizeImage(file);
  }

  console.log("\n✨ Proceso completado.");
}

main();
