# Little Bolt

Little Bolt is a mobile-first 2D browser platformer foundation built with Phaser, TypeScript, and Vite. Desktop browsers are supported too.

**Status:** Foundation
**Version:** v0.0.1 — Project Foundation

This version proves the project can install, type-check, run, and produce a deployable browser build. It intentionally contains no gameplay yet.

## Technology stack

- [Phaser 3](https://phaser.io/) for rendering and scene orchestration
- [TypeScript](https://www.typescriptlang.org/) for typed source code
- [Vite](https://vite.dev/) for local development and production builds
- npm for dependency management

## Project structure

```text
little-bolt/
├── public/
│   └── assets/
│       ├── audio/
│       ├── backgrounds/
│       ├── characters/
│       ├── effects/
│       ├── environment/
│       ├── items/
│       ├── tiles/
│       └── ui/
├── src/
│   ├── config/
│   │   └── gameConfig.ts
│   ├── entities/
│   │   ├── enemies/
│   │   ├── objects/
│   │   └── player/
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   └── MainScene.ts
│   ├── systems/
│   ├── ui/
│   ├── utils/
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Empty directories contain `.gitkeep` files so Git preserves the intended project boundaries.

## Install dependencies

Requires Node.js 22.12 or newer.

```bash
npm install
```

## Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite.

## Type-check the project

```bash
npm run typecheck
```

## Create a production build

```bash
npm run build
```

The production files are generated in `dist/`.

To inspect that build locally:

```bash
npm run preview
```

## Mobile direction

Little Bolt targets mobile browsers first while remaining usable in desktop browsers. The Phaser canvas scales to fit portrait and landscape browser windows while preserving its logical game area.

The long-term intention is to package the browser build as an Android application, likely with Capacitor. Capacitor and Android project files are deliberately outside the v0.0.1 foundation scope.

## Development rule

Gameplay updates should be implemented incrementally and kept playable after every version.
