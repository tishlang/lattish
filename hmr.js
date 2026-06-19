/**
 * Vite HMR accept snippet for Lattish mount modules.
 *
 * `@tishlang/vite-plugin-tish` injects a self-accepting boundary in compiled `.tish`
 * output. Because `.tish` source cannot reference `import.meta`, apps/plugins append
 * this snippet (emitted JS only) so hot accept notifies Lattish remount handlers.
 *
 * @param {string} moduleRelId Project-relative `.tish` path (same id passed to
 *   `registerLattishHmrRemount`).
 * @returns {string}
 */
export function viteHmrAcceptSnippet(moduleRelId) {
  const idJson = JSON.stringify(moduleRelId);
  return (
    "if (import.meta.hot) {\n" +
    "  import.meta.hot.accept(() => {\n" +
    '    if (typeof globalThis.__LATTISH_HMR_ACCEPT__ === "function") {\n' +
    "      globalThis.__LATTISH_HMR_ACCEPT__(" +
    idJson +
    ");\n" +
    "    }\n" +
    "  });\n" +
    "}\n"
  );
}

/** Strip the plugin's bare accept boundary so it can be replaced with {@link viteHmrAcceptSnippet}. */
export const VITE_PLUGIN_BARE_ACCEPT_RE =
  /\nif \(import\.meta\.hot\) \{ import\.meta\.hot\.accept\(\); \}\n?$/;
