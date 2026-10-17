#!/bin/bash -eux

DATABASE="$1"
OUTPUT="$2"

declare -A expected
while IFS= read -r filename
do
    for suffix in .osm.pbf .gpkg .obf .obf.gen.log .tar.gz
    do
        expected["$filename$suffix"]=1
    done
done < <(sqlite3 -bail "$DATABASE" "select filename from boundaries")

shopt -s nullglob
for dir in pbf/regioni pbf/province pbf/comuni gpkg/regioni gpkg/province gpkg/comuni obf/regioni garmin/regioni
do
    for file in "$OUTPUT/$dir"/*
    do
        name="${file##*/}"
        if [ -z "${expected[$name]:-}" ]; then
            rm "$file"
        fi
    done
done
