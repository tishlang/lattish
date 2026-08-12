# Lattish tests

| Suite | Runner | Why |
|-------|--------|-----|
| `lattish.jsemit.tish` | `node test/run-tests.mjs` (JS emit + jsdom) | DomHost / reconciler — needs DOM |
| `jsx-runtime.jsemit.tish` | same | Vnode factory under **compiled JS** |
| `jsx-runtime.test.tish` | `tish test` (VM) | Prepared native suite — **blocked** until `Lattish.tish` drops JS `undefined` |
| `hmr-vite.test.mjs` | Node + Vite | HMR remount — outside `tish test` |

Tish is not JavaScript: moving DomHost tests to `tish test` without a Tish DOM host would test something else.
