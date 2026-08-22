#!/usr/bin/env bash
#
# scaffold-structure.sh
# Creates the enterprise feature-first Clean Architecture folder structure
# (React + Vite, TanStack Query + Zustand, Tailwind CSS v4).
#
# Usage:
#   Inside an existing React + Vite project:
#     ./scaffold-structure.sh                          # base structure only
#     ./scaffold-structure.sh auth orders              # + one folder set per feature
#
#   Create a brand-new project AND scaffold it (no prompts, no dev server):
#     ./scaffold-structure.sh --create my-app auth orders
#
# It also installs the standard stack (TanStack Query, Zustand, Axios, Zod,
# React Router, clsx, Tailwind v4 + Vite plugin; dev: Prettier + Tailwind class
# sorting) and wires Tailwind, the `@` path alias, Prettier, the cn() helper,
# and the typecheck/format npm scripts.
# Skip the installs with:  SKIP_INSTALL=1 ./scaffold-structure.sh
#
# Safe to re-run: it only creates missing folders/files. In an existing project
# it never rewrites config files you may have edited — if something can't be
# added safely it prints the manual step instead.

set -euo pipefail

MANUAL_STEPS=""
note_manual() { MANUAL_STEPS="${MANUAL_STEPS}\n  - $1"; }

# --- create mode: scaffold a new Vite project first ---------------------------
CREATED_NEW=0
if [ "${1:-}" = "--create" ]; then
  PROJECT_NAME="${2:-}"
  if [ -z "$PROJECT_NAME" ]; then
    echo "⚠️  --create needs a project name:  ./scaffold-structure.sh --create my-app [features...]"
    exit 1
  fi
  shift 2 # remaining args are feature names

  if [ -e "$PROJECT_NAME" ]; then
    echo "⚠️  '$PROJECT_NAME' already exists here — refusing to overwrite."
    exit 1
  fi

  echo "🚀 Creating Vite project: $PROJECT_NAME (react-ts, non-interactive)"
  npm create vite@latest "$PROJECT_NAME" -- --template react-ts --no-interactive

  cd "$PROJECT_NAME"
  CREATED_NEW=1
  if [ "${SKIP_INSTALL:-0}" != "1" ]; then
    echo "📦 Installing base dependencies..."
    npm install
  fi
fi

# --- locate the project root (where package.json lives) -----------------------
ROOT="$(pwd)"
if [ ! -f "$ROOT/package.json" ]; then
  echo "⚠️  No package.json found in $ROOT"
  echo "    Run this script from the root of your React + Vite project,"
  echo "    or use:  ./scaffold-structure.sh --create <project-name> [features...]"
  exit 1
fi

SRC="$ROOT/src"

# .gitkeep keeps otherwise-empty folders tracked by git.
make_dir() {
  local dir="$1"
  mkdir -p "$dir"
  if [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
    touch "$dir/.gitkeep"
  fi
}

echo "📁 Scaffolding structure under: $SRC"

# --- app/ : composition root (wiring only) -----------------------------------
make_dir "$SRC/app/providers"
make_dir "$SRC/app/router"

# --- core/ : cross-cutting concerns ------------------------------------------
make_dir "$SRC/core/api"
make_dir "$SRC/core/error"
make_dir "$SRC/core/config"
make_dir "$SRC/core/storage"

# --- shared/ : reusable across features --------------------------------------
make_dir "$SRC/shared/ui"
make_dir "$SRC/shared/hooks"
make_dir "$SRC/shared/lib"

# --- features/ ----------------------------------------------------------------
make_dir "$SRC/features"

scaffold_feature() {
  local feature="$1"
  local base="$SRC/features/$feature"
  echo "   → feature: $feature"

  # A) domain (DECLARE)
  make_dir "$base/domain/entities"
  make_dir "$base/domain/repositories"

  # B) infrastructure (DEFINE)
  make_dir "$base/infrastructure/data-sources/remote"
  make_dir "$base/infrastructure/data-sources/local"
  make_dir "$base/infrastructure/repositories"

  # C) application (CALL)
  make_dir "$base/application/usecases"
  make_dir "$base/application/queries"
  make_dir "$base/application/store"

  # D) presentation (DISPLAY)
  make_dir "$base/presentation/components"
  make_dir "$base/presentation/screens"
}

if [ "$#" -gt 0 ]; then
  for feature in "$@"; do
    scaffold_feature "$feature"
  done
else
  echo "   (no feature names passed — base structure only)"
  echo "   Tip: ./scaffold-structure.sh <feature1> <feature2> ... to scaffold features."
fi

# --- install standard stack libraries ----------------------------------------
STACK_DEPS="@tanstack/react-query zustand axios zod react-router-dom clsx tailwindcss @tailwindcss/vite"
DEV_DEPS="prettier prettier-plugin-tailwindcss"

HAVE_NPM=0
command -v npm >/dev/null 2>&1 && HAVE_NPM=1

if [ "${SKIP_INSTALL:-0}" = "1" ]; then
  echo "⏭️  SKIP_INSTALL=1 — skipping library install."
elif [ "$HAVE_NPM" = "1" ]; then
  echo "📦 Installing stack libraries: $STACK_DEPS"
  npm install $STACK_DEPS
  echo "📦 Installing dev tooling: $DEV_DEPS"
  npm install -D $DEV_DEPS
else
  echo "⚠️  npm not found — skipping install. Run manually:"
  echo "    npm install $STACK_DEPS"
  echo "    npm install -D $DEV_DEPS"
fi

# --- wire Tailwind v4 + `@` path alias (vite.config.ts) -----------------------
write_vite_config() {
  cat > "$ROOT/vite.config.ts" <<'EOF'
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
EOF
  echo "🎨 vite.config.ts → React + Tailwind v4 plugins, '@' alias"
}

if [ "$CREATED_NEW" = "1" ] || [ ! -f "$ROOT/vite.config.ts" ]; then
  write_vite_config
elif ! grep -q '@tailwindcss/vite' "$ROOT/vite.config.ts"; then
  note_manual "vite.config.ts: import tailwindcss from '@tailwindcss/vite', add tailwindcss() to plugins, and add the '@' -> './src' resolve.alias"
fi

# --- global stylesheet: Tailwind v4 import + design tokens --------------------
write_index_css() {
  cat > "$SRC/index.css" <<'EOF'
@import 'tailwindcss';

/* Docs contain Tailwind class examples — keep them out of v4's automatic
 * source scanning so they don't inflate the CSS bundle. */
@source not "../docs";

/*
 * Design tokens — the single source of truth for styling (Tailwind CSS v4).
 * Referenced in markup as utilities: --color-brand -> bg-brand / text-brand.
 * No raw hex or arbitrary [13px] values in components — add a token instead.
 * Placeholder palette: replace with the real brand tokens from Figma.
 */
@theme {
  --color-brand: #0d9488;
  --color-brand-dark: #0f766e;
  --color-brand-light: #ccfbf1;
  --color-danger: #dc2626;
  --color-success: #16a34a;

  --font-sans: 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif;
}
EOF
  echo "🎨 src/index.css → @import 'tailwindcss' + @theme tokens"
}

if [ "$CREATED_NEW" = "1" ] || [ ! -f "$SRC/index.css" ]; then
  write_index_css
elif ! grep -q "tailwindcss" "$SRC/index.css"; then
  note_manual "src/index.css: replace its content with \"@import 'tailwindcss';\" plus your @theme design tokens (keep only global tokens here)"
fi

# --- `@` path alias in tsconfig.app.json --------------------------------------
if [ -f "$ROOT/tsconfig.app.json" ] && ! grep -q '"paths"' "$ROOT/tsconfig.app.json"; then
  if grep -q '"jsx": "react-jsx",' "$ROOT/tsconfig.app.json"; then
    awk '{print} /"jsx": "react-jsx",/ {
      print "";
      print "    /* Path alias (mirrored in vite.config.ts) */";
      print "    \"paths\": {";
      print "      \"@/*\": [\"./src/*\"]";
      print "    },"
    }' "$ROOT/tsconfig.app.json" > "$ROOT/tsconfig.app.json.tmp" &&
      mv "$ROOT/tsconfig.app.json.tmp" "$ROOT/tsconfig.app.json"
    echo "🔗 tsconfig.app.json → '@/*' path alias added"
  else
    note_manual "tsconfig.app.json: add compilerOptions.paths = { \"@/*\": [\"./src/*\"] }"
  fi
fi

# --- Prettier config (with Tailwind class sorting) ----------------------------
if [ ! -f "$ROOT/.prettierrc" ] && [ ! -f "$ROOT/.prettierrc.json" ] && [ ! -f "$ROOT/prettier.config.js" ]; then
  cat > "$ROOT/.prettierrc" <<'EOF'
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF
  printf 'dist\nnode_modules\npackage-lock.json\n' > "$ROOT/.prettierignore"
  echo "🧹 .prettierrc + .prettierignore created"
fi

# --- cn() classname helper -----------------------------------------------------
if [ ! -f "$SRC/shared/lib/cn.ts" ]; then
  cat > "$SRC/shared/lib/cn.ts" <<'EOF'
import { clsx, type ClassValue } from 'clsx';

/**
 * Merge conditional Tailwind class names. The only sanctioned way to build
 * dynamic className strings — never concatenate by hand.
 * See docs/REACT_VITEJS_CODING_STANDARDS.md §8.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
EOF
  rm -f "$SRC/shared/lib/.gitkeep"
  echo "🧩 src/shared/lib/cn.ts created"
fi

# --- npm scripts: typecheck / format ------------------------------------------
if [ "$HAVE_NPM" = "1" ]; then
  npm pkg set \
    scripts.typecheck="tsc -b" \
    scripts.format="prettier --write ." \
    scripts.format:check="prettier --check ." >/dev/null
  echo "📜 npm scripts → typecheck, format, format:check"
else
  note_manual 'package.json scripts: "typecheck": "tsc -b", "format": "prettier --write .", "format:check": "prettier --check ."'
fi

# --- create mode only: replace the Vite demo app with a minimal clean App -----
if [ "$CREATED_NEW" = "1" ]; then
  cat > "$SRC/App.tsx" <<'EOF'
function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-brand text-3xl font-semibold">App scaffold ready</h1>
        <p className="mt-2 text-gray-600">
          Read <code>docs/CLAUDE.md</code> before building features.
        </p>
      </div>
    </main>
  );
}

export default App;
EOF
  rm -f "$SRC/App.css" "$SRC/assets/react.svg" "$SRC/assets/vite.svg" "$SRC/assets/hero.png"
  rmdir "$SRC/assets" 2>/dev/null || true
  echo "🧽 Vite demo app replaced with a minimal Tailwind-styled App.tsx"
fi

# --- summary -------------------------------------------------------------------
echo "✅ Done."
if [ -n "$MANUAL_STEPS" ]; then
  printf '⚠️  Manual steps needed (existing files were left untouched):%b\n' "$MANUAL_STEPS"
fi
echo "   Verify the QA gate:  npm run lint && npm run typecheck && npm run build"
