# Little Bolt v0.0.1 Project Foundation Design

## Scope

Create a public GitHub repository named `little-bolt` containing a minimal, working foundation for a mobile-first 2D browser platformer. This version establishes project structure and proves the Phaser runtime works. It does not introduce gameplay.

## Technology

- Phaser 3 for canvas rendering and scene orchestration
- TypeScript with strict compiler settings
- Vite for development and production builds
- npm for dependency and script management

No UI framework, application framework, gameplay library, test runner, linter, Android wrapper, or generated game asset is included in this version.

## Architecture

The application has one composition entry point, one centralized Phaser configuration module, and two deliberately thin scenes:

- `src/main.ts` imports the global stylesheet and creates the Phaser game.
- `src/config/gameConfig.ts` defines renderer, logical dimensions, scene order, background, and scaling behavior.
- `src/scenes/BootScene.ts` is the future initialization boundary and immediately transitions to `MainScene`.
- `src/scenes/MainScene.ts` renders the temporary background and the two required centered text lines.

The requested empty feature and asset directories remain tracked through `.gitkeep` files. Future gameplay rules belong under `src/systems` rather than accumulating inside scene update loops.

## Responsive Presentation

Phaser uses a logical 960 by 540 game area with `Phaser.Scale.FIT` and `Phaser.Scale.CENTER_BOTH`. The browser may be portrait or landscape; Phaser preserves the logical aspect ratio while fitting the available viewport. CSS removes page margins, prevents overflow, centers the canvas, and accounts for the full dynamic viewport height on mobile browsers.

The foundation screen uses only programmatic color and text, so it has no runtime asset-loading failure path.

## Repository Structure

The repository contains the requested `public/assets` categories, source feature boundaries, root configuration, README, lockfile, and this design record. Generated dependency and build directories are ignored and are not committed.

## Scripts and Verification

- `npm run dev` starts Vite's development server.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run build` runs the type check and then creates the Vite production bundle.
- `npm run preview` serves the production bundle locally for browser verification.

Completion requires dependency installation, successful type checking, a successful production build, inspection of the generated bundle through the preview server, a repository hygiene check, and a clean Git commit.

## Documentation

The README identifies the version as `v0.0.1 — Project Foundation`, the status as `Foundation`, and documents the technology, directory layout, commands, mobile-browser priority, and eventual Capacitor-based Android packaging direction.

It includes the rule: "Gameplay updates should be implemented incrementally and kept playable after every version."

## Version-Control and Publishing

The default branch is `main`. The finished foundation uses the commit message `chore: initialize Little Bolt v0.0.1 foundation`. The GitHub repository is public and uses the description `A mobile-first 2D platformer built with Phaser, TypeScript and Vite.`

## Explicit Non-Goals

This version does not add movement, physics, platforms, enemies, levels, collectibles, repair systems, save data, audio, menus, deployment, service workers, Capacitor, or Android project files.
