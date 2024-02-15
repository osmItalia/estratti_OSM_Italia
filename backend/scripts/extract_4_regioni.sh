#!/bin/bash -eux

OUTPUT="$1"
INPUT="$2"
BOUNDARIES="$3"

for file in "$BOUNDARIES"/regioni/*.geojson
do
    name="$(basename "$file" .geojson)"
    osmium extract --overwrite \
        --polygon="$file" \
        --output="$OUTPUT/$name.osm.pbf" \
        "$INPUT"
done
