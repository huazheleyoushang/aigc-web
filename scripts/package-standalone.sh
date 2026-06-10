#!/usr/bin/env sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/dist/aigc-web"
ARCHIVE="$ROOT/dist/aigc-web-standalone.tar.gz"

cd "$ROOT"

echo ">> cleaning previous dist..."
rm -rf "$ROOT/dist"

echo ">> building..."
pnpm build

echo ">> packaging standalone output..."
mkdir -p "$OUT_DIR"

cp -R .next/standalone/. "$OUT_DIR/"
cp -R .next/static "$OUT_DIR/.next/static"
cp -R public "$OUT_DIR/public"

for file in start.sh ecosystem.config.cjs .env.production.example nginx.conf.example; do
  src="$ROOT/deploy/$file"
  if [ ! -f "$src" ]; then
    echo "error: missing $src" >&2
    exit 1
  fi
  cp "$src" "$OUT_DIR/$file"
done
chmod +x "$OUT_DIR/start.sh"

tar -czf "$ARCHIVE" -C "$ROOT/dist" aigc-web

echo ">> done"
echo "   directory: $OUT_DIR"
echo "   archive:   $ARCHIVE"
