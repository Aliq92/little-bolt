# Little Bolt v0.0.1 Project Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, commit, and publish the non-gameplay Little Bolt v0.0.1 Phaser foundation.

**Architecture:** Vite owns the browser entry and production bundling, while `main.ts` creates one Phaser game from centralized configuration. A thin `BootScene` transitions to a presentation-only `MainScene`; future gameplay boundaries exist as tracked empty directories.

**Tech Stack:** Phaser 3.90, TypeScript, Vite, npm, HTML, CSS, Git, GitHub

## Global Constraints

- Version is `v0.0.1 — Project Foundation` and package version is `0.0.1`.
- Repository is public, named `little-bolt`, and uses branch `main`.
- Target mobile browsers first while retaining desktop-browser support.
- Preserve portrait and landscape compatibility through responsive scaling.
- Do not add gameplay, React, Vue, Next.js, Unity, Godot, Capacitor, or unnecessary dependencies.
- Use exact screen copy: `LITTLE BOLT` and `Project initialized successfully.`
- Gameplay updates should be implemented incrementally and kept playable after every version.

---

### Task 1: Project Metadata and Tracked Directory Skeleton

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: all requested `.gitkeep` files under `public/assets` and empty `src` feature directories

**Interfaces:**
- Produces: npm scripts `dev`, `typecheck`, `build`, and `preview`
- Produces: the `#game` HTML mount identifier expected by Phaser configuration

- [ ] **Step 1: Create package metadata and scripts**

Use package version `0.0.1`, runtime dependency `phaser@^3.90.0`, and development dependencies `vite@^8.2.1` and `typescript@^7.0.2`. Define `build` as `npm run typecheck && vite build` so production builds cannot bypass compiler validation.

- [ ] **Step 2: Configure strict TypeScript and Vite**

Set `target` and `module` to `ESNext`, `moduleResolution` to `Bundler`, `strict` to `true`, `noEmit` to `true`, DOM library support, Vite client types, and unused-code checks. Export Vite configuration with relative asset base `./` so the bundle can later be embedded in a mobile wrapper.

- [ ] **Step 3: Create tracked directory boundaries**

Create `.gitkeep` files in:

```text
public/assets/{audio,backgrounds,characters,effects,environment,items,tiles,ui}
src/entities/{enemies,objects,player}
src/systems
src/ui
src/utils
```

The populated `src/config` and `src/scenes` directories do not need `.gitkeep` files.

- [ ] **Step 4: Install dependencies**

Run: `npm install --cache /tmp/little-bolt-npm-cache`

Expected: exit 0 and creation of `package-lock.json`; `node_modules` remains ignored.

### Task 2: Minimal Responsive Phaser Application

**Files:**
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/style.css`
- Create: `src/config/gameConfig.ts`
- Create: `src/scenes/BootScene.ts`
- Create: `src/scenes/MainScene.ts`

**Interfaces:**
- `gameConfig` is a `Phaser.Types.Core.GameConfig` exported from `src/config/gameConfig.ts`.
- `BootScene` registers key `BootScene` and starts `MainScene` from `create()`.
- `MainScene` registers key `MainScene` and draws the placeholder screen from `create()`.

- [ ] **Step 1: Create the browser shell**

Create a standards-mode HTML document with viewport settings including `viewport-fit=cover`, title `Little Bolt`, a `main` element with `id="game"`, and a module script pointing to `/src/main.ts`.

- [ ] **Step 2: Create responsive global styling**

Make `html`, `body`, and `#game` fill the viewport; use `100dvh` with a `100vh` fallback; remove margins; prevent overflow and touch scrolling; center the canvas; and give the page the same dark background as the Phaser configuration.

- [ ] **Step 3: Implement both thin scenes**

`BootScene.create()` calls `this.scene.start('MainScene')`. `MainScene.create()` reads the current camera center and renders `LITTLE BOLT` above `Project initialized successfully.` with centered origins and accessible contrast. It adds no input, update loop, physics, assets, or gameplay state.

- [ ] **Step 4: Configure and start Phaser**

Configure `Phaser.AUTO`, parent `game`, logical size `960 × 540`, dark background `#101827`, scene order `[BootScene, MainScene]`, `Phaser.Scale.FIT`, and `Phaser.Scale.CENTER_BOTH`. In `main.ts`, import CSS and instantiate `new Phaser.Game(gameConfig)`.

- [ ] **Step 5: Run compiler and production build checks**

Run: `npm run typecheck`

Expected: exit 0 with no TypeScript diagnostics.

Run: `npm run build`

Expected: exit 0 and production files under `dist/`.

### Task 3: Documentation, Runtime Smoke Check, Hygiene, and Publication

**Files:**
- Create: `README.md`
- Inspect: `dist/index.html` and built assets
- Modify: Git metadata and remote configuration

**Interfaces:**
- Produces: public GitHub repository URL and commit SHA

- [ ] **Step 1: Write the README**

Document the product summary, status `Foundation`, version `v0.0.1 — Project Foundation`, stack, requested directory tree, installation, `npm run dev`, `npm run typecheck`, `npm run build`, `npm run preview`, mobile-browser priority, future Capacitor Android packaging, and the exact incremental-playability rule.

- [ ] **Step 2: Re-run fresh verification**

Run: `npm run typecheck && npm run build`

Expected: exit 0, no compiler errors, and a fresh `dist/` bundle.

- [ ] **Step 3: Smoke-test the production server**

Run `npm run preview -- --host 127.0.0.1`, request the served root document, request its referenced JavaScript bundle, confirm HTTP 200 responses, and stop the server. Confirm the HTML references the built entry and the JavaScript bundle contains both required display strings.

- [ ] **Step 4: Check repository hygiene and scope**

Run `git status --short --ignored`, `git diff --check`, inspect `git ls-files`, and scan tracked files for credential-shaped strings. Confirm `node_modules/` and `dist/` are ignored, no environment files or machine-specific paths are tracked, and only foundation files are included.

- [ ] **Step 5: Commit the completed foundation**

Stage the intended foundation files and commit with:

```text
chore: initialize Little Bolt v0.0.1 foundation
```

- [ ] **Step 6: Create and push the GitHub repository**

Create public repository `little-bolt` with description `A mobile-first 2D platformer built with Phaser, TypeScript and Vite.`, configure it as `origin`, and push `main`. If this environment cannot create repositories because neither GitHub CLI nor a repository-creation connector is available, preserve the verified local Git commit and report the exact single manual creation/push step without exposing credentials.

- [ ] **Step 7: Verify publication state**

Confirm the remote URL, branch `main`, pushed commit SHA, repository visibility, description, and clean local status. Report all verification commands and any manual action still required.
