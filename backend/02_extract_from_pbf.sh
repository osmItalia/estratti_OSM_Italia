#!/bin/bash -eu

psql -1 -v "ON_ERROR_STOP=1" -f boundaries_struct.sql
cd imposm
./run_import_boundaries.sh
