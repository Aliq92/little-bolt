# Little Bolt

Little Bolt is a mobile-first 2D browser platformer built with Phaser, TypeScript, and Vite. Desktop browsers are supported too.

**Status:** Playable Prototype
**Version:** v0.3.0 — Live Wire

Play it live: **[aliq92.github.io/little-bolt](https://aliq92.github.io/little-bolt/)**

This version turns the one-screen movement playground into one tiny, complete objective with one simple hazard: Little Bolt, a tiny yellow repair robot, walks and jumps across a floor and three platforms to reach a glowing charging station — while avoiding one exposed, sparking live wire lying across the ground. There are intentionally no enemies, health, lives, score, timers, collectibles, or repair mechanics beyond that single objective — this milestone is still movement plus one small win condition, with one hazard to make the route interesting.

## The objective

When gameplay starts, a HUD message reads **"Reach the charging station. Avoid the live wire."** A glowing charging station sits on the rightmost platform — reachable with Little Bolt's existing walk and jump. Touching it:

1. Completes the objective (once — repeated contact does nothing further).
2. Stops and disables movement input.
3. Shows a centered **"POWER RESTORED" / "Objective complete"** overlay with a **PLAY AGAIN** button.

Tapping **PLAY AGAIN** cleanly restarts the scene — Little Bolt, the live wire, the charging station, the touch controls, physics, and the objective state all return to their initial state.

## The live wire hazard

A short, damaged cable lies flat on the ground between the second and third platforms, sparking with cyan flickers and pulsing softly. It's static (it never moves) and short enough to clear with Little Bolt's ordinary jump from either direction. Touching it from either side triggers a quick, forgiving recovery:

- Movement input is cleared and disabled, and Little Bolt's velocity stops immediately.
- Little Bolt flickers briefly, the camera gives a small shake, and the screen gives a subtle cyan flash.
- After about half a second, Little Bolt reappears at the starting position with a clean physics state, and controls return — there's no game-over screen, no lives, and no penalty beyond the quick reset. The objective stays incomplete, so you can try again right away.

v0.3.0 adds nothing beyond this one hazard — no enemy AI, moving hazards, multiple hazards, health/lives, damage counters, or a game-over screen.

## Controls

**Keyboard**

| Action | Keys |
| --- | --- |
| Move left | `A` or `Left Arrow` |
| Move right | `D` or `Right Arrow` |
| Jump | `W`, `Up Arrow`, or `Space` |

Jump only works while Little Bolt is grounded, and holding the jump key does not cause repeated jumps. Desktop keyboard controls are unchanged in v0.3.0 and remain fully supported.

**Touch (mobile)**

Larger, ergonomic move buttons (left/right, ~84px) sit in the bottom-left corner, and a bigger jump button (~92px) sits in the bottom-right corner, all with wide safe margins from the screen edges. All three support multi-touch — you can hold a move button with one finger and tap jump with another. Buttons are translucent so Little Bolt stays visible underneath them, and press feedback (brighter outline, deeper fill, slight scale) confirms every tap.

Reaching the charging station, or touching the live wire, disables movement input briefly (permanently until PLAY AGAIN for the former, for about half a second for the latter); the completion overlay's button is sized and positioned the same touch-friendly way as the rest of the mobile UI.

## Mobile play flow

On touch-capable devices (detected via coarse-pointer/touch-point feature detection, not user-agent sniffing), a start overlay appears before gameplay begins:

- **LITTLE BOLT** / **Landscape recommended** / **PLAY FULLSCREEN**

Tapping **PLAY FULLSCREEN** uses that same tap gesture to request fullscreen on the game container and then attempt a landscape orientation lock, before starting gameplay. Both browser APIs are feature-detected and their rejection is handled gracefully — nothing crashes and nothing goes blank if a browser doesn't support them.

- **Landscape preference:** if orientation locking isn't supported or is rejected (this varies across Android Chrome and Samsung Internet), Little Bolt shows **"Rotate your phone to play"** and waits for a manual rotation — it never retries the browser APIs without a fresh tap.
- **Portrait pause:** on a touch device, turning to portrait pauses physics and input (Little Bolt's position is preserved, the page never reloads) and shows the rotate message; turning back to landscape resumes exactly where you left off.
- **Fullscreen re-entry:** if fullscreen is exited while still in landscape, gameplay continues in the normal browser view and a small re-entry button appears so you can tap back into fullscreen; the button always requires a fresh tap and hides again once fullscreen is active.
- **Desktop is unaffected:** desktop browsers never see the mobile overlay, are never forced into fullscreen, and never call orientation APIs.
- **Portrait guard stays authoritative during completion:** if you rotate to portrait while the "POWER RESTORED" overlay is showing, the rotate overlay takes over exactly as it does mid-run — physics and input stay suspended, and rotating back to landscape restores the completion overlay so PLAY AGAIN is reachable again.
- **Portrait guard stays authoritative during hazard recovery:** if you rotate to portrait right after touching the live wire, Little Bolt still resets to the starting position when the brief recovery delay ends, but controls stay disabled behind the rotate overlay. Rotating back to landscape only restores controls once recovery has actually finished — whichever of the two takes longer wins.

## Gameplay scope (v0.3.0)

- Move left and right
- Jump only while grounded, with no double jump
- Land on the floor and three platforms at different heights
- Falling below the playground resets Little Bolt to the spawn point
- Avoid the sparking live wire on the ground — touching it briefly disables control and resets Little Bolt to the start, without ending the run or affecting the objective
- Reach the glowing charging station on the rightmost platform to complete the one objective, then replay via PLAY AGAIN

This is still a small, one-screen playground — one win condition and one hazard, nothing more. v0.3.0 adds no enemy AI, moving or multiple hazards, health/lives, a game-over screen, damage statistics, checkpoints, collectibles, inventory, combat, additional objectives, multiple levels, audio, or new player abilities. Movement speed, jump velocity, gravity, and the platform layout are unchanged from v0.2.0.

## Current limitations

Little Bolt is still a small, single-screen prototype: one objective, one hazard, three platforms, no persistence between sessions, and no sound. It's meant to stay playable and complete at every version rather than grow into a full level all at once.

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
│   │   │   ├── ChargingStation.ts
│   │   │   └── LiveWireHazard.ts
│   │   └── player/
│   │       └── Player.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   └── MainScene.ts
│   ├── systems/
│   │   ├── HazardSystem.ts
│   │   ├── InputController.ts
│   │   ├── MobileDisplayController.ts
│   │   └── ObjectiveSystem.ts
│   ├── ui/
│   │   ├── CompletionOverlay.ts
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
