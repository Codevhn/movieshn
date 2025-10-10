/**
 * --------------------------------------------
 * Image Optimization Script using Sharp
 * --------------------------------------------
 * Converts JPG, JPEG, PNG → WebP
 * Recursively scans folders inside ./assets/
 * Skips already optimized files
 * --------------------------------------------
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const rootDir = "./assets";
const quality = 75; //se puede ajustar hasta 100
const widthLimit = 1200; //ancho maximo en px

function getAllImages(dir) {
  let resultado = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      resultado = resultado.concat(getAllImages(filePath));
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      resultado.push(filePath);
    }
  });
  return resultado;
}

async function optimizeImage(filePath) {
  const outputFile = filePath.replace(/\.(jpg|jpeg|png)$/i, ".webp");

  if (fs.existsSync(outputFile)) {
    console.log(`⚪ Skip: ${outputFile} ya existe`);
    return;
  }

  try {
    await sharp(filePath)
      .resize({ width: widthLimit, withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputFile);

    console.log(`✅ Optimizado: ${path.relative(".", outputFile)}`);
  } catch (err) {
    console.error(`❌  Error al procesar ${filePath}:`, err.message);
  }
}

async function main() {
  console.log("Iniciando optimizacion de imagenes...");
  const images = getAllImages(rootDir);
  console.log(`${images.length} imagenes encontradas\n`);

  for (const file of images) {
    await optimizeImage(file);
  }

  console.log("✨\nProceso completado.");
}
main();
