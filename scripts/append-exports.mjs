#!/usr/bin/env node
/**
 * Append ESM named exports to tish-compiled bundles.
 *
 * `tish build --target js` did not emit export lines up to 2.12; from 3.7 it does. Appending
 * unconditionally then produces `SyntaxError: Duplicate export of '<name>'` and the bundle fails
 * to load. Only append what the emitted output is actually missing, so this works on either.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const bundles = [
  {
    file: "dist/Lattish.js",
    names: [
      "Fragment",
      "h",
      "text",
      "useLayoutEffect",
      "useEffect",
      "useState",
      "useMemo",
      "useRef",
      "useCallback",
      "createRoot",
      "runBatched",
      "memo",
      "signal",
      "getHookCursor",
      "refreshAllRoots",
    ],
  },
  {
    file: "dist/lattishHmr.js",
    names: [
      "saveLattishHmrMountArgs",
      "getLattishHmrMountArgs",
      "registerLattishHmrRemount",
      "runLattishHmrRemountForModule",
      "installLattishViteHmrDispatcher",
      "exposeLattishHmrGlobals",
    ],
  },
  { file: "dist/jsx-runtime.js", names: ["jsx", "jsxs", "jsxDEV", "Fragment"] },
  { file: "dist/jsx-dev-runtime.js", names: ["jsx", "jsxs", "jsxDEV", "Fragment"] },
];

/**
 * Names already exported by an emitted bundle — `export { a, b as c }` and `export function d`.
 *
 * Deliberately string-scanning rather than regex: the whitespace-run patterns this needs
 * (`\s+as\s+`) backtrack quadratically on a long run, and a build script has no reason to take
 * that on. Exported so the HMR test can reuse it instead of keeping a second copy.
 */
export function existingExports(src) {
  const found = new Set();
  for (const line of src.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("export")) continue;
    const open = t.indexOf("{");
    const close = open === -1 ? -1 : t.indexOf("}", open);
    if (open !== -1 && close !== -1) {
      for (const part of t.slice(open + 1, close).split(",")) {
        const bits = part.trim().split(" as ");
        const name = bits[bits.length - 1].trim();
        if (name) found.add(name);
      }
      continue;
    }
    const words = t.split(" ").filter(Boolean);
    const kw = words[1] === "async" ? 2 : 1;
    if (["function", "const", "let", "var", "class"].includes(words[kw])) {
      const name = (words[kw + 1] || "").split("(")[0].split("=")[0].trim();
      if (name) found.add(name);
    }
  }
  return found;
}

/** Append only the names the emitted bundle is missing. */
export function appendMissingExports(file, names) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    console.error(`missing ${file} — run tish build first`);
    process.exit(1);
  }
  const have = existingExports(fs.readFileSync(p, "utf8"));
  const missing = names.filter((n) => !have.has(n));
  if (missing.length > 0) {
    fs.appendFileSync(p, `\nexport { ${missing.join(", ")} };\n`);
  }
}

// Only run the build step when invoked directly, so importing the helpers is side-effect free.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  for (const { file, names } of bundles) appendMissingExports(file, names);
}
