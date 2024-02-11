#!/bin/bash -eux

cd -- "$( dirname -- "${BASH_SOURCE[0]}" )"

./02_download_latest.sh
./03_generate_boundaries.sh
./04_generate_geojson.sh
./05_extract_pbf.sh
./06_convert_gpkg.sh
./07_convert_obf.sh
./08_generate_topojson.sh
