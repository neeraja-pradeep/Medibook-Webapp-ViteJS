# React + Vite — Enterprise Architecture Standard

A feature-first Clean Architecture standard for React + Vite, mirroring our Flutter
Clean Architecture, with the recommended state-management stack. The rules that
protect this architecture live in `REACT_VITEJS_CODING_STANDARDS.md`; the prompts
that generate code against it live in `REACT_VITEJS_CLAUDE_FEATURE_PROMPTS.md`.

---

## 1. State management — the recommendation

Our Flutter stack uses **Riverpod**, which does two jobs at once: it manages _async
server data_ (loading/success/error) **and** _local UI state_. In React, the enterprise
pattern is to **split those two jobs across two specialized tools**. This is the single
most important mental shift.

| Concern                                                            | Flutter (Riverpod does both)              | React enterprise equivalent      |
| ------------------------------------------------------------------ | ----------------------------------------- | -------------------------------- |
| **Server state** (API data, caching, refetch, loading/error)       | Riverpod `FutureProvider`/`StateNotifier` | **TanStack Query** (React Query) |
| **Client state** (UI toggles, wizard steps, filters, auth session) | Riverpod `StateNotifierProvider`          | **Zustand**                      |

**Chosen stack: TanStack Query + Zustand**, with **Tailwind CSS v4** as the styling
layer (see §2.1). State management and styling are orthogonal: Query/Zustand decide
_what_ the UI shows, Tailwind decides _how_ it looks — neither leaks into the other.

**Why this combo over Redux:**

- **TanStack Query** gives caching, background refetch, retries, stale-time, request
  dedup, and `isLoading / isError / data` states _for free_ — exactly the "model
  loading/success/error/empty explicitly" rule from our Flutter `states/`. Hand-writing
  that in Redux is a lot of boilerplate.
- **Zustand** is tiny, has almost no boilerplate, and feels closest to a Riverpod
  `StateNotifier` — a small store with state + actions, no provider-wrapping ceremony.
- Together they cover ~95% of an enterprise app cleanly.

**Alternatives (for context):**

- **Redux Toolkit + RTK Query** — choose only if the team wants a _single unified
  store_, heavy DevTools/time-travel debugging, or already has deep Redux expertise.
  More ceremony for the same outcome.
- **TanStack Query + Redux Toolkit** — hybrid; use when client state is genuinely large
  and interconnected.

---

## 2. Folder structure (feature-first, same 4 layers as Flutter)

```
vite.config.ts                   # React + Tailwind v4 plugins, `@` path alias
src/
├── index.css                    # the ONLY global stylesheet: @import 'tailwindcss' + @theme design tokens
├── app/                         # App composition root (wiring only)
│   ├── providers/               # <QueryClientProvider>, router provider, theme
│   ├── router/                  # route definitions (React Router / TanStack Router)
│   └── App.tsx
│
├── core/                        # Cross-cutting concerns (our Flutter core/)
│   ├── api/                     # Axios instance, interceptors, base config
│   ├── error/                   # Failure types, Result<T>, error mapping
│   ├── config/                  # env, constants (NO magic strings)
│   └── storage/                 # localStorage / IndexedDB wrappers + key constants
│
├── shared/                      # Reusable across features
│   ├── ui/                      # design-system components (Button, Modal, Input) — Tailwind-styled
│   ├── hooks/                   # generic hooks (useDebounce, useMediaQuery)
│   └── lib/                     # pure helpers/utils (incl. the cn() classname helper)
│
└── features/
    └── <feature>/               # e.g. auth, orders, profile
        │
        ├── domain/              # ── A) DECLARE ──
        │   ├── entities/        # plain TS types/interfaces the UI needs
        │   └── repositories/    # ABSTRACT repo = a TS interface, no bodies
        │
        ├── infrastructure/      # ── B) DEFINE ──
        │   ├── data-sources/
        │   │   ├── remote/      # <feature>.api.ts (Axios), *.request.ts / *.response.ts DTOs
        │   │   └── local/       # <feature>.local.ts (cache via storage), ONLY if needed
        │   └── repositories/    # <Feature>RepositoryImpl — joins remote+local, maps errors
        │
        ├── application/         # ── C) CALL ──
        │   ├── usecases/        # one file per action: fetchOrders.ts -> fetchOrders()
        │   ├── queries/         # TanStack Query hooks: useOrdersQuery, useCreateOrderMutation
        │   └── store/           # Zustand slice: <feature>.store.ts (UI/client state)
        │
        └── presentation/        # ── D) DISPLAY ──
            ├── components/       # feature-specific UI pieces (from Figma) — Tailwind classes
            └── screens/          # the page/screen UI (or pages/)
```

### 2.1 Styling layer — Tailwind CSS v4

Styling lives **entirely in the presentation layer** as Tailwind utility classes. Like
the rest of the architecture, it points inward and stays out of the way of the inner
layers — `domain`, `infrastructure`, and `application` never contain a class name.

- **Tokens are the contract.** Brand colors, spacing, typography, and breakpoints are
  declared once in the `@theme` block of `src/index.css` — the styling equivalent of
  `core/config`. Tailwind v4 is CSS-first: there is **no** `tailwind.config.ts`, no
  `postcss.config.js`, and no `content` globs; the `@tailwindcss/vite` plugin in
  `vite.config.ts` does the wiring. Components reference tokens by name (`bg-brand`,
  `text-danger`); raw hex codes and arbitrary `[13px]` values are treated like magic
  strings and rejected in review.
- **Design system in `shared/ui`.** Reusable visuals (Button, Modal, Input, Card) are
  Tailwind-styled components in `shared/ui`. Feature screens compose these — they never
  re-style a primitive from scratch. Repeated utility strings become a shared component,
  not a copy-pasted class list.
- **Feature components hold their own classes.** Feature-specific layout/styling lives
  on the `presentation/components` and `presentation/screens` that own it. No global
  feature CSS files; `src/index.css` carries only the Tailwind import and the tokens.
- **One global stylesheet.** `src/index.css` (imported once in the app entry) declares
  `@import 'tailwindcss';` plus `@theme`. There is no parallel CSS Modules /
  styled-components system — Tailwind is the single styling mechanism.

The detailed styling rules (token usage, `cn()` for conditional classes, mobile-first
responsiveness, the Prettier class-sorting plugin) live in **§8 of
`REACT_VITEJS_CODING_STANDARDS.md`**.

---

## 3. Layer-by-layer mapping (Flutter → React)

| Flutter layer                               | React equivalent                               | What lives here                                                                                                                                  |
| ------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **domain/entities**                         | `domain/entities/*.ts`                         | Plain immutable types — `interface Order { readonly id: string; ... }`. No logic, no React.                                                      |
| **domain/repositories** (abstract)          | `domain/repositories/*.ts`                     | A **TS interface**: `interface OrderRepository { getOrders(): Promise<Result<Order[]>> }`. Signatures only.                                      |
| **infrastructure/data_sources/remote**      | `infrastructure/data-sources/remote/*.api.ts`  | Axios calls + `*.request.ts` / `*.response.ts` DTOs with `toEntity()` mappers (React's version of fromJson/toJson).                              |
| **infrastructure/data_sources/local**       | `infrastructure/data-sources/local/*.local.ts` | localStorage/IndexedDB caching — **only if the feature needs it**. Keys via constants, never magic strings.                                      |
| **infrastructure/repositories (Impl)**      | `infrastructure/repositories/*.impl.ts`        | The class/function that **implements** the domain interface, joins remote+local, maps errors → `Failure`.                                        |
| **application/usecases**                    | `application/usecases/*.ts`                    | One action per file: `fetchOrders.ts`. Thin — just calls the repository. File name == function name.                                             |
| **application/states**                      | `application/queries/` + `application/store/`  | **This is where Riverpod splits in two:** TanStack Query hooks own _server_ state (loading/success/error built-in); Zustand owns _client_ state. |
| **application/providers** (Riverpod wiring) | `app/providers/` + the query/store hooks       | TanStack's `QueryClientProvider` is global wiring; per-feature `useXQuery` hooks are the "controllers".                                          |
| **presentation/components**                 | `presentation/components/`                     | Same — Figma components, styled with Tailwind utility classes; reusable primitives pulled from `shared/ui`.                                      |
| **presentation/screens**                    | `presentation/screens/`                        | Same — the screen UI, composed from Tailwind-styled components.                                                                                  |

---

## 4. The whole thing in simple English

Think of every feature as a small assembly line with **4 stations**, exactly like our
Flutter app:

1. **domain — "DECLARE" (the promises).**
   This station only writes _promises on paper_. "An Order looks like this" (entity) and
   "someone, somewhere, will be able to fetch orders" (repository interface). No real
   code runs here. It's the contract. Nothing in this folder knows about Axios, React, or
   a database — that's intentional, so business rules never depend on tools.

2. **infrastructure — "DEFINE" (the real work).**
   This station _keeps the promises_. The `remote` part actually talks to the server with
   Axios and converts ugly JSON into clean entities. The `local` part saves a copy on the
   device for caching (only if you need offline/speed). The `repositoryImpl` is the worker
   who fulfils the contract from station 1 — it decides "do I hit the network or return
   the cached copy?" and turns any crash into a tidy `Failure` object instead of letting
   it explode.

3. **application — "CALL" (the brain).**
   This is where Riverpod's single job becomes **two helpers in React**:
   - **TanStack Query** = your "data fetcher with a memory." You ask `useOrdersQuery()`
     and it hands back `{ data, isLoading, isError }` and remembers the result so it
     doesn't re-fetch needlessly. This _is_ the Flutter "loading / success / error /
     empty" state — but you get it for free instead of writing a state class.
   - **Zustand** = your "small notepad for UI stuff" — is the sidebar open? which filter
     is selected? which step of the form are we on? Things the server doesn't care about.
   - **usecases** are tiny single-purpose functions ("fetchOrders") so the UI never calls
     the repository directly — keeps everything testable and traceable.

4. **presentation — "DISPLAY" (the face).**
   Pure UI. `screens` are full pages; `components` are the Figma building blocks, styled
   with Tailwind utility classes built from the `@theme` tokens. They _only_ call the
   hooks from station 3 — they never know an API or cache exists. So a screen reads
   almost like English: "give me the orders query, show a spinner while loading, show
   the list when ready."

**The golden rule (same as Flutter):** dependencies point **inward**. Presentation →
Application → Domain. Infrastructure also points at Domain (it implements the interface).
Domain depends on _nobody_. That's what keeps an enterprise app swappable — you can
replace Axios, swap REST for GraphQL, or change the cache, and the inner layers never
notice.
