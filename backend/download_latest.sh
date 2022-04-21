#!/bin/bash -eu

COUNTRY_PBF="europe/italy-latest.osm.pbf"
COUNTRY_STATE="europe/italy-updates/state.txt"

cd "$WORK_DIR/input/pbf/"
wget -N "https://download.geofabrik.de/$COUNTRY_PBF"
wget -O "$WORK_DIR/input/pbf/state.txt" "https://download.geofabrik.de/$COUNTRY_STATE"

cd "$WORK_DIR/output/scripts"
chmod +x *.sh

# estrazione italy-latest.pbf -> ${ente}.pbf
bash -eu ./regioni_poly.sh
bash -eu ./province_poly.sh
bash -eu ./comuni_poly.sh

#bash -eu ./regioni_bbox.sh
#bash -eu ./province_bbox.sh
#bash -eu ./comuni_bbox.sh

# per estrarre in formato OSMAND
cd "$WORK_DIR/input/osmand"
bash -eu ./osmand-regioni.sh

# conversione pbf -> gpkg
cd "$WORK_DIR/output/scripts"
bash -eu ./convert_regioni_poly.sh
bash -eu ./convert_province_poly.sh
bash -eu ./convert_comuni_poly.sh

#bash -eu ./convert_regioni_bbox.sh
#bash -eu ./convert_province_bbox.sh
#bash -eu ./convert_comuni_bbox.sh
