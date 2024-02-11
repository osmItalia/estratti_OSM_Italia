#!/bin/bash -eux

OUTPUT="$WORK_DIR/output"

for file in "$OUTPUT"/dati/poly/*/pbf/*.osm.pbf
do
    name="$(basename "$file" .osm.pbf)"
    type="$(basename $(dirname $(dirname "$file")))"
    ogr2ogr -overwrite -f GPKG -dsco VERSION=1.2 -progress \
      "$OUTPUT/dati/poly/$type/gpkg/$name.gpkg" "$file"
done
