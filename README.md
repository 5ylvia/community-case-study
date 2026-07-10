# community-case-study

> A neighborhood community platform where Korean immigrants share meals, shop together, and build trust through Jeong (情).

Dajeong connects Korean immigrants living abroad — in cities across New Zealand, Australia, and beyond — through the cultural spirit of **Jeong (情)**: the deep, unspoken bond of care and generosity that defines Korean communal life. This is not a marketplace. It is a place for Jeong.

## The Problem

- Korean immigrants abroad face daily isolation in ways that are easy to overlook — eating alone at restaurants designed for groups, walking past bulk groceries they cannot buy for one, cooking for themselves night after night.
- Existing community apps are transactional. They connect people to exchange goods or services, but nothing captures the warmth, trust, and spontaneity of Korean Jeong culture.

## The Solution

Dajeong is a neighborhood community platform where Korean immigrants share meals, split grocery runs, discover restaurants together, and slowly build the kind of trust that turns strangers into neighbors.

### Core Features

- **Home Meal** — Cook together, share sides, or give away surplus food to neighbors nearby.
- **Together** — Eat together at local restaurants or organize group buys for bulk groceries that are impractical to purchase alone.
- **Local Eats** — Community-driven restaurant recommendations with likes — honest picks from people who share your palate.
- **Ember (불씨)** — A trust and reputation system built on a fire metaphor. Positive interactions "add firewood" to your Ember 🔥; negative ones dim the flame. A 5-cell gauge shifts through red, orange, and gray states. Trust grows slowly and breaks quickly — by design.

### Badges

- **Pioneer** — First resident to join a new city pool.
- **Sharer** — Active contributor of Home Meal posts.
- **Foodie** — Prolific reviewer on Local Eats.

## Key Design Decisions

_This section reflects the product thinking behind the project — the "why," not just the "what."_

1. **Ember over star ratings** — A simple 1-5 star system feels cold and transactional. Ember uses the metaphor of tending a fire: you add firewood through genuine interactions, and neglect or bad behavior lets it die out. The visual gauge (5 cells, warm-to-gray gradient) reinforces the cultural warmth theme at a glance.

2. **City pool isolation** — Each city operates as its own independent community pool. This prevents content dilution across regions and ensures trust is local — you are building relationships with people you can actually meet.

3. **Cold start strategy** — An empty city does not show a blank page. Instead, it displays example cards with a dashed border as inspiration for what the community could look like. The first person to join a city earns the Pioneer badge.

4. **Home Meal address privacy** — A host's address is only revealed to confirmed participants, and only 24 hours before the event. In production, this is enforced server-side — not just hidden in the UI.

5. **No monetary transactions** — This is an intentional design constraint. Jeong is about generosity and reciprocity, not commerce. Removing money from the equation keeps interactions genuine.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 (custom design tokens) |
| State & Data | TanStack Query (React Query) |
| Icons | Phosphor Icons |
| Backend (original) | Supabase — Auth, Postgres, Row-Level Security |
| Deployment | GitHub Pages (static demo with mock data) |

The production architecture uses Supabase for authentication, database, and row-level security policies. The portfolio demo replaces the backend with mock data to run as a fully static site.

## My Role

Solo developer — responsible for product planning, UX/UI design, design system creation, frontend development, backend architecture, and deployment infrastructure.

## Documentation

- [Design System](design.md) — Complete design system with color tokens, typography scale, and component patterns
- [Product Spec](spec.md) — Full product specification covering user flows, data models, and policy rules

## Live Demo

> Portfolio demo with mock data — _link coming soon_
