#!/bin/bash -eux

OUTPUT="$1"
DATABASE="$2"
BOUNDARIES="$3"

for file in "$BOUNDARIES"/province/*.geojson
do
    name="$(basename "$file" .geojson)"
    ref_istat="${name%%_*}"
    parent="$({ cat << EOF
        select r.filename
          from boundaries p
          join boundaries r
            on r.ref_istat = p.reg_istat_code
         where r.admin_level = 4 and p.admin_level = 6
               and p.ref_istat = '$ref_istat'
EOF
    } | sqlite3 -bail "$DATABASE")"
    osmium extract --overwrite \
        --polygon="$file" \
        --output="$OUTPUT/$name.osm.pbf" \
        "$OUTPUT/../regioni/$parent.osm.pbf"
done

