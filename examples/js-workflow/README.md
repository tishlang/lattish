# Lattish from JS/TS

Example using **lattish** from vanilla JavaScript or TypeScript — no Tish compiler. Imports the pre-compiled JS from the `lattish` package.

## Setup

From the `examples/js-workflow/` directory:

```bash
npm install
```

## Run

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview  # serve production build
```

## Using outside the repo

If you copy this example elsewhere, change the dependency to `"lattish": "^1.0.0"` and run `npm install`.

## Files

- `main.ts` — TypeScript entry (default)
- `main.js` — plain JavaScript variant

## Notes

- **lattish** is the only dependency — no `@tishlang/tish` or tish compiler
- Uses `h(tag, props, children)` for creating DOM elements (JSX-style without a transform)
- `useState` and `createRoot` work the same as in Tish projects
