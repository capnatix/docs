#!/bin/sh
# capnatix.sh -- self-hosted operator CLI. Download and keep it, rather
# than piping straight into a shell: everything after the first command
# (start/stop/first-setup/...) needs a persistent copy to act on.
#
#   curl -fsSL https://docs.capnatix.com/capnatix.sh -o capnatix.sh
#   chmod +x capnatix.sh
#   ./capnatix.sh install
#   # edit ./capnatix/app.env -- domain, storage
#   ./capnatix.sh start
#   ./capnatix.sh first-setup --admin-email=you@example.com
#
# See https://docs.capnatix.com/getting-started/installation/ for the
# full picture. Every verb is safe to re-run.

set -eu

DIR="./capnatix"
TAG="stable"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

CMD=""
if [ "$#" -gt 0 ]; then
  case "$1" in
    --*) ;;
    *)
      CMD="$1"
      shift
      ;;
  esac
fi

for arg in "$@"; do
  case "$arg" in
    --dir=*) DIR="${arg#--dir=}" ;;
    --tag=*) TAG="${arg#--tag=}" ;;
    --admin-email=*) ADMIN_EMAIL="${arg#--admin-email=}" ;;
    --admin-password=*) ADMIN_PASSWORD="${arg#--admin-password=}" ;;
    -h | --help) CMD="help" ;;
    *)
      echo "capnatix.sh: unrecognized argument: $arg" >&2
      exit 1
      ;;
  esac
done

log() { printf '==> %s\n' "$1"; }

print_usage() {
  cat <<'EOF'
Usage: capnatix.sh <command> [options]

Commands:
  install        Get docker-compose.yaml + app.env, with secrets filled in.
  start          Start the stack (applies pending database migrations first).
  stop           Stop the stack.
  restart        stop, then start.
  first-setup    Create the admin account. --admin-email= required (or
                 you'll be prompted); --admin-password= optional (a strong
                 one is generated and printed once if you don't set it).
  status         Show what's running.

Options:
  --dir=PATH           Install directory (default: ./capnatix)
  --tag=TAG            capnatix-installer image tag to pull (default: stable)
  --admin-email=EMAIL     (first-setup)
  --admin-password=PASS   (first-setup)
EOF
}

# ---------------------------------------------------------------------------
# Shared: locating Docker, and the docker compose invocation every verb but
# install uses.
# ---------------------------------------------------------------------------
as_root() {
  if [ "$(id -u)" = "0" ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    echo "capnatix.sh: need root (or sudo) to run: $*" >&2
    exit 1
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    log "Docker not found -- installing via get.docker.com"
    curl -fsSL https://get.docker.com | as_root sh -
    if [ "$(id -u)" != "0" ]; then
      as_root usermod -aG docker "$(id -un)" || true
      echo "capnatix.sh: added $(id -un) to the docker group -- log out and back in (or run 'newgrp docker'), then re-run this command." >&2
      exit 1
    fi
  fi

  DOCKER="docker"
  if ! docker info >/dev/null 2>&1; then
    if [ "$(id -u)" != "0" ]; then
      if command -v sudo >/dev/null 2>&1; then
        DOCKER="sudo docker"
      else
        echo "capnatix.sh: docker was installed but isn't usable yet by $(id -un), and sudo isn't available to fall back on. Log out and back in (or run 'newgrp docker'), then re-run this command." >&2
        exit 1
      fi
    fi
  fi
}

require_stack() {
  if [ ! -f "$DIR/docker-compose.yaml" ] || [ ! -f "$DIR/app.env" ]; then
    echo "capnatix.sh: no stack found at $DIR -- run './capnatix.sh install' first." >&2
    exit 1
  fi
}

compose() {
  $DOCKER compose -f "$DIR/docker-compose.yaml" --env-file "$DIR/app.env" "$@"
}

# ---------------------------------------------------------------------------
# install
# ---------------------------------------------------------------------------
cmd_install() {
  require_docker

  if ! command -v openssl >/dev/null 2>&1; then
    echo "capnatix.sh: openssl is required to generate secrets and wasn't found on this host." >&2
    exit 1
  fi

  mkdir -p "$DIR"

  log "Pulling capnatix/capnatix-installer:$TAG"
  # --platform linux/amd64: every real Capnatix image is built amd64-only
  # and pulled under emulation on an arm64 host (docker-compose.yaml
  # already pins this per-service, for the same reason) -- capnatix-
  # installer is no exception, and unlike those it carries no files that
  # ever execute (Dockerfile.installer: FROM scratch, just COPY), so
  # emulation cost is irrelevant here, only the manifest needs to resolve.
  $DOCKER pull --platform linux/amd64 "capnatix/capnatix-installer:$TAG"
  CID=$($DOCKER create --platform linux/amd64 "capnatix/capnatix-installer:$TAG")

  # Neither file is silently overwritten on a re-run -- once either holds
  # a real edit (app.env's generated secrets and whatever an operator has
  # filled in; docker-compose.yaml, if hand-edited) a fresh copy from a
  # newer image would discard it with no warning. Remove either yourself
  # first if you want a newer release's copy.
  if [ -f "$DIR/docker-compose.yaml" ]; then
    log "$DIR/docker-compose.yaml already exists -- leaving it untouched"
  else
    $DOCKER cp "$CID:/dist/docker-compose.yaml" "$DIR/docker-compose.yaml"
  fi

  if [ -f "$DIR/app.env" ]; then
    # Still worth merging in any KEY the template has grown since this
    # app.env was first created (env.prod.example has repeatedly gained
    # new *required* vars). Appended, never merged in place: an existing
    # KEY's value, generated or hand-edited, is never touched.
    log "$DIR/app.env already exists -- adding any new variables a newer template may have introduced, leaving existing ones untouched"
    TEMPLATE="$DIR/.app.env.template.$$"
    $DOCKER cp "$CID:/dist/env.prod.example" "$TEMPLATE"
    ADDED=0
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

  # Restricted before any secret is written into it, not after.
  chmod 600 "$DIR/app.env"

  log "Generating secrets"
  rand() { openssl rand -base64 "$1" | tr -d '=+/\n'; }

  # Real EXTERNAL credentials this host has no way to generate -- left at
  # their template placeholder on purpose, so they surface in the
  # leftover checklist below instead of silently becoming a garbage
  # value nothing ever points the operator at again.
  is_external_credential() {
    case "$1" in
      API_KEY | STORAGE_ACCESS_KEY | STORAGE_SECRET_KEY | EXTERNAL_API_PG_PASS) return 0 ;;
      *) return 1 ;;
    esac
  }

  bytes_for() {
    case "$1" in
      FILE_URL_SIGNING_SECRET | INTERNAL_SERVICE_TOKEN) echo 48 ;;
      *) echo 32 ;;
    esac
  }

  GENERATED=0
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      [A-Z_]*=CHANGE-ME*)
        key="${line%%=*}"
        if is_external_credential "$key"; then
          continue
        fi
        value="$(rand "$(bytes_for "$key")")"
        sed -i.bak "s#^${key}=CHANGE-ME.*#${key}=${value}#" "$DIR/app.env"
        GENERATED=$((GENERATED + 1))
        ;;
    esac
  done <"$DIR/app.env"
  rm -f "$DIR/app.env.bak"
  log "Generated $GENERATED secret(s)"

  log "Creating data directories under /data/capnatix"
  as_root mkdir -p /data/capnatix/pg-data /data/capnatix/redis-data \
    /data/capnatix/litellm-db-data /data/capnatix/drive-data

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
  echo "Then: ./capnatix.sh start"
}

# ---------------------------------------------------------------------------
# start / stop / restart / status
# ---------------------------------------------------------------------------
cmd_start() {
  require_docker
  require_stack

  log "Starting the stack"
  compose up -d

  # A one-shot migrator service (running automatically as part of `up`,
  # with the rest of the stack depending on it finishing) is the cleaner
  # long-term fix -- until docker-compose.yaml has one, run it here so
  # this is still the ONE command needed, not a separate manual step.
  log "Applying database migrations"
  TRIES=0
  until compose exec -T inf-backend sh -c "cd /app && npx knex migrate:latest"; do
    TRIES=$((TRIES + 1))
    if [ "$TRIES" -ge 30 ]; then
      echo "capnatix.sh: migration failed after $TRIES attempts -- see the error above (if inf-backend just wasn't up yet, its own logs are: docker compose -f $DIR/docker-compose.yaml --env-file $DIR/app.env logs inf-backend)." >&2
      exit 1
    fi
    sleep 1
  done
  compose restart inf-cron >/dev/null

  log "Waiting for the app to respond"
  PROXY_PORT=$(grep '^PROXY_PORT=' "$DIR/app.env" | cut -d= -f2-)
  PROXY_PORT=${PROXY_PORT:-80}
  TRIES=0
  until curl -fsS -o /dev/null "http://localhost:$PROXY_PORT/" 2>/dev/null; do
    TRIES=$((TRIES + 1))
    if [ "$TRIES" -ge 60 ]; then
      echo "capnatix.sh: the app didn't respond on port $PROXY_PORT after 60s -- check 'capnatix.sh status' and logs." >&2
      exit 1
    fi
    sleep 1
  done

  INF_FRONTEND_URL=$(grep '^INF_FRONTEND_URL=' "$DIR/app.env" | cut -d= -f2-)
  VISIT_URL=${INF_FRONTEND_URL:-http://localhost:$PROXY_PORT}
  USER_COUNT=$(compose exec -T postgres psql -U capnatix -d capnatix -tAc \
    "select count(*) from users" 2>/dev/null | tr -d '[:space:]')
  if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    log "Started. Visit $VISIT_URL -- there's no account yet, run './capnatix.sh first-setup' next."
  else
    log "Started. Visit $VISIT_URL"
  fi
}

cmd_stop() {
  require_docker
  require_stack
  compose down
}

cmd_restart() {
  cmd_stop
  cmd_start
}

cmd_status() {
  require_docker
  require_stack
  compose ps
}

# ---------------------------------------------------------------------------
# first-setup
# ---------------------------------------------------------------------------
cmd_first_setup() {
  require_docker
  require_stack

  if [ -z "$ADMIN_EMAIL" ]; then
    printf 'Admin email: '
    read -r ADMIN_EMAIL
  fi
  if [ -z "$ADMIN_EMAIL" ]; then
    echo "capnatix.sh: an admin email is required." >&2
    exit 1
  fi

  GENERATED=0
  if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '=+/\n')
    GENERATED=1
  fi

  # initialize-fresh-instance.js applies any pending migration itself
  # before creating anything, and is safe to re-run: an existing admin is
  # left untouched (never resets a password), and the fund is only
  # created if the instance has none yet.
  #
  # `timeout` + a direct DB check rather than trusting this call's own
  # exit code: as of this writing, the script itself finishes its real
  # work (prints "Done.") and then never exits -- a confirmed upstream
  # bug (the account IS created correctly; the process just hangs
  # afterward). Without the timeout this would block forever. `timeout`
  # execs a real binary, not a shell function, so this inlines the same
  # command compose() itself builds rather than calling that function.
  set +e
  timeout 60 $DOCKER compose -f "$DIR/docker-compose.yaml" --env-file "$DIR/app.env" \
    exec -T inf-backend node tools/initialize-fresh-instance.js \
    --admin-email="$ADMIN_EMAIL" --admin-password="$ADMIN_PASSWORD"
  STATUS=$?
  set -e
  if [ "$STATUS" -ne 0 ] && [ "$STATUS" -ne 124 ]; then
    echo "capnatix.sh: first-setup failed (exit $STATUS)." >&2
    exit 1
  fi
  EXISTS=$(compose exec -T postgres psql -U capnatix -d capnatix -tAc \
    "select 1 from users where email='${ADMIN_EMAIL}'" 2>/dev/null || true)
  if [ "$(echo "$EXISTS" | tr -d '[:space:]')" != "1" ]; then
    echo "capnatix.sh: could not confirm the admin account was created -- check 'capnatix.sh status' and inf-backend's logs." >&2
    exit 1
  fi

  if [ "$GENERATED" -eq 1 ]; then
    echo
    echo "Generated admin password (shown once, save it now): $ADMIN_PASSWORD"
  fi
  INF_FRONTEND_URL=$(grep '^INF_FRONTEND_URL=' "$DIR/app.env" | cut -d= -f2-)
  LOGIN_URL=${INF_FRONTEND_URL:-your instance URL}
  echo "Log in at $LOGIN_URL -- you will be asked to set a new password on first login."
}

# ---------------------------------------------------------------------------
case "$CMD" in
  install | download) cmd_install ;;
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_restart ;;
  status) cmd_status ;;
  first-setup) cmd_first_setup ;;
  help | "") print_usage ;;
  *)
    echo "capnatix.sh: unknown command: $CMD" >&2
    print_usage
    exit 1
    ;;
esac
