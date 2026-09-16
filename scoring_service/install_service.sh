#!/usr/bin/env bash
# Run on the student00 Linux EC2 host, not in CloudShell.
set -euo pipefail
SOURCE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SOURCE_DIR/accounts.json"
LISTEN_HOST='127.0.0.1'
LISTEN_PORT='8090'
DEST='/opt/ums-scoring'
usage() {
  echo 'Usage: sudo bash install_service.sh [--config /path/accounts.json] [--listen-host 127.0.0.1|0.0.0.0] [--port 8090]'
}
while (($#)); do
  case "$1" in
    --config|--listen-host|--port)
      if (($#<2)); then usage; exit 2; fi
      case "$1" in
        --config) CONFIG_FILE="$2";;
        --listen-host) LISTEN_HOST="$2";;
        --port) LISTEN_PORT="$2";;
      esac
      shift 2;;
    --help|-h) usage; exit 0;;
    *) usage; exit 2;;
  esac
done
[[ "$EUID" -eq 0 ]] || { echo 'Run this installer with sudo on the scoring EC2 instance.'; exit 1; }
command -v systemctl >/dev/null || { echo 'This installer requires Linux with systemd.'; exit 1; }
[[ -d /run/systemd/system ]] || { echo 'systemd must be running. Run on EC2, not CloudShell.'; exit 1; }
[[ "$LISTEN_HOST" == '127.0.0.1' || "$LISTEN_HOST" == '0.0.0.0' ]] || { echo 'Invalid listen host.'; exit 2; }
[[ "$LISTEN_PORT" =~ ^[0-9]{1,5}$ ]] && ((10#$LISTEN_PORT>=1024 && 10#$LISTEN_PORT<=65535)) || { echo 'Port must be 1024-65535.'; exit 2; }
python3 -c 'import sys; assert sys.version_info >= (3,10), "Python 3.10+ is required"; import venv'
for file in server.py aws_discovery.py index.html dashboard.js requirements.txt; do
  [[ -f "$SOURCE_DIR/$file" ]] || { echo "Missing $SOURCE_DIR/$file"; exit 1; }
done
# Validate configuration before making service changes.
python3 - "$SOURCE_DIR" "$CONFIG_FILE" <<'PY'
import sys
sys.path.insert(0,sys.argv[1])
from aws_discovery import load_accounts
c=load_accounts(sys.argv[2])
print(f"Validated {len(c['accounts'])} student accounts in {c['region']}")
PY
if ! id scoring >/dev/null 2>&1; then
  useradd --system --user-group --home-dir "$DEST" --no-create-home --shell /usr/sbin/nologin scoring
fi
GROUP="$(id -gn scoring)"
install -d -m 0755 "$DEST"
# Back up installed configuration before an update.
if [[ -f "$DEST/accounts.json" ]]; then
  cp -p "$DEST/accounts.json" "$DEST/accounts.json.previous"
fi
for file in server.py aws_discovery.py index.html dashboard.js requirements.txt; do
  if [[ "$SOURCE_DIR/$file" != "$DEST/$file" ]]; then install -m 0644 "$SOURCE_DIR/$file" "$DEST/$file"; fi
done
if [[ "$(realpath "$CONFIG_FILE")" != "$DEST/accounts.json" ]]; then
  install -m 0640 -o root -g "$GROUP" "$CONFIG_FILE" "$DEST/accounts.json"
fi
chown root:"$GROUP" "$DEST/accounts.json"
chmod 0640 "$DEST/accounts.json"
python3 -m venv "$DEST/.venv"
"$DEST/.venv/bin/python" -m pip install -r "$DEST/requirements.txt"
install -d -m 0755 /etc/default
printf 'SCORING_HOST=%s\nSCORING_PORT=%s\n' "$LISTEN_HOST" "$LISTEN_PORT" > /etc/default/ums-scoring
cat > /etc/systemd/system/ums-scoring.service <<'UNIT'
[Unit]
Description=UMS instructor scoring service
Wants=network-online.target
After=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=scoring
WorkingDirectory=/opt/ums-scoring
Environment=PYTHONUNBUFFERED=1
EnvironmentFile=/etc/default/ums-scoring
ExecStart=/opt/ums-scoring/.venv/bin/python /opt/ums-scoring/server.py --aws-config /opt/ums-scoring/accounts.json --host ${SCORING_HOST} --port ${SCORING_PORT}
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true

[Install]
WantedBy=multi-user.target
UNIT
# Disable the previous documented service only when it is our old scoring service.
if systemctl cat scoring-service.service 2>/dev/null | grep -q 'scoring_service/accounts.json'; then
  systemctl disable --now scoring-service.service
fi
systemctl daemon-reload
systemctl enable ums-scoring.service
systemctl restart ums-scoring.service
sleep 2
systemctl --no-pager --full status ums-scoring.service
printf '\nInstalled. Polling and the web page now start at boot on %s:%s.\n' "$LISTEN_HOST" "$LISTEN_PORT"
echo 'Logs: sudo journalctl -u ums-scoring -f'
