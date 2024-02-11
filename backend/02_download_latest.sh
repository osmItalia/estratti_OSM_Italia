#!/bin/bash -eux

COUNTRY="europe/italy"
OUTPUT="latest.osm.pbf"

cd "$WORK_DIR/input/pbf/"
if test -e "$OUTPUT"
then opts=(-z "$OUTPUT")
else opts=()
fi
curl "https://download.geofabrik.de/$COUNTRY-latest.osm.pbf" -o "$OUTPUT" "${opts[@]}"
