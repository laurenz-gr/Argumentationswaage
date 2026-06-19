# Argumentationswaage

Ein Unterrichtswerkzeug, um Argumente zu sammeln, zu gewichten und ihre Wirkung auf einer
Waage (Wippe) zu visualisieren. Pro-Argumente neigen die Waage nach rechts,
Contra-Argumente nach links. Die App ist eine installierbare PWA und funktioniert offline.

## Features

- **Argumente anlegen & bearbeiten** mit leichtem Markdown (`**fett**`, `*kursiv*`, `[Link](https://…)`).
- **Gewichten von 1–3** pro Seite – per Drag-and-drop oder per Tastatur (←/→ Seite, ↑/↓ Gewicht).
- **Live-Waage** mit Neigung und Punktestand.
- **Farben & Legende** zur thematischen Gruppierung; Legenden-Beschriftungen bleiben erhalten,
  auch wenn eine Farbe vorübergehend nicht genutzt wird.
- **Undo/Redo** (Toolbar oder `Strg/Cmd+Z` bzw. `Strg/Cmd+Shift+Z`).
- **Autosave**: Das Projekt wird lokal gespeichert und beim nächsten Öffnen wiederhergestellt.
- **Export**: als Bild (PNG, mit eingebetteten Projektdaten zum erneuten Laden), als
  JSON-Projektdatei oder per Druck. Die Legende ist im Export enthalten.
- **Hell/Dunkel**, optionale Muster, **Zen-Modus** und **DE/EN**.

## Tech-Stack

React 19 · TypeScript · Vite · `vite-plugin-pwa` · Zustand (+ `zundo` für History) ·
`@dnd-kit` · `lucide-react` · `html-to-image`. Tests mit Vitest und Playwright (inkl. `@axe-core`).

## Scripts

```bash
npm run dev        # Dev-Server
npm run build      # Typecheck + Produktions-Build
npm run preview    # Build lokal ansehen
npm test           # Unit-Tests (Vitest)
npm run test:e2e   # End-to-End-Tests (Playwright)
npm run lint       # ESLint
```

## Architektur

```
src/
├── domain/     Reine Logik + Unit-Tests (Modell, Waagen-Berechnung, Serialisierung, PNG-Metadaten)
├── store/      Zustand-Stores (Projekt = persistiert + Undo/Redo, Einstellungen = persistiert)
├── features/   Fachliche UI-Bereiche: board (Waage), settings (Toolbar), export
├── components/ Wiederverwendbare UI-Bausteine (Button, Modal, Toast, Markdown)
├── i18n/       Typisierte Übersetzungen (de/en)
└── styles/     Design-Tokens und globale Styles
```

Leitlinie: `domain/` kennt kein React, `store/` orchestriert den Zustand, `features/` rendert.

## Datenschutz

Alle Daten bleiben lokal im Browser – es werden keine Inhalte an einen Server gesendet.
Argumente und Einstellungen werden über `localStorage` auf dem jeweiligen Gerät gespeichert.
