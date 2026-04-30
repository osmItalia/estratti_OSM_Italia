#!/bin/bash
#
# Simple cronjob for anacron

logfile="/var/log/estratti/last"

mkdir -p "$(dirname $logfile)"
exec >> "$logfile"
exec 2>&1

OPTS="-C /root --keep-going"

make $OPTS setup_garmin_data

make $OPTS pbf

make $OPTS obf -j$(nproc)
make $OPTS gpkg -j$(nproc)

make $OPTS topojson
make $OPTS webapp
