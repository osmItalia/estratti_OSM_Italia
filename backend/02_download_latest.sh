#!/bin/bash -eux

COUNTRY="europe/italy"
OUTPUT="latest.osm.pbf"

mkdir -p "$WORK_DIR/input/pbf"
cd "$_"
if test -e "$OUTPUT"
then opts=(-z "$OUTPUT")
else opts=()
fi
curl "https://download.geofabrik.de/$COUNTRY-latest.osm.pbf" -o "$OUTPUT" "${opts[@]}"
