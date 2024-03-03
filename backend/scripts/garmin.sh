#!/bin/bash -eux
#
# Based on https://github.com/lucadelu/ital.img by Luca Delucchi

INPUT="$1"
OUTPUT="$2"
MKGMAP="$3"
MKGMAP_OPTS="$4"
SPLITTER="$5"
SPLITTER_OPTS="$6"
STYLES_DIR="$7"
SEA_DIR="$8"
BOUNDS_DIR="$9"

area_id="$(basename $OUTPUT .tar)"
area_name="${area_id#*_}"
temp_dir="$OUTPUT".temp/

function clean() {
    rm -rf "${temp_dir}"
}
trap clean EXIT INT TERM

java -jar "$SPLITTER" \
	--max-areas=4096 --max-nodes=3000000 --wanted-admin-level=8 \
	--output-dir="$temp_dir" "$INPUT"
java -jar "$MKGMAP" \
	--style-file="$STYLES_DIR/general" \
	--latin1 \
	--country-name=Italia \
	--country-abbr="IT" \
	--region-name="$area_name" \
	--area-name="$area_name" \
	--family-name="Mappe regionali ital.img" \
	--description="$area_name" \
	--precomp-sea="$SEA_DIR" \
	--generate-sea \
	--bounds="$BOUNDS_DIR" \
	--max-jobs \
	--route \
	--drive-on=detect,right \
	--process-destination \
	--process-exits \
	--location-autofill=is_in,nearest \
	--index \
	--split-name-index \
	--housenumbers \
	--add-pois-to-areas \
	--link-pois-to-ways \
	--preserve-element-order \
	--verbose \
	--name-tag-list=name,name:it,loc_name,reg_name,nat_name \
	--reduce-point-density=3.2 \
	--make-opposite-cycleways \
	--gmapsupp \
	--output-dir="$temp_dir"/ \
	"$temp_dir"/*.osm.pbf
tar -czf "$OUTPUT" "$temp_dir"/gmapsupp.img
