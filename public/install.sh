#!/bin/sh
# Capnatix self-hosted installer bootstrap.
#
#   curl -fsSL https://docs.capnatix.com/install.sh | sh -s -- [--dir=./capnatix] [--tag=stable]
#
# End result: a folder (./capnatix by default) containing exactly two
# files -- docker-compose.yaml and app.env -- with every secret app.env's
# template marks CHANGE-ME already filled in with a fresh random value.
# See https://docs.capnatix.com/getting-started/installation/ for the full
# picture and what to do with those two files next.
#
# What this script does NOT do, on purpose: touch anything that needs a
# real operator decision (your domain, object storage credentials) or
# start the stack. Both are on you, after this finishes -- see the printed
# checklist at the end.
#
# Safe to run more than once: re-running never overwrites a secret it (or
# you) already generated -- see set_secret below.

set -eu

DIR="./capnatix"
TAG="stable"

for arg in "$@"; do
  case "$arg" in
    --dir=*) DIR="${arg#--dir=}" ;;
    --tag=*) TAG="${arg#--tag=}" ;;
    -h | --help)
      echo "Usage: install.sh [--dir=./capnatix] [--tag=stable]"
      exit 0
      ;;
    *)
      echo "install.sh: unrecognized argument: $arg" >&2
      exit 1
      ;;
  esac
done

log() { printf '==> %s\n' "$1"; }

as_root() {
  if [ "$(id -u)" = "0" ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    echo "install.sh: need root (or sudo) to run: $*" >&2
    exit 1
  fi
}

# --- Docker ------------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  log "Docker not found -- installing via get.docker.com"
  curl -fsSL https://get.docker.com | as_root sh -
  if [ "$(id -u)" != "0" ]; then
    as_root usermod -aG docker "$(id -un)" || true
    echo "install.sh: added $(id -un) to the docker group -- log out and back in (or run 'newgrp docker') before running docker without sudo." >&2
  fi
else
  log "Docker already installed ($(docker --version))"
fi

DOCKER="docker"
if ! docker info >/dev/null 2>&1; then
  # Freshly installed and this shell hasn't picked up the new docker group
  # membership yet -- fall back to sudo for the rest of this run.
  DOCKER="sudo docker"
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "install.sh: openssl is required to generate secrets and wasn't found on this host." >&2
  exit 1
fi

# --- Extract the compose file + env template ----------------------------
# --platform linux/amd64: every real Capnatix image is built amd64-only
# and pulled under emulation on an arm64 host (docker-compose.yaml already
# pins this per-service, for the same reason) -- capnatix-installer is no
# exception, and unlike those it carries no files that ever execute (see
# Dockerfile.installer: FROM scratch, just COPY), so emulation cost is
# irrelevant here, only the manifest needs to resolve.
log "Pulling capnatix/capnatix-installer:$TAG"
$DOCKER pull --platform linux/amd64 "capnatix/capnatix-installer:$TAG"
CID=$($DOCKER create --platform linux/amd64 "capnatix/capnatix-installer:$TAG")
mkdir -p "$DIR"
# docker-compose.yaml always tracks the pulled tag -- fine to overwrite on
# every run. app.env is different: once it holds real secrets (and
# whatever an operator has filled in by hand), silently replacing it with
# a fresh, blank template would desync it from a Postgres volume that
# already initialized with the OLD password -- a re-run must never touch
# an app.env that already exists.
$DOCKER cp "$CID:/dist/docker-compose.yaml" "$DIR/docker-compose.yaml"
if [ -f "$DIR/app.env" ]; then
  log "$DIR/app.env already exists -- leaving it untouched"
else
  $DOCKER cp "$CID:/dist/env.prod.example" "$DIR/app.env"
fi
$DOCKER rm "$CID" >/dev/null
$DOCKER rmi "capnatix/capnatix-installer:$TAG" >/dev/null

# --- Fill in every generatable secret -----------------------------------
log "Generating secrets"

rand() { openssl rand -base64 "$1" | tr -d '=+/\n'; }

set_secret() {
  # $1 = KEY, $2 = generated value. Only touches a line still at the
  # template's own CHANGE-ME placeholder, so re-running this script (or
  # editing app.env by hand first) never clobbers a value already set.
  # '#' is safe as the sed delimiter here: it can't appear in $2, which is
  # base64 with '=+/' already stripped.
  key=$1
  value=$2
  if grep -q "^${key}=CHANGE-ME" "$DIR/app.env"; then
    sed -i.bak "s#^${key}=CHANGE-ME.*#${key}=${value}#" "$DIR/app.env"
  fi
}

set_secret PG_PASS "$(rand 24)"
set_secret JWT_SECRET "$(rand 32)"
set_secret API_KEY "$(rand 32)"
set_secret FILE_URL_SIGNING_SECRET "$(rand 48)"
set_secret INTERNAL_SERVICE_TOKEN "$(rand 48)"
set_secret SETTINGS_ENC_KEY "$(rand 32)"
set_secret LITELLM_MASTER_KEY "$(rand 32)"
set_secret LITELLM_SALT_KEY "$(rand 32)"
set_secret LITELLM_PG_PASS "$(rand 24)"
rm -f "$DIR/app.env.bak"
chmod 600 "$DIR/app.env"

# --- Host directories the compose file's bind mounts expect -------------
log "Creating data directories under /data/capnatix"
as_root mkdir -p /data/capnatix/pg-data /data/capnatix/redis-data \
  /data/capnatix/litellm-db-data /data/capnatix/drive-data

# --- Done -----------------------------------------------------------------
log "Done -- $DIR now has docker-compose.yaml and app.env, secrets filled in."
echo
echo "Before starting, edit $DIR/app.env:"
echo "  - INF_FRONTEND_URL   the URL you'll reach this instance at (e.g. https://app.your-domain.com)"
echo "  - STORAGE_*          object storage for uploaded files (S3/Azure credentials, or leave as local for a quick evaluation)"
LEFTOVER=$(grep -o '^[A-Z_]*=CHANGE-ME[^[:space:]]*' "$DIR/app.env" || true)
if [ -n "$LEFTOVER" ]; then
  echo
  echo "Still at their template default (only matter if you're using the optional feature they belong to):"
  echo "$LEFTOVER" | sed 's/^/  - /'
fi
echo
echo "Then, from $DIR:"
echo "  docker compose --env-file app.env up -d"
echo "  docker compose --env-file app.env exec inf-backend sh -c \"cd /app && npx knex migrate:latest\""
