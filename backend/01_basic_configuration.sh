#!/bin/bash -eux

mkdir -p "$WORK_DIR"/input/pbf

mkdir -p "$WORK_DIR"/output/boundaries/poly/{comuni,province,regioni}
mkdir -p "$WORK_DIR"/output/dati/poly/{comuni,province,regioni}/{gpkg,pbf,obf}

mkdir -p "$WORK_DIR"/input/osmand/{batch-files,tmp}
