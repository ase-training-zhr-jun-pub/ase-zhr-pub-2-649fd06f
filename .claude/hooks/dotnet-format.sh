#!/usr/bin/env bash
# PostToolUse-Hook: formatiert geänderte C#-Dateien mit `dotnet format`.
# Erhält das Tool-Event als JSON über stdin (Feld .tool_input.file_path).
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

# Nur C#-Dateien verarbeiten.
[ -z "$file" ] && exit 0
case "$file" in
  *.cs) ;;
  *) exit 0 ;;
esac

export PATH="$PATH:$HOME/.dotnet"
project="${CLAUDE_PROJECT_DIR:-/home/coder/workspace}/backend"
[ -d "$project" ] || exit 0

# Nur Dateien innerhalb des Backend-Projekts formatieren.
case "$file" in
  "$project"/*) ;;
  *) exit 0 ;;
esac

# `dotnet format --include` matcht zuverlässig nur mit projekt-relativem Pfad,
# daher in den Projektordner wechseln und nur die geänderte Datei formatieren.
rel="${file#"$project"/}"
( cd "$project" && dotnet format . --include "$rel" >/dev/null 2>&1 ) || true
exit 0
