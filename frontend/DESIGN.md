# MASI Quant Risk Engine - Neo-Broker Design System

## Product Context
The MASI Quant Risk Engine is a comprehensive platform for evaluating financial risks associated with the MASI (Moroccan All Shares Index). This frontend embraces a "Neo-Broker" design aesthetic, tailored for both casual investors (Simple Mode) and quantitative analysts/risk managers (Advanced Mode). It strictly avoids overwhelming legacy financial interfaces in favor of a modern, minimal, and highly informative experience.

## Aesthetic Direction: Cyber-Minimalism
- **Vibe:** Dark, precise, neon-lit data, focused on clarity and contrast.
- **Goal:** Instill confidence through clear numbers and sharp charts while maintaining a slick, modern feel.
- **Key Concepts:** Void backgrounds, glass panels, neon directional colors for PnL/Risk, and high-legibility typography for data.

## Typography
- **Primary / UI Font:** `Outfit` (sans-serif)
  - Used for all body text, headings, buttons, and general UI components.
  - Weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold).
- **Data / Numbers Font:** `JetBrains Mono` (monospace)
  - Used STRICTLY for all numerical values, tables, and financial data (`.font-mono-data`).
  - Ensures tabular alignment and gives a "quant/terminal" feel to the data.
  - Weights: 400 (regular), 500 (medium), 700 (bold).

## Color Palette

### Surfaces
Deep, dark blue/black tones to reduce eye strain and make neon colors pop.
- `--surface-void`: `#050810` (Main app background)
- `--surface-raised`: `#0A1020` (Cards, panels)
- `--surface-hover`: `#0E1530` (Hover states)
- `--surface-glass`: `rgba(10, 16, 32, 0.85)` (Glassmorphic panels with blur)
- `--surface-active`: `#121D38` (Active states, pressed)

### Neon Directional Colors
Used to indicate financial status (profit, loss, risk, neutral information).
- `--neon-profit`: `#00FFA3` (Positive returns, safe zones)
- `--neon-loss`: `#FF2D55` (Losses, violations, danger zones)
- `--neon-warning`: `#FFB020` (Caution, high VaR, yellow zones)
- `--neon-accent`: `#2D7CFF` (Primary brand color, interactive elements)
- `--neon-cyan`: `#00D4FF` (Secondary accent, neutral data visualization)

### Text
High contrast for readability.
- `--text-primary`: `#E8ECF4` (Main headings, prominent text)
- `--text-secondary`: `#7A8499` (Labels, subtitles)
- `--text-muted`: `#4A5568` (Disabled text, less important details)

### Borders
Subtle neon glows and lines to separate content without creating visual noise.
- `--border-subtle`: `rgba(45, 124, 255, 0.08)` (Dividers)
- `--border-visible`: `rgba(45, 124, 255, 0.15)` (Card borders)
- `--border-glow`: `rgba(45, 124, 255, 0.30)` (Active focus rings)

## Spacing & Layout
- **Base Unit:** 4px (Tailwind standard).
- **Grid Discipline:** Multi-page layout featuring a persistent sidebar for navigation and a main content area.
- Content must breathe. Use ample padding (`p-6`, `p-8`) within glass panels.

## Motion & Animation
Intentional and smooth. No jarring movements.
- `tooltipIn`: Subtle fade and scale up for tooltips.
- `fadeIn`: General page or component load.
- `slideUp` / `slideDown`: For dropdowns or expanding sections.
- `pulseGlow`: For active alerts or live data indicators.
- `shimmer`: Loading skeleton state.
- `countUp`: For financial metrics ticking up to their final value.

## Decisions Log
- **Decision 1:** Decoupled mode state (Simple/Advanced) into `ModeContext` to allow any component in the tree to react to the user's expertise level without prop drilling.
- **Decision 2:** Kept CSS dependencies strictly to Tailwind + a single `index.css` for custom properties to ensure component portability.
- **Decision 3:** Created a centralized `glossary.js` to fuel the "Simple Mode" tooltips/explanations uniformly across the app, ensuring analogies and definitions are consistent.