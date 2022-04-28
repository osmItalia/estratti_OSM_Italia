#!/bin/bash -eu

mkdir -p "$WORK_DIR"
cd "$_"
mkdir -p input/{osmand,pbf}
mkdir -p output/scripts
mkdir -p output/boundaries/{bbox,poly}/{comuni,province,regioni}
mkdir -p output/dati/{bbox,poly}/{comuni,province,regioni}/{geopackage,pbf}
