# PFOS – Personal Financial Operating System (Frontend)

Premium, mobile‑first Next.js App Router UI scaffolding with TailwindCSS, lucide-react, Radix primitives, and Zustand. All data is dummy; no external integrations.

## Run
- Install deps: `npm install`
- Dev server: `npm run dev` then open http://localhost:3000/
- Lint: `npm run lint`

## Tech Stack
- Next.js (App Router) + TypeScript
- TailwindCSS v4 (light/dark theme)
- Zustand for state
- Radix UI primitives + custom design system components
- lucide-react icons

## Structure
- src/app: routes and layouts
- src/components/app-shell: AppShell + TopBar + Sidebar + BottomTabs
- src/components/ui: reusable UI kit (Card, Button, Input, Switch, Tabs, Sheet, Toast, Skeleton, StatCard, EmptyState, ThemeToggle)
- src/domain: typed models
- src/state: store + demo dataset
- src/lib: feature flags

## Add Screens
1. Create a folder under `src/app/(pfos)/your-route/page.tsx`.
2. Use the `AppShell` layout automatically from `src/app/(pfos)/layout.tsx`.
3. Compose UI from `src/components/ui` and read state via `useAppStore`.
4. To include in navigation, ensure the related feature flag is true in `src/lib/feature-flags.ts` or toggle it in Settings.

## Demo Data & Modes
- Toggle demo data in Settings; seed/clear the in-memory dataset.
- Overwhelm Mode calms UI: fewer numbers, simpler dashboards.
- Profile mode options: Growth, Balanced, Peace, Senior.

## Accessibility & Design
- Large tap targets, keyboard-friendly components, focus/hover states.
- Premium aesthetic with gradients, soft shadows, rounded‑2xl cards, crisp typography.

## Routes & Screens
- `/onboarding` – multi-step onboarding wizard
- `/home` – daily Action Center dashboard
- `/actions/[id]` – action detail with steps and “Why this matters”
- `/net-worth` – net worth, assets and liabilities
- `/debt` – loans, EMIs, payoff plan, “If I do nothing”
- `/spending` – spending dashboard, transactions, subscriptions, allowance
- `/cards` – cards, rewards, “best card for spend”
- `/goals` – goals, freedom score, scenario simulator
- `/safety` – safety dashboard, policies, contacts, document vault
- `/scam` – scam check and library
- `/reports` – monthly autopsy and leak analysis
- `/settings` – profile, modes, demo data, feature flags, notifications

## Quality Checklist
- Routes load without errors.
- Every screen has a clear primary CTA.
- Forms validate required fields and show inline errors.
- Save / update / delete actions surface toasts.
- Overwhelm Mode softens dashboards across modules.
- Feature flags control visibility of modules in navigation and command palette.
- Demo data toggle seeds/clears in-memory dataset.
- “Why this?” drawers exist on key recommendations and actions.

## How To Use Modes & Toggles
- **Profile mode** – pick Growth, Balanced, Peace, or Senior in Settings to influence tone and density.
- **Overwhelm Mode** – toggle in Settings to hide heavier charts and keep only calm, essential cards.
- **Demo data** – enable in Settings to populate a safe demo dataset, or clear it to start fresh.
- **Feature flags** – manage which modules appear in the sidebar, bottom tabs, and command palette from Settings.

## Screenshots To Capture
- Home / Action Center with top actions, alerts, and widgets.
- Net worth overview with assets/liabilities and liquidity meter.
- Debt dashboard with loans list and payoff strategy.
- Spending dashboard with transactions and subscriptions.
- Cards dashboard with rewards and “best card for spend”.
- Goals and freedom score view with scenario simulator.
- Safety dashboard with policies, “If I die tomorrow”, and vault.
- Reports monthly autopsy and leak analysis.
- Settings with modes, Overwhelm Mode, demo data, and feature flags.
