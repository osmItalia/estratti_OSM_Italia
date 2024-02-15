#!/bin/bash -eux
set -o pipefail

OUTPUT="$1"
INPUT="$2"
BOUNDARIES_INI="$3"
BOUNDARIES_SQL="$4"

osmium tags-filter "$INPUT" \
  r/boundary=administrative -f pbf -o - |
    ogr2ogr \
    -dsco SPATIALITE=YES \
    -oo CONFIG_FILE="$BOUNDARIES_INI" \
    -preserve_fid \
    -lco FID=osm \
    -nln boundaries \
    -where "cast(admin_level as integer) in (4, 6, 8)" \
    "$OUTPUT" "/vsistdin?buffer_limit=-1" multipolygons

sqlite3 -bail "$OUTPUT" < "$BOUNDARIES_SQL"
