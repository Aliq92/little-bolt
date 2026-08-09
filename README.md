# Little Bolt

Little Bolt is a mobile-first 2D browser platformer built with Phaser, TypeScript, and Vite. Desktop browsers are supported too.

**Status:** Playable Prototype
**Version:** v0.1.1 — Mobile Playability

Play it live: **[aliq92.github.io/little-bolt](https://aliq92.github.io/little-bolt/)**

This version adds a one-screen movement playground: Little Bolt, a tiny yellow repair robot, can walk, jump, and land on a floor and three platforms. There are intentionally no enemies, hazards, health, score, timers, collectibles, repair mechanics, or a finish objective yet — this milestone is movement only.

v0.1.1 adds no new gameplay. It only improves how the existing movement playground plays on phones: mobile fullscreen entry, landscape play, and larger touch controls.

## Controls

**Keyboard**

| Action | Keys |
| --- | --- |
| Move left | `A` or `Left Arrow` |
| Move right | `D` or `Right Arrow` |
| Jump | `W`, `Up Arrow`, or `Space` |

Jump only works while Little Bolt is grounded, and holding the jump key does not cause repeated jumps. Desktop keyboard controls are unaffected by v0.1.1 and remain fully supported.

**Touch (mobile)**

Larger, ergonomic move buttons (left/right, ~84px) sit in the bottom-left corner, and a bigger jump button (~92px) sits in the bottom-right corner, all with wide safe margins from the screen edges. All three support multi-touch — you can hold a move button with one finger and tap jump with another. Buttons are translucent so Little Bolt stays visible underneath them, and press feedback (brighter outline, deeper fill, slight scale) confirms every tap.

## Mobile play flow (v0.1.1)

On touch-capable devices (detected via coarse-pointer/touch-point feature detection, not user-agent sniffing), a start overlay appears before gameplay begins:

- **LITTLE BOLT** / **Landscape recommended** / **PLAY FULLSCREEN**

Tapping **PLAY FULLSCREEN** uses that same tap gesture to request fullscreen on the game container and then attempt a landscape orientation lock, before starting gameplay. Both browser APIs are feature-detected and their rejection is handled gracefully — nothing crashes and nothing goes blank if a browser doesn't support them.

- **Landscape preference:** if orientation locking isn't supported or is rejected (this varies across Android Chrome and Samsung Internet), Little Bolt shows **"Rotate your phone to play"** and waits for a manual rotation — it never retries the browser APIs without a fresh tap.
- **Portrait pause:** on a touch device, turning to portrait pauses physics and input (Little Bolt's position is preserved, the page never reloads) and shows the rotate message; turning back to landscape resumes exactly where you left off.
- **Fullscreen re-entry:** if fullscreen is exited while still in landscape, gameplay continues in the normal browser view and a small re-entry button appears so you can tap back into fullscreen; the button always requires a fresh tap and hides again once fullscreen is active.
- **Desktop is unaffected:** desktop browsers never see the mobile overlay, are never forced into fullscreen, and never call orientation APIs.

## Gameplay scope (v0.1.0, unchanged in v0.1.1)

- Move left and right
- Jump only while grounded, with no double jump
- Land on the floor and three platforms at different heights
- Falling below the playground resets Little Bolt to the spawn point

This is a movement playground, not a level — there is no win condition. v0.1.1 is a mobile-playability patch only; it adds no objectives, hazards, enemies, collectibles, audio, or new player abilities.

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
│   │   ├── InputController.ts
│   │   └── MobileDisplayController.ts
│   ├── ui/
│   │   └── MobilePlayOverlay.ts
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
