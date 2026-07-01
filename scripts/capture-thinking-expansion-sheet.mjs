#!/usr/bin/env node
/** 思考拡張シート PNG を再生成: node scripts/capture-thinking-expansion-sheet.mjs */
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = path.join(root, "docs", "thinking-expansion-sheet-screenshot.html");
const fileUrl = `file:///${html.replace(/\\/g, "/")}`;
const fileName = "life-schedule-screenshot-thinking-expansion-sheet.png";
const docsOut = path.join(root, "docs", fileName);
const publicDir = path.join(root, "public", "docs");
const publicOut = path.join(publicDir, fileName);

execSync(
  `npx --yes playwright screenshot "${fileUrl}" "${docsOut}" --full-page`,
  { cwd: root, stdio: "inherit" },
);
mkdirSync(publicDir, { recursive: true });
copyFileSync(docsOut, publicOut);
console.log(`Saved: ${docsOut}`);
console.log(`Saved: ${publicOut}`);
