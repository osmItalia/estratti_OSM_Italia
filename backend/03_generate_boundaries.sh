#!/usr/bin/bash

set -eEuxo pipefail

OUTPUT="$WORK_DIR/output"

osmium tags-filter "$WORK_DIR/input/pbf/latest.osm.pbf" \
  r/boundary=administrative -f pbf -o - |
    ogr2ogr \
    -dsco SPATIALITE=YES \
    -oo CONFIG_FILE="$SCRIPTS_DIR/03_boundaries.ini" \
    -preserve_fid \
    -lco FID=osm \
    -nln boundaries \
    -where "cast(admin_level as integer) in (4, 6, 8)" \
    "$OUTPUT/boundaries.sqlite" "/vsistdin?buffer_limit=-1" multipolygons

sqlite3 -bail "$OUTPUT/boundaries.sqlite" < "$SCRIPTS_DIR/03_boundaries.sql"
