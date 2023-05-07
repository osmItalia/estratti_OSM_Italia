#!/bin/bash -eu

mkdir -p "$WORK_DIR"
cd "$_"

mkdir -p input/pbf

mkdir -p output/boundaries/poly/{comuni,province,regioni}
mkdir -p output/dati/poly/{comuni,province,regioni}/{gpkg,pbf,obf}

mkdir -p input/osmand/batch-files/
mkdir -p input/osmand/tmp
cat << EOF > input/osmand/batch-files/regioni-batch.xml
<?xml version="1.0" encoding="utf-8"?>
<batch_process>
        <process_attributes mapZooms="" renderingTypesFile=""
                zoomWaySmoothness="" osmDbDialect="sqlite" mapDbDialect="sqlite" />
        <process directory_for_osm_files="$WORK_DIR/output/dati/poly/regioni/pbf"
                directory_for_index_files="$WORK_DIR/output/dati/poly/regioni/obf"
                directory_for_generation="$WORK_DIR/input/osmand/tmp"
                skipExistingIndexesAt="$WORK_DIR/input/osmand/tmp"
                indexPOI="true" indexRouting="true" indexMap="true"
                indexTransport="true" indexAddress="true"/>
</batch_process>
EOF
