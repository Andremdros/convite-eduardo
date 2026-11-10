// Servidor local para ver a página: node ~/Desktop/Marcela/site/servir.mjs  →  http://localhost:8792
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".json": "application/json", ".pdf": "application/pdf" };

createServer(async (req, res) => {
  const caminho = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const arquivo = join(root, caminho.endsWith("/") ? caminho + "index.html" : caminho);
  if (!arquivo.startsWith(root)) return res.writeHead(403).end();
  try {
    const corpo = await readFile(arquivo);
    res.writeHead(200, { "Content-Type": tipos[extname(arquivo)] || "application/octet-stream", "Cache-Control": "no-store" }).end(corpo);
  } catch {
    res.writeHead(404).end("Não encontrado");
  }
}).listen(Number(process.env.PORT) || 8792, function () { console.log(`Eduardo · Primeira Comunhão em http://localhost:${this.address().port}`); });
