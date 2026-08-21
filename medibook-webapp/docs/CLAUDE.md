# docs — Specification Index (React + Vite)

Source-of-truth specs for building the Medibook web app. Read the relevant file(s) in full before writing code for that area; this page is only a router.

**Stack baked into these docs:** React + Vite · TypeScript (strict) · TanStack Query (server state) · Zustand (client state) · Axios · Zod · React Router · ESLint + Prettier.

## Files

| File | One-liner |
|---|---|
| `READ.me` | Quick-start note: run `scaffold-structure.sh --create <app-name> <feature...>` from the folder holding the script to generate a new React + Vite project with the standard structure. |
| `scaffold-structure.sh` | Idempotent Bash scaffolder that creates the feature-first Clean Architecture folders (`app/`, `core/`, `shared/`, plus a 4-layer folder set per feature) and installs the standard stack; `--create <name>` also bootstraps a fresh `react-ts` Vite project first, and `SKIP_INSTALL=1` skips the npm install. |
| `REACT_VITEJS_FEATURE_PROMPTS.md` | The architecture standard: why server state goes to TanStack Query and client state to Zustand (vs Redux), the full `src/` folder tree with the four layers (`domain` → declare, `infrastructure` → define, `application` → call, `presentation` → display), and a layer-by-layer Flutter → React mapping. |
| `REACT_VITEJS_CODING_STANDARDS.md` | The binding rulebook: dependencies-point-inward golden rule, file/symbol naming tables, strict-TypeScript rules (no `any`, no `!`), the TanStack Query vs Zustand split, per-layer do's and don'ts, error handling via `Failure`/`Result`, component and hook rules, import/lint gate, env & config handling, dependency policy, and a pre-PR self-review checklist. |
| `REACT_VITEJS_CLAUDE_FEATURE_PROMPTS.md` | Copy-paste Claude Code prompt pack: **Prompt A** generates the domain + infrastructure + application layers for one feature from a pasted backend API contract (presentation layer assumed already built), **Prompt A-AUTH** adds session/auth specifics on top, and **Prompt B** does a surgical bug fix from reported UI/console errors. |

## Suggested read order when building

1. `READ.me` + `scaffold-structure.sh` → create/scaffold the project
2. `REACT_VITEJS_FEATURE_PROMPTS.md` → the architecture and folder layout every feature must follow
3. `REACT_VITEJS_CODING_STANDARDS.md` → the rules all code is reviewed against
4. `REACT_VITEJS_CLAUDE_FEATURE_PROMPTS.md` → the prompts to drive per-feature generation and bug fixes

## Non-negotiables pulled from the above

- Layer direction: `presentation → application → domain`, `infrastructure → domain`. `domain` imports nothing.
- `presentation` never touches Axios/storage/data-sources — only `application` hooks.
- Server data = TanStack Query; UI/client state = Zustand. Never mix the two roles.
- TypeScript strict stays on; no `any`, no magic literals.
- QA gate before done: lint + `tsc` + tests + build, all zero-error.
