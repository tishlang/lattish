#!/usr/bin/env node
/**
 * Vite + jsdom integration: Lattish HMR remount preserves hook state (issue #7).
 */
import { createServer } from "vite";
import tishPlugin from "@tishlang/vite-plugin-tish";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { viteHmrAcceptSnippet, VITE_PLUGIN_BARE_ACCEPT_RE } from "../hmr.cjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesDir = path.resolve(root, "test/fixtures");
const probeName = "hmr-probe.tish";
const probeId = "test/fixtures/hmr-probe.tish";

/** Resolve a fixture name to an absolute path confined to test/fixtures. */
function fixturePath(name) {
  if (name !== probeName) {
    throw new Error(`unexpected fixture: ${name}`);
  }
  const resolved = path.resolve(fixturesDir, name);
  if (!resolved.startsWith(`${fixturesDir}${path.sep}`)) {
    throw new Error(`fixture path outside fixtures dir: ${name}`);
  }
  return resolved;
}

const probeFile = fixturePath(probeName);

function tishPath() {
  const npm = path.resolve(root, "node_modules/@tishlang/tish/bin/tish");
  const allowed = path.resolve(root, "node_modules");
  if (!npm.startsWith(`${allowed}${path.sep}`)) {
    return process.env.TISH_PATH || "tish";
  }
  if (fs.existsSync(npm)) return npm;
  return process.env.TISH_PATH || "tish";
}

function setupJsdom() {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    runScripts: "dangerously",
    pretendToBeVisual: true,
  });
  const win = dom.window;
  globalThis.window = win;
  globalThis.document = win.document;
  globalThis.HTMLElement = win.HTMLElement;
  globalThis.Element = win.Element;
  globalThis.Node = win.Node;
  globalThis.Text = win.Text;
  globalThis.DocumentFragment = win.DocumentFragment;
  globalThis.HTMLDivElement = win.HTMLDivElement;
  globalThis.queueMicrotask = queueMicrotask;
}

function withLattishHmrAccept(basePlugin, projectRoot) {
  return {
    ...basePlugin,
    load(id) {
      const out = basePlugin.load(id);
      if (!out?.code) return out;
      const file = id.split("?")[0];
      if (!file.endsWith(".tish")) return out;
      const relId = path.relative(projectRoot, file).split(path.sep).join("/");
      if (VITE_PLUGIN_BARE_ACCEPT_RE.test(out.code)) {
        out.code = out.code.replace(VITE_PLUGIN_BARE_ACCEPT_RE, `\n${viteHmrAcceptSnippet(relId)}`);
      }
      return out;
    },
  };
}

setupJsdom();

globalThis.__LATTISH_HMR_ACTIVE__ = true;
const hmrRuntime = await import(pathToFileURL(path.join(root, "dist/lattishHmr.js")).href);
hmrRuntime.installLattishViteHmrDispatcher();
hmrRuntime.exposeLattishHmrGlobals();

const plugin = withLattishHmrAccept(
  tishPlugin({ tishPath: tishPath(), mode: "hmr", projectRoot: root }),
  root,
);

const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
  plugins: [plugin],
  resolve: {
    alias: {
      lattish: path.join(root, "src/Lattish.tish"),
    },
  },
  ssr: { noExternal: true },
});

const before = fs.readFileSync(probeFile, "utf8");
let failed = false;

try {
  const mod = await server.ssrLoadModule(`${pathToFileURL(probeFile).href}?v=1`);
  if (typeof mod.mountProbe !== "function") {
    throw new Error("probe missing mountProbe");
  }
  if (typeof globalThis.__LATTISH_HMR_ACCEPT__ !== "function") {
    throw new Error("__LATTISH_HMR_ACCEPT__ not installed");
  }

  const host = document.createElement("div");
  document.body.appendChild(host);
  mod.mountProbe(host);
  if (host.textContent !== "alpha:42") {
    throw new Error(`initial mount: ${host.textContent}`);
  }

  const edited = before.replace('probeLabel = "alpha"', 'probeLabel = "beta"');
  fs.writeFileSync(probeFile, edited);
  for (const m of server.moduleGraph.getModulesByFile(probeFile) ?? []) {
    server.moduleGraph.invalidateModule(m);
  }
  await server.ssrLoadModule(`${pathToFileURL(probeFile).href}?v=2`);
  globalThis.__LATTISH_HMR_ACCEPT__(probeId);

  if (host.textContent !== "beta:42") {
    throw new Error(`after HMR: ${host.textContent} (expected beta:42)`);
  }

  console.log("Lattish Vite HMR integration test passed");
} catch (e) {
  console.error("Lattish Vite HMR integration test failed:", e.message || e);
  failed = true;
} finally {
  fs.writeFileSync(probeFile, before);
  await server.close();
}

process.exit(failed ? 1 : 0);
