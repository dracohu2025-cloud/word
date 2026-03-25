# Newton First Law Interactive Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-version Newton's First Law interactive concept card using React, React Three Fiber, Drei, and Rapier inside the existing Vite project.

**Architecture:** Replace the current Vanilla frontend shell with a React app while preserving the existing `/api/analyze` backend path. Implement the Newton card as a focused feature slice that owns scene state, 3D rendering, and explanation rules, while keeping export and deployment concerns isolated.

**Tech Stack:** Vite, React, React DOM, React Three Fiber, Drei, Rapier, html2canvas, Vitest

---

### Task 1: Upgrade the frontend runtime to React

**Files:**
- Modify: `package.json`
- Create: `src/app/App.jsx`
- Create: `src/main.jsx`
- Modify: `index.html`
- Modify: `vite.config.js`
- Test: `tests/config.test.js`

- [ ] **Step 1: Add a failing config/runtime test where needed**
- [ ] **Step 2: Install React and 3D runtime dependencies**
- [ ] **Step 3: Switch the entrypoint from `src/main.js` to `src/main.jsx`**
- [ ] **Step 4: Mount a minimal React app and keep build/tests green**
- [ ] **Step 5: Verify `npm test` and `npm run build`**

### Task 2: Create the Newton card page shell

**Files:**
- Create: `src/features/newton-first-law/NewtonFirstLawPage.jsx`
- Create: `src/features/newton-first-law/NewtonFirstLawPage.css`
- Modify: `src/app/App.jsx`
- Test: `tests/newton-first-law-page.test.jsx`

- [ ] **Step 1: Write a failing render test for the page shell**
- [ ] **Step 2: Add the page shell with title, controls, explanation, and theory sections**
- [ ] **Step 3: Wire the page into the app**
- [ ] **Step 4: Run the focused test and make it pass**
- [ ] **Step 5: Run the full test suite**

### Task 3: Implement the interaction state model

**Files:**
- Create: `src/features/newton-first-law/useNewtonSimulation.js`
- Create: `src/features/newton-first-law/newtonExplanation.js`
- Test: `tests/newton-simulation.test.js`
- Test: `tests/newton-explanation.test.js`

- [ ] **Step 1: Write failing tests for physics-state transitions**
- [ ] **Step 2: Write failing tests for explanation selection rules**
- [ ] **Step 3: Implement the minimal simulation state hook**
- [ ] **Step 4: Implement the explanation engine**
- [ ] **Step 5: Run focused tests and then full suite**

### Task 4: Build the 3D scene

**Files:**
- Create: `src/features/newton-first-law/scene/NewtonScene.jsx`
- Create: `src/features/newton-first-law/scene/Cart.jsx`
- Create: `src/features/newton-first-law/scene/Track.jsx`
- Create: `src/features/newton-first-law/scene/SceneLights.jsx`
- Test: `tests/newton-scene.test.jsx`

- [ ] **Step 1: Write a failing render smoke test for the scene container**
- [ ] **Step 2: Add an R3F `Canvas` with a basic scene layout**
- [ ] **Step 3: Bind scene motion to simulation state**
- [ ] **Step 4: Ensure zero-friction + pulse mode does not artificially stop from hidden clamping**
- [ ] **Step 5: Run focused tests and build**

### Task 5: Polish the experimental UI

**Files:**
- Modify: `src/features/newton-first-law/NewtonFirstLawPage.jsx`
- Modify: `src/features/newton-first-law/NewtonFirstLawPage.css`
- Test: `tests/newton-first-law-page.test.jsx`

- [ ] **Step 1: Add experimental control panel styling**
- [ ] **Step 2: Add live HUD values and state labels**
- [ ] **Step 3: Add reset/pause interactions**
- [ ] **Step 4: Verify layout on desktop and mobile**
- [ ] **Step 5: Run tests and build**

### Task 6: Restore export behavior for the new page

**Files:**
- Modify: `src/app/App.jsx`
- Modify: `src/lib/export.js`
- Test: `tests/export.test.js`

- [ ] **Step 1: Write or extend a failing export regression test**
- [ ] **Step 2: Reconnect the download-to-PNG path to the new React DOM**
- [ ] **Step 3: Keep animated/3D content from exporting as blank**
- [ ] **Step 4: Run export test and full suite**

### Task 7: Final verification and release

**Files:**
- Modify: `README.md` (if needed)

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run the app locally and visually verify the Newton card**
- [ ] **Step 4: Commit with a feature message**
- [ ] **Step 5: Push to `origin/main` to trigger Vercel deployment**
