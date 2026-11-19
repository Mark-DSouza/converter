#!/usr/bin/env bash
# Run the Playwright suite inside the official Playwright Docker image, so
# screenshots render identically locally (WSL, macOS, ...) and in CI, which
# uses the same image. Extra arguments are passed to `playwright test`,
# e.g. `--update-snapshots` or a test file filter.
set -euo pipefail

cd "$(dirname "$0")/.."

# The image tag must match the installed @playwright/test version exactly.
VERSION="$(node -p "require('./package.json').devDependencies['@playwright/test']")"
IMAGE="mcr.microsoft.com/playwright:v${VERSION}-noble"

# - The repo is mounted at /work; an anonymous volume shadows node_modules so
#   the container installs its own and never touches the host's.
# - The image ships its own Node, which may not match the project's pin, so
#   the Node major from .nvmrc is installed (latest patch, like setup-node in
#   CI) and cached per exact version in the converter-node-cache volume.
# - The container runs as root, so files it writes (screenshots, reports,
#   dist) are handed back to the host user on exit.
docker run --rm --init --ipc=host \
  -v "$PWD":/work \
  -v /work/node_modules \
  -v converter-node-cache:/opt/node \
  -w /work \
  -e CI \
  -e HOST_UID="$(id -u)" \
  -e HOST_GID="$(id -g)" \
  "$IMAGE" \
  bash -c '
    set -euo pipefail
    trap "chown -R \$HOST_UID:\$HOST_GID e2e dist test-results playwright-report 2>/dev/null || true" EXIT

    major="$(tr -d "[:space:]v" < .nvmrc)"
    case "$(uname -m)" in
      x86_64) arch=x64 ;;
      aarch64) arch=arm64 ;;
      *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
    esac
    dist="https://nodejs.org/dist/latest-v${major}.x"
    sums="$(curl -fsSL "$dist/SHASUMS256.txt")"
    file="$(grep -oE "node-v[0-9.]+-linux-${arch}\.tar\.gz" <<<"$sums" | head -n1)"
    node_dir="/opt/node/${file%.tar.gz}"
    if [ ! -x "$node_dir/bin/node" ]; then
      echo "Installing ${file%.tar.gz}..."
      tmp="$(mktemp -d)"
      curl -fsSL "$dist/$file" -o "$tmp/$file"
      (cd "$tmp" && grep " $file\$" <<<"$sums" | sha256sum -c --quiet -)
      mkdir -p "$node_dir"
      tar -xzf "$tmp/$file" -C "$node_dir" --strip-components=1
      rm -rf "$tmp"
    fi
    export PATH="$node_dir/bin:$PATH"
    echo "Using Node $(node --version), npm $(npm --version)"

    npm ci --no-audit --no-fund
    npm run build
    npx playwright test "$@"
  ' bash "$@"
