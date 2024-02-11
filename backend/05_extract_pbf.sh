#!/bin/bash -eux
set -o pipefail

OUTPUT="$WORK_DIR/output"

mkdir -p "$OUTPUT"/dati/poly/{comuni,province,regioni}/pbf

for file in "$OUTPUT"/boundaries/poly/regioni/*.geojson
do
    name="$(basename "$file" .geojson)"
    type="$(basename $(dirname "$file"))"
    osmium extract --overwrite \
        --polygon="$file" \
        --output="$OUTPUT/dati/poly/$type/pbf/$name.osm.pbf" \
        "$WORK_DIR/input/pbf/latest.osm.pbf"
done

for file in "$OUTPUT"/boundaries/poly/province/*.geojson
do
    name="$(basename "$file" .geojson)"
    type="$(basename $(dirname "$file"))"
    ref_istat="${name%%_*}"
    parent="$({ cat << EOF
        select r.filename
          from boundaries p
          join boundaries r
            on r.ref_istat = p.reg_istat_code
         where r.admin_level = 4 and p.admin_level = 6
               and p.ref_istat = '$ref_istat'
EOF
    } | sqlite3 -bail "$OUTPUT/boundaries.sqlite")"
    osmium extract --overwrite \
        --polygon="$file" \
        --output="$OUTPUT/dati/poly/$type/pbf/$name.osm.pbf" \
        "$OUTPUT/dati/poly/regioni/pbf/$parent.osm.pbf"
done

for file in "$OUTPUT"/boundaries/poly/comuni/*.geojson
do
    name="$(basename "$file" .geojson)"
    type="$(basename $(dirname "$file"))"
    ref_istat="${name%%_*}"
    parent="$({ cat << EOF
        select p.filename
          from boundaries c
          join boundaries p
            on p.ref_istat = c.pro_istat_code
         where p.admin_level = 6 and c.admin_level = 8
               and c.ref_istat = '$ref_istat'
EOF
    } | sqlite3 -bail "$OUTPUT/boundaries.sqlite")"
    osmium extract --overwrite \
        --polygon="$file" \
        --output="$OUTPUT/dati/poly/$type/pbf/$name.osm.pbf" \
        "$OUTPUT/dati/poly/province/pbf/$parent.osm.pbf"
done
