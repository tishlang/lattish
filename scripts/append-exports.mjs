#!/usr/bin/env node
/** Append ESM named exports to tish-compiled bundles (tish build does not emit export lines). */
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

for (const { file, names } of bundles) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    console.error(`missing ${file} — run tish build first`);
    process.exit(1);
  }
  fs.appendFileSync(p, `\nexport { ${names.join(", ")} };\n`);
}
