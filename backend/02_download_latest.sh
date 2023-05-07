#!/bin/bash -eu

COUNTRY_PBF="europe/italy-latest.osm.pbf"
COUNTRY_STATE="europe/italy-updates/state.txt"

cd "$WORK_DIR/input/pbf/"
wget -N "https://download.geofabrik.de/$COUNTRY_PBF"
wget -O "$WORK_DIR/input/pbf/state.txt" "https://download.geofabrik.de/$COUNTRY_STATE"
