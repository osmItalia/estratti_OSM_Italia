#!/bin/bash -eux

OUTPUT="$1"
DATABASE="$2"
BOUNDARIES="$3"

for file in "$BOUNDARIES"/comuni/*.geojson
do
    name="$(basename "$file" .geojson)"
    ref_istat="${name%%_*}"
    parent="$({ cat << EOF
        select p.filename
          from boundaries c
          join boundaries p
            on p.ref_istat = c.pro_istat_code
         where p.admin_level = 6 and c.admin_level = 8
               and c.ref_istat = '$ref_istat'
EOF
    } | sqlite3 -bail "$DATABASE")"
    osmium extract --overwrite \
        --polygon="$file" \
        --output="$OUTPUT/$name.osm.pbf" \
        "$OUTPUT"/../province/"$parent.osm.pbf"
done
