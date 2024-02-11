#!/bin/bash -eux

OUTPUT="$WORK_DIR/output"
mkdir -p "$OUTPUT"/boundaries/poly
cd "$_"
mkdir {comuni,province,regioni}
sqlite3 -bail "$OUTPUT/boundaries.sqlite" < "$SCRIPTS_DIR/04_generate_geojson.sql"
