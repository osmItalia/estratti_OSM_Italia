#!/bin/bash -eu

COUNTRY_PBF="europe/italy-latest.osm.pbf"
COUNTRY_STATE="europe/italy-updates/state.txt"

cd "$WORK_DIR/input/pbf/"
wget -N https://download.geofabrik.de/$COUNTRY_PBF
wget -O $WORK_DIR/input/pbf/state.txt https://download.geofabrik.de/$COUNTRY_STATE

cd "$WORK_DIR/output/scripts"
chmod +x *.sh

./regioni_poly.sh
./regioni_bbox.sh
./province_poly.sh
./province_bbox.sh
./comuni_poly.sh
./comuni_bbox.sh

# per estrarre in formato OSMAND
cd $WORK_DIR/input/osmand
./osmand-regioni.sh

cd /srv/estratti/output/scripts
./convert_regioni_poly.sh
./convert_regioni_bbox.sh
./convert_province_poly.sh
./convert_province_bbox.sh
./convert_comuni_poly.sh
./convert_comuni_bbox.sh
