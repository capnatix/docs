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
  # membership yet -- fall back to sudo for the rest of this run, the same
  # way as_root() above does, with the same clear error if sudo isn't even
  # there (code review: this used to fall back to "sudo docker"
  # unconditionally, which on a host with no sudo binary at all just fails
  # every docker command with a bare "sudo: command not found" instead of
  # a diagnosis pointing at the actual problem).
  if [ "$(id -u)" != "0" ]; then
    if command -v sudo >/dev/null 2>&1; then
      DOCKER="sudo docker"
    else
      echo "install.sh: docker was installed but isn't usable yet by $(id -un), and sudo isn't available to fall back on. Log out and back in (or run 'newgrp docker'), then re-run this script." >&2
      exit 1
    fi
  fi
  # Root and docker info still failing: leave DOCKER as plain "docker" so
  # the next real docker command surfaces its own actual error (e.g. the
  # daemon isn't running) instead of this script guessing wrong.
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

# Neither file is silently overwritten on a re-run -- once either holds a
# real edit (app.env's generated secrets; docker-compose.yaml's TLS block,
# per the doc's own "A note on TLS") a fresh copy from a newer image would
# discard it with no warning (code review, INVOS-874). If you want a newer
# release's copy of either file, remove it yourself first, then re-apply
# your own edits -- that trade (re-running never auto-upgrades either
# file) is safer than the alternative (re-running sometimes destroys an
# edit, silently, depending on which file and when).
if [ -f "$DIR/docker-compose.yaml" ]; then
  log "$DIR/docker-compose.yaml already exists -- leaving it untouched"
else
  $DOCKER cp "$CID:/dist/docker-compose.yaml" "$DIR/docker-compose.yaml"
fi

if [ -f "$DIR/app.env" ]; then
  # Still worth merging in any KEY the template has grown since this
  # app.env was first created (env.prod.example has repeatedly gained new
  # *required* vars -- FILE_URL_SIGNING_SECRET, INTERNAL_SERVICE_TOKEN,
  # EXTERNAL_API_PG_USER/PASS all arrived after the vars around them
  # existed). Appended, never merged in place: an existing KEY's value,
  # generated or hand-edited, is never touched.
  log "$DIR/app.env already exists -- adding any new variables a newer template may have introduced, leaving existing ones untouched"
  TEMPLATE="$DIR/.app.env.template.$$"
  $DOCKER cp "$CID:/dist/env.prod.example" "$TEMPLATE"
  ADDED=0
  # `|| [ -n "$line" ]` -- without it, a final line with no trailing
  # newline (read returns non-zero on that partial read, even though it
  # still populated $line) would be silently skipped entirely.
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      [A-Z_]*=*)
        key="${line%%=*}"
        if ! grep -q "^${key}=" "$DIR/app.env"; then
          printf '\n%s\n' "$line" >>"$DIR/app.env"
          ADDED=$((ADDED + 1))
        fi
        ;;
    esac
  done <"$TEMPLATE"
  rm -f "$TEMPLATE"
  [ "$ADDED" -gt 0 ] && log "Added $ADDED new variable(s) -- see the checklist below"
else
  $DOCKER cp "$CID:/dist/env.prod.example" "$DIR/app.env"
fi
$DOCKER rm "$CID" >/dev/null
$DOCKER rmi "capnatix/capnatix-installer:$TAG" >/dev/null

# Restricted before any secret is written into it, not after -- app.env
# briefly held generated secrets at whatever more permissive mode it was
# extracted with otherwise, a real (if narrow) local-multi-user exposure
# window (code review, INVOS-874).
chmod 600 "$DIR/app.env"

# --- Fill in every generatable secret -----------------------------------
log "Generating secrets"

rand() { openssl rand -base64 "$1" | tr -d '=+/\n'; }

# A handful of CHANGE-ME values in the template are real EXTERNAL
# credentials (a third-party API key, object storage keys, the external
# API's read-only DB role password) -- this host has no way to invent a
# valid one, and silently generating garbage for them is worse than
# leaving the placeholder: it would look handled while quietly being
# broken (code review, INVOS-874 -- API_KEY specifically: .env.prod.
# example documents it as "the IAN API key", not an internal secret this
# script can synthesize). Left alone here, they naturally surface in the
# leftover checklist below instead.
is_external_credential() {
  case "$1" in
    API_KEY | STORAGE_ACCESS_KEY | STORAGE_SECRET_KEY | EXTERNAL_API_PG_PASS) return 0 ;;
    *) return 1 ;;
  esac
}

# Byte length for the two keys the template itself documents a specific
# `openssl rand -base64 N` for; every other generatable secret defaults
# to 32 (matches SETTINGS_ENC_KEY/LITELLM_MASTER_KEY/LITELLM_SALT_KEY's
# own documented command; a longer PG-style password is still valid, just
# extra entropy, so one default is fine for those too).
bytes_for() {
  case "$1" in
    FILE_URL_SIGNING_SECRET | INTERNAL_SERVICE_TOKEN) echo 48 ;;
    *) echo 32 ;;
  esac
}

# Driven by app.env's own remaining CHANGE-ME lines rather than a
# hand-written list of key names, on purpose: a hand-written list is
# exactly the pattern that has already silently drifted once elsewhere in
# this codebase (infrastructure/aws/cloudformation/03_app-server.yaml's
# UserData generates only 4 of these same 9 keys -- see INVOS-877, filed
# from this same review). A new secret added to a future template
# revision is generated automatically here with no script change needed;
# only a genuinely new EXTERNAL credential needs a line added above.
GENERATED=0
# `|| [ -n "$line" ]` -- same reason as the merge loop above: don't
# silently skip a final CHANGE-ME line that happens to lack a trailing
# newline. Today's template ends with one, so this doesn't currently
# change behavior -- it's a guarantee against a future template edit
# quietly reintroducing the exact "looks generated but wasn't" failure
# mode this whole redesign exists to close (API_KEY, INVOS-877).
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    [A-Z_]*=CHANGE-ME*)
      key="${line%%=*}"
      if is_external_credential "$key"; then
        continue
      fi
      value="$(rand "$(bytes_for "$key")")"
      # '#' is a safe sed delimiter here: it can't appear in $value, which
      # is base64 with '=+/' already stripped.
      sed -i.bak "s#^${key}=CHANGE-ME.*#${key}=${value}#" "$DIR/app.env"
      GENERATED=$((GENERATED + 1))
      ;;
  esac
done <"$DIR/app.env"
rm -f "$DIR/app.env.bak"
log "Generated $GENERATED secret(s)"

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
