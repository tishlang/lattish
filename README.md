# Lattish

Lattish runtime for Tish JSX — hooks + DOM helpers for compiled Tish apps.

## Install

```bash
npm install lattish
# or
npm install @tishlang/lattish
```

Requires [Tish](https://github.com/tishlang/tish) **2.12+** for per-module ESM (`compile-module` / `@tishlang/vite-plugin-tish`).

## Usage

```javascript
import { useState, createRoot, h, Fragment } from 'lattish'

fn App() {
  let [count, setCount] = useState(0)
  return <div>
    <p>{"Count: " + String(count)}</p>
    <button onclick={() => setCount(count + 1)}>Increment</button>
  </div>
}

createRoot(document.getElementById("root")).render(App)
```

With **tish 2.12+** and `--format esm` / `compile-module`, JSX modules get `h` / `Fragment` auto-imported from `lattish` when missing — you do not need to import them by hand.

### Automatic JSX runtime (`jsx` / `jsxs`)

For compilers that emit the modern automatic-runtime shape ([tishlang/tish#291](https://github.com/tishlang/tish/issues/291)):

```javascript
import { jsx, jsxs, Fragment } from 'lattish/jsx-runtime'
// dev: import from 'lattish/jsx-dev-runtime'
```

These wrap the same `h` / `Fragment` implementation as the classic factory entry. Set tish's `jsxImportSource` to `lattish` and the compiler emits `import { jsx, jsxs, Fragment } from "lattish/jsx-runtime"` automatically.

## Exports

| Entry | Exports |
|-------|---------|
| `lattish` | `h`, `Fragment`, `createRoot`, hooks |
| `lattish/jsx-runtime` | `jsx`, `jsxs`, `jsxDEV`, `Fragment` |
| `lattish/jsx-dev-runtime` | same as jsx-runtime (dev entry) |

## Examples

- **Tish** — `examples/features/` (requires tish compiler)
- **JS/TS** — `examples/js-workflow/` (no tish; imports compiled lattish)

## Links

- [Tish language](https://tishlang.com)
- [Tish compiler](https://github.com/tishlang/tish)
- [Lattish docs](https://lattish.com)
