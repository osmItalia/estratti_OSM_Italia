#!/usr/bin/bash

set -eEuxo pipefail

OUTPUT="$WORK_DIR/output"
cd "$OUTPUT/boundaries/poly"
sqlite3 -bail "$OUTPUT/boundaries.sqlite" < "$SCRIPTS_DIR/04_generate_geojson.sql"
