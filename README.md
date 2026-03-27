# DevToolbox

A native macOS developer utility app built with Tauri v2, React, TypeScript, and Tailwind CSS.

## Tools

- **Text Diff** — Compare two texts with word-level highlighting
- **JWT Decoder** — Decode and verify JWT tokens
- **Data Generator** — Generate fake data with faker.js

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (`rustup` recommended)
- Tauri v2 system dependencies: https://tauri.app/start/prerequisites/

## Setup

```bash
npm install
```

## Development

```bash
npm run tauri dev
```

Opens a native macOS window with hot-reload.

## Build

```bash
npm run tauri build
```

Produces a `.app` bundle and `.dmg` installer in `src-tauri/target/release/bundle/`.

## Frontend only (browser)

```bash
npm run dev
```

Runs the Vite dev server at `http://localhost:1420` without the Tauri native shell.
