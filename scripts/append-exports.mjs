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

/** Names already exported by the emitted bundle (`export { a, b }` and `export fn c`). */
function existingExports(src) {
  const found = new Set();
  for (const m of src.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) found.add(name);
    }
  }
  for (const m of src.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    found.add(m[1]);
  }
  return found;
}

for (const { file, names } of bundles) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    console.error(`missing ${file} — run tish build first`);
    process.exit(1);
  }
  const src = fs.readFileSync(p, "utf8");
  const have = existingExports(src);
  const missing = names.filter((n) => !have.has(n));
  if (missing.length === 0) continue;
  fs.appendFileSync(p, `\nexport { ${missing.join(", ")} };\n`);
}
