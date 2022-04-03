#!/bin/bash -eu

psql -1 < boundaries_struct.sql
pushd $SCRIPTS_DIR/imposm
./run_import_boundaries.sh
popd
