#!/bin/bash -eux

OUTPUT="$1"
PBF_DIR="$2"

for pbf in "$PBF_DIR"/*.osm.pbf
do
    base="$(basename "$pbf" .osm.pbf)"
    lower="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')"
    for ext in obf "obf.gen.log"
    do
        src="$OUTPUT/${lower}_2.$ext"
        dst="$OUTPUT/${base}.$ext"
        if [ -f "$src" ]
        then
            mv -f "$src" "$dst"
        fi
    done
done
