# propel-code-containers

Docker images for PropelCode development containers, published to GHCR.

## Images

- `ghcr.io/propel-hq/propel-code-containers/multilang` — Ubuntu 24.04 with Node.js, Python, Ruby (4.0.2 + 3.4.9 via RVM), Go, Elixir, Homebrew, zsh + starship, Claude Code, Codex, OpenCode
- `ghcr.io/propel-hq/propel-code-containers/javascript` — Ubuntu 24.04 with Node.js, yarn, pnpm, bun, Homebrew, zsh + starship, Claude Code, Codex, OpenCode

## Architecture

The container-server agent (`server.js`) is **not** stored in this repo. It lives in [`propel-code-mobile/docker/container-server/`](https://github.com/propel-hq/propel-code-mobile/tree/main/docker/container-server) as the single source of truth. The CI/CD workflow fetches it at build time before running `docker build`.

## Build locally

```bash
# Fetch container-server from propel-code-mobile
mkdir -p container-server
curl -fsSL https://raw.githubusercontent.com/propel-hq/propel-code-mobile/main/docker/container-server/server.js -o container-server/server.js
curl -fsSL https://raw.githubusercontent.com/propel-hq/propel-code-mobile/main/docker/container-server/package.json -o container-server/package.json

# Build images
docker build -f Dockerfile.multilang -t propelcode-multilang .
docker build -f Dockerfile.javascript -t propelcode-javascript .
```

## CI/CD

Images are automatically built and pushed to GHCR on push to `main` via GitHub Actions. You can also trigger a manual build via `workflow_dispatch` (useful when `server.js` changes in `propel-code-mobile`).
