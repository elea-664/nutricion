# ATHL8

**Sports nutrition selected for performance.** Website + interactive demo for ATHL8 (Mesa, AZ): an online store and an in-store point of sale (POS) that share **one single inventory**.

The core idea: selling a product in one channel lowers its stock in the other instantly.

## Views

- **`/`** — ATHL8 landing page: categories (Energy, Hydrate, Protein, Performance), prepared Meals line (online only), athlete stories, our story, partners, store location and contact.
- **`/shop`** — catalog, cart and online checkout (simulated payment).
- **`/plans`** — weekly meal plan signup (Factor-style): goals + meals per week → delivery details and day → pick exactly N meals plus optional ATHL8 add-ons → pay. The first box is a real online sale from the shared inventory.
- **`/account`** — manage meal plans: upcoming deliveries, skip/unskip weeks, pause/resume, cancel.
- **`/pos`** — terminal-style point of sale: scan by keyboard/click, ticket, cash (with change) or card.
- **`/admin`** — dashboard, live inventory, unified sales history (both channels), inventory movements and meal plans.

A **live stock** ticker under the header reflects changes from either channel instantly, and a **reset demo** button restores the seed state.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Zod + React Hook Form. All state (`products`, `orders`, `sales`, `movements`) lives in memory via React Context — no backend or database. Prices in USD.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
