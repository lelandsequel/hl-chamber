import os from "node:os";
import path from "node:path";

/** Vercel serverless: writable only under /tmp. Local dev: ./data */
export const DATA_DIR =
  process.env.LOOPER_DATA_DIR ??
  (process.env.VERCEL ? path.join(os.tmpdir(), "hl-chamber-data") : path.join(process.cwd(), "data"));

export const DB_PATH = path.join(DATA_DIR, "hl-chamber.db");