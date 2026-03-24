# Lattish

Lattish runtime for Tish JSX — hooks + DOM helpers for compiled Tish apps.

## Install

```bash
npm install lattish
# or
npm install @tishlang/lattish
```

## Usage

```javascript
import { useState, createRoot, h, Fragment } from 'lattish'

fn App() {
  let [count, setCount] = useState(0)
  return <div>
    <p>{"Count: " + String(count)}</p>
    <button onclick={() => setCount(count + 1)}>{"Increment"}</button>
  </div>
}

createRoot(document.getElementById("root")).render(App)
```

Requires the [Tish](https://github.com/tishlang/tish) compiler with `--jsx lattish` (default) and node_modules resolution for bare specifiers. The compiler lowers JSX to calls that Lattish provides.

## Exports

- `h`, `Fragment`, `text` — DOM runtime for compiled JSX
- `createRoot` — mount and re-render
- `useState`, `useRef`, `useMemo`, `useEffect`, `useLayoutEffect` — hooks (DOM event handlers batch updates automatically)

## Examples

- **Tish** — `examples/features/` (requires tish compiler)
- **JS/TS** — `examples/js-workflow/` (no tish; imports compiled lattish)

## Links

- [Tish language](https://tishlang.com)
- [Tish compiler](https://github.com/tishlang/tish)
