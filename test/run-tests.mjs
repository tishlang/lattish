#!/usr/bin/env node
// Run Lattish unit tests in jsdom.
import { JSDOM } from "jsdom";
import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function setupJsdom() {
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
  global.queueMicrotask = queueMicrotask;
}

function runCompiled(path) {
  if (!existsSync(path)) {
    console.error("Compiled test not found:", path);
    process.exit(1);
  }
  try {
    eval(readFileSync(path, "utf8"));
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
}

setupJsdom();

const testFiles = [
  { src: "test/lattish.test.tish", out: "dist/lattish-test" },
  { src: "test/jsx-runtime.test.tish", out: "dist/jsx-runtime-test" },
];

for (const { src, out } of testFiles) {
  const tish = spawnSync(
    "npx",
    ["--no-install", "@tishlang/tish", "build", src, "-o", out, "--target", "js"],
    { cwd: root, encoding: "utf8" },
  );
  if (tish.status !== 0) {
    console.error(`Compile failed (${src}):`, tish.stderr || tish.stdout);
    process.exit(1);
  }
  runCompiled(resolve(root, `${out}.js`));
}
