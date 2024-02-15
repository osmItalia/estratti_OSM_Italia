#!/bin/bash
#
# Simple cronjob for anacron

set -eu

logfile="/var/log/estratti/last"

mkdir -p "$(dirname $logfile)"
exec >> "$logfile"
exec 2>&1

make -C /root pbf
make -C /root -j$(nproc)
