#!/usr/bin/env node
// Run Lattish unit tests in jsdom.
import { JSDOM } from "jsdom";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// 1. Compile test file
const tish = spawnSync("npx", ["tish", "compile", "--target", "js", "test/lattish.test.tish", "-o", "dist/lattish-test"], {
  cwd: root,
  encoding: "utf8",
});
if (tish.status !== 0) {
  console.error("Compile failed:", tish.stderr || tish.stdout);
  process.exit(1);
}

// 2. Load compiled output
const testPath = resolve(root, "dist/lattish-test.js");
if (!existsSync(testPath)) {
  console.error("Compiled test not found:", testPath);
  process.exit(1);
}

const { readFileSync } = await import("fs");
const testCode = readFileSync(testPath, "utf8");

// 3. Setup jsdom
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
const win = dom.window;
global.window = win;
global.document = win.document;
global.HTMLElement = win.HTMLElement;
global.Element = win.Element;
global.Node = win.Node;
global.Text = win.Text;
global.DocumentFragment = win.DocumentFragment;
global.HTMLDivElement = win.HTMLDivElement;
global.HTMLInputElement = win.HTMLInputElement;
global.HTMLButtonElement = win.HTMLButtonElement;
global.addEventListener = win.addEventListener;
global.removeEventListener = win.removeEventListener;
global.queueMicrotask = queueMicrotask; // Use Node's native, not jsdom's

// 4. Run the compiled test (eval so it sees global.document, etc.)
try {
  eval(testCode);
} catch (e) {
  console.error("Test failed:", e);
  process.exit(1);
}
