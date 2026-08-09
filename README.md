# Little Bolt

Little Bolt is a mobile-first 2D browser platformer built with Phaser, TypeScript, and Vite. Desktop browsers are supported too.

**Status:** Playable Prototype
**Version:** v0.1.0 — First Movement

Play it live: **[aliq92.github.io/little-bolt](https://aliq92.github.io/little-bolt/)**

This version adds a one-screen movement playground: Little Bolt, a tiny yellow repair robot, can walk, jump, and land on a floor and three platforms. There are intentionally no enemies, hazards, health, score, timers, collectibles, repair mechanics, or a finish objective yet — this milestone is movement only.

## Controls

**Keyboard**

| Action | Keys |
| --- | --- |
| Move left | `A` or `Left Arrow` |
| Move right | `D` or `Right Arrow` |
| Jump | `W`, `Up Arrow`, or `Space` |

Jump only works while Little Bolt is grounded, and holding the jump key does not cause repeated jumps.

**Touch (mobile)**

Two translucent move buttons sit in the bottom-left corner, and a jump button sits in the bottom-right corner. All three support multi-touch — you can hold a move button with one finger and tap jump with another.

## Gameplay scope (v0.1.0)

- Move left and right
- Jump only while grounded, with no double jump
- Land on the floor and three platforms at different heights
- Falling below the playground resets Little Bolt to the spawn point

This is a movement playground, not a level — there is no win condition.

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
│   │   ├── constants.ts
│   │   └── gameConfig.ts
│   ├── entities/
│   │   ├── enemies/
│   │   ├── objects/
│   │   └── player/
│   │       └── Player.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   └── MainScene.ts
│   ├── systems/
│   │   └── InputController.ts
│   ├── ui/
│   ├── utils/
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Still-empty directories contain `.gitkeep` files so Git preserves the intended project boundaries.

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

The long-term intention is to package the browser build as an Android application, likely with Capacitor. Capacitor and Android project files remain outside scope for now; the Vite `base: './'` relative asset path is kept compatible with that future packaging.

## Development rule

Gameplay updates should be implemented incrementally and kept playable after every version.
