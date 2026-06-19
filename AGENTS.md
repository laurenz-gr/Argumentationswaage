# AGENTS.md

## Learned User Preferences

- Communicates in German and expects responses in German.
- Wants to brainstorm/concept and agree on the target and design direction before implementation starts.
- Prefers running the app as a local dev server and previewing it inside Cursor for layout feedback.
- New UI should follow the frontend guidelines and match the project's existing color scheme/design system.
- Wants feature scope to be as complete as possible rather than a minimal version.
- When an audit surfaces issues, wants all of them fixed ("Alles fixen") and re-verified.
- Frequently asks for the recommended next step ("Was machen wir als nächstes?") and then approves the suggestion.

## Learned Workspace Facts

- This workspace is "Argumentationswaage", a classroom PWA inspired by argumentationswippe.de (a drag-and-drop argument-balance/scale tool for weighing pro/contra arguments), built to run more stably and be cleaner than the original.
- Tech stack: React 19 + TypeScript + Vite with `vite-plugin-pwa`, Zustand for state, `@dnd-kit` for drag-and-drop, `lucide-react` icons, and `html-to-image` for export.
- Testing setup uses Vitest (jsdom + Testing Library) and Playwright e2e with `@axe-core/playwright` for accessibility checks.
- The shared design tokens/color scheme live in `design-system.html` in the project root.
- Scripts: `npm run dev` (dev server), `npm run build` (tsc -b + vite build), `npm run preview`, `npm test` (vitest), `npm run test:e2e` (Playwright).
