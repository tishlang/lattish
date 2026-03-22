# Lattish Examples

Examples demonstrating the functionality documented at [lattish.dev](https://lattish.dev). All examples use JSX.

## Build

From the `examples/` directory:

```bash
npm install
npm run build
```

Or build a single example:

```bash
npm run build:01
```

## Run in Browser

1. Build all examples (see Build above)
2. Serve the `examples/` folder with a local server (required for ES modules):

   ```bash
   cd examples && python3 -m http.server 8080
   ```

3. Open http://localhost:8080 — use the dropdown to switch between examples

## Examples

| File | Demonstrates |
|------|--------------|
| 01-counter.tish | useState, createRoot |
| 02-list.tish | useState with array, .map |
| 03-greeting.tish | Component pattern, props |
| 04-ref.tish | useRef, useEffect |
| 05-memo.tish | useMemo |
| 06-effects.tish | useEffect, fetch |
| 07-batched.tish | Automatic batching (React 18 style) |
| 08-fragment.tish | Fragment |
