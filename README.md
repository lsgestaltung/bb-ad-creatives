# BB Bad & Sanitär – Meta Ad Creatives (4:5 · 16:9 · 9:16)

HTML/CSS-Framework für Meta-Anzeigen, das 1:1 auf dem Branding von
https://bb-komplettbad.de aufsetzt. Keine erfundene CI – alle Tokens stammen
aus dem Live-Stylesheet der Website, Logo und Fotos sind die Originale.

## Branding-Analyse (Stand: Website-Build Sept. 2026)

| Element        | Website                                                  | Im Framework           |
|----------------|----------------------------------------------------------|------------------------|
| Logo           | `logo-positive.svg` (Navy) / `logo-negative.svg` (Weiß), Icon aus 2×2 abgerundeten Quadraten in Orange/Navy + Wortmarke „Bad & Sanitär“ + „Komplettbadlösungen“ | `assets/logo/` (unverändert) |
| Primärfarbe    | `--primary: oklch(30% .13 265)` ≈ `#102D69` (Navy, auch im Logo) | `--primary`            |
| Akzent         | `--accent: oklch(65% .23 32)` ≈ `#FF3F00` (Orange-Rot, auch im Logo) | `--accent`             |
| Hintergrund    | `oklch(99.5% .003 80)` warmes Off-White; Sand `oklch(94% .02 75)`, Stone `oklch(88% .02 70)` | `--background`, `--sand`, `--stone` |
| Text           | Foreground `oklch(20% .05 265)`, Muted `oklch(48% .03 265)` | `--foreground`, `--muted-foreground` |
| Schrift        | Manrope 400/500/600/700 (self-hosted woff2)               | `assets/fonts/`, `@font-face` |
| Headlines      | `font-semibold`, `leading-[1.05]`, `text-primary`          | `.headline` (600, 1.05) |
| Eyebrow        | `.eyebrow`: uppercase, `letter-spacing .16em`, accent, 600; in dunklen Sections `primary-foreground/60` | `.eyebrow`, `.eyebrow--light` |
| Buttons        | `rounded-full`, `bg-accent`, `font-semibold`, Lucide `arrow-right`; Sekundär: `border-primary/20` | `.btn--accent`, `.btn--outline` |
| Karten         | `rounded-2xl` (= 20 px), `border`, `bg-card`               | `.card`                |
| Radius-System  | `--radius: .75rem` → xl 16 px, 2xl 20 px, 3xl 24 px, full  | `--radius-*`           |
| Dunkle Sections| `bg-primary`, Text `primary-foreground/70`, Badge „Ein Ansprechpartner“ uppercase 11 px | `.ad--dark`, `.badge--glass` |
| Formsprache    | Ruhig, viel Weißraum, weiche Radien, Pills, wenig Deko    | Abstände `--pad: 72px` |

Icons: Lucide (arrow-right, check, x) – wie auf der Website.

## Struktur

```
bb-ad-creatives/
├── assets/
│   ├── logo/       bb-logo-positive.svg, bb-logo-negative.svg (Original)
│   ├── photos/     alle Fotos der Website (Referenzen, Showroom, Team)
│   └── fonts/      Manrope woff2 (von der Website)
├── framework/
│   ├── bb-ads.css  Tokens + Komponenten (Canvas, Typo, Buttons, Chips, Karten, Scrims)
│   ├── bb-ads.js   füllt data-slot / data-photo / data-list / data-chips aus window.AD
│   └── icons.html  Lucide-SVGs zum Kopieren
├── creatives/      01–05: je eine HTML-Renderfläche (1080×1350)
├── tools/render.mjs  Playwright-Export als PNG (pixelgenau)
├── exports/        fertige PNGs
└── _preview/       Kontaktbogen aller Renderings
```

## Creative bearbeiten

Jede Datei in `creatives/` hat oben einen Block `window.AD = { … }`.
Nur dort ändern – Foto, Headline, Sub, CTA, Chips, Fußzeile:

```js
window.AD = {
  eyebrow:  "Badsanierung · Baden-Baden",
  headline: "Aus alt wird<br>Ihr neues Bad.",     // HTML erlaubt
  cta:      "Projekt anfragen",
  photos: { after: { src: "../assets/photos/Nachher-Gesamt.webp", focus: "50% 50%" } }
};
```

`focus` = `object-position` (Bildausschnitt). Leerer String blendet den Slot aus.
Im Browser öffnen → Vorschau zentriert mit Schatten (Klasse `preview` am Body).

## Formate

Jedes Creative rendert in drei Formaten – Umschalten per URL-Parameter:

| Format | Größe      | Einsatz                          | URL                    |
|--------|------------|----------------------------------|------------------------|
| 4x5    | 1080×1350  | Feed (Facebook/Instagram)        | `…html?format=4x5`     |
| 16x9   | 1920×1080  | Querformat (Reels-Cover, Video-Thumbnails, Desktop-Placements) | `…html?format=16x9` |
| 9x16   | 1080×1920  | Stories / Reels                  | `…html?format=9x16`    |

Story-Format hält die Meta-Safe-Zones ein (oben 250 px, unten 340 px frei von Logo/Text/CTA).
`?guides=1` blendet die Zonen in der Browser-Vorschau ein (nicht im Export).
Format-spezifische Layout-Anpassungen liegen im `<style>` jedes Creatives
(`html[data-format="9x16"] …`, `html[data-format="16x9"] …`).

## Export als PNG

```bash
node tools/render.mjs                  # alle Creatives × alle Formate → exports/<format>/
node tools/render.mjs --format 9x16    # nur ein Format
node tools/render.mjs --only 03        # nur ein Creative
node tools/render.mjs --scale 2        # doppelte Pixelmaße (z. B. 2160×2700)
```

Voraussetzung: Node ≥ 18 + Playwright mit Chromium (`npm i -D playwright && npx playwright install chromium`;
im Skript ggf. den Import-Pfad auf `'playwright'` ändern).

## Neues Creative anlegen

1. `creatives/0X-name.html` aus einem bestehenden kopieren.
2. `window.AD` anpassen, Layout über die vorhandenen Klassen (`.topbar`, `.content--bottom`, `.photo-frame`, `.chip`, `.list`, `.card`) bauen.
3. `node tools/render.mjs --only 0X`.

## Copy-Regeln (aus der Website abgeleitet)

- Sie-Form, kurze Sätze, Punkt am Ende der Headline-Zeilen („Ihr neues Bad. Persönlich geplant.“).
- Kein Verkaufsdruck-Vokabular; Kernbotschaften: ein Ansprechpartner, Planung + Koordination, Region Baden-Baden.
- Ausführung erfolgt durch Partner-Fachbetriebe – „aus einer Hand“ meint Planung/Koordination/Übergabe.
