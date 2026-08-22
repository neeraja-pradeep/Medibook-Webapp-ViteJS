# Scaffolding a new React + Vite project

`scaffold-structure.sh` creates the standard feature-first Clean Architecture
structure and installs the full stack (TanStack Query, Zustand, Axios, Zod, React
Router, Tailwind CSS v4, clsx, Prettier). It is safe to re-run: it only creates what
is missing and never overwrites files you have edited.

## Create a brand-new project

From the folder where the new project should live (with `scaffold-structure.sh`
copied there, or referenced by its path in this repo):

```bash
./scaffold-structure.sh --create <app-name> <feature> [<feature>...]

# example: new app with auth + profile features
./scaffold-structure.sh --create medibook-webapp auth profile
```

This bootstraps a fresh Vite `react-ts` project, applies the folder structure,
installs the stack, and wires Tailwind v4, the `@` path alias, Prettier (with
Tailwind class sorting), the `cn()` helper, and the `typecheck`/`format` scripts.

## Scaffold inside an existing project

From the project root (where `package.json` is):

```bash
./scaffold-structure.sh                # base structure only
./scaffold-structure.sh auth orders    # + one 4-layer folder set per feature
```

In an existing project the script never rewrites your config files — if something
(Tailwind import, alias, scripts) can't be added safely, it prints the exact manual
step instead.

## Options

| Variable         | Effect                                                |
| ---------------- | ----------------------------------------------------- |
| `SKIP_INSTALL=1` | Skip all `npm install` steps (folders + config only). |

## After scaffolding

1. Read `CLAUDE.md` (this folder) for the specification index.
2. Build features per `REACT_VITEJS_ARCHITECTURE.md` and
   `REACT_VITEJS_CODING_STANDARDS.md`, using the prompts in
   `REACT_VITEJS_CLAUDE_FEATURE_PROMPTS.md`.
3. Verify the gate: `npm run lint && npm run typecheck && npm run build`.
