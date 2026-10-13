import { access, copyFile } from "node:fs/promises";
import { constants, existsSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve(process.cwd(), existsSync(".htaccess") ? ".htaccess" : "scripts/static-host.htaccess");
const destination = resolve(process.cwd(), "out", ".htaccess");

try {
  await access(resolve(process.cwd(), "out"), constants.F_OK);
  await copyFile(source, destination);
  console.log("[copy-htaccess] copied .htaccess -> out");
} catch (error) {
  console.warn("[copy-htaccess] skipped:", error instanceof Error ? error.message : error);
}
