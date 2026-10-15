#!/bin/bash
#
# Simple cronjob for anacron

LOG_DIR="${LOG_DIR:-/var/log/estratti}"
logfile="$LOG_DIR/last"

mkdir -p "$(dirname "$logfile")"

OPTS="-C /root --keep-going"

{
    echo "[$(date -Is)] Inizio generazione"
    make $OPTS setup_garmin_data

    make $OPTS pbf

    make $OPTS obf -j$(nproc)
    make $OPTS gpkg -j$(nproc)
    make $OPTS garmin_regioni

    make $OPTS topojson
    make $OPTS webapp
    echo "[$(date -Is)] Fine generazione"
} > "$logfile" 2>&1

if [ -n "$MAILTO" ]; then
    make $OPTS --no-print-directory healthcheck
fi

if [ -n "$PING_URL" ]; then
    curl -fsS -m 10 --retry 3 -o /dev/null "$PING_URL" || true
fi
