#!/bin/sh
# Nightly backup of the Veritamom production SQLite database.
#
# Uses the SQLite online-backup API (via better-sqlite3 inside the running
# container), so it is safe against a live database — unlike cp, which can
# capture a half-written file.
#
# One-time install on the VPS:
#   mkdir -p ~/backups/veritamom
#   crontab -e   # add the line:
#   0 3 * * * /home/chanspapi/veritamom/scripts/backup-db.sh >> /home/chanspapi/backups/veritamom/backup.log 2>&1
#
# Restore procedure (replace TIMESTAMP):
#   cd ~/veritamom && docker compose stop
#   gunzip -k ~/backups/veritamom/prod-TIMESTAMP.db.gz
#   docker run --rm -v veritamom_veritamom-db:/db -v ~/backups/veritamom:/bk alpine \
#     cp /bk/prod-TIMESTAMP.db /db/prod.db
#   docker compose up -d

set -eu

CONTAINER=veritamom-app
BACKUP_DIR="$HOME/backups/veritamom"
KEEP_DAYS=14
STAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# 1. Online backup to a temp file inside the container, then verify integrity
docker exec "$CONTAINER" node -e "
const Database = require('better-sqlite3');
const src = new Database('/app/prisma/prod.db', { readonly: true });
src.backup('/tmp/prod-backup.db')
  .then(() => {
    const copy = new Database('/tmp/prod-backup.db', { readonly: true });
    const result = copy.pragma('integrity_check', { simple: true });
    if (result !== 'ok') { console.error('integrity_check failed:', result); process.exit(1); }
    process.exit(0);
  })
  .catch((e) => { console.error(e); process.exit(1); });
"

# 2. Copy out of the container, compress, prune old backups
docker cp "$CONTAINER:/tmp/prod-backup.db" "$BACKUP_DIR/prod-$STAMP.db"
docker exec "$CONTAINER" rm -f /tmp/prod-backup.db
gzip "$BACKUP_DIR/prod-$STAMP.db"
find "$BACKUP_DIR" -name 'prod-*.db.gz' -mtime +"$KEEP_DAYS" -delete

echo "[backup] $STAMP OK $(du -h "$BACKUP_DIR/prod-$STAMP.db.gz" | cut -f1) — $(ls "$BACKUP_DIR" | grep -c '^prod-.*\.gz$') backups kept"

# 3. Off-server copy to Google Drive (haianlabs@gmail.com), so a VPS failure
#    can't take the backups with it. Remote 'gdrive' uses the drive.file
#    scope (only sees files rclone created). Remote retention: 30 days.
REMOTE_KEEP_DAYS=30
if command -v rclone >/dev/null 2>&1 && rclone listremotes 2>/dev/null | grep -q '^gdrive:'; then
  if rclone copy "$BACKUP_DIR/prod-$STAMP.db.gz" gdrive:veritamom-backups/ --drive-use-trash=false; then
    rclone delete gdrive:veritamom-backups/ --min-age "${REMOTE_KEEP_DAYS}d" --drive-use-trash=false 2>/dev/null || true
    echo "[backup] uploaded to gdrive:veritamom-backups/"
  else
    echo "[backup] WARNING: Google Drive upload FAILED — backup is local only"
  fi
else
  echo "[backup] WARNING: rclone gdrive remote not configured — backup is local only"
fi
