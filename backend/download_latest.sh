#!/bin/bash -eu

COUNTRY_PBF="europe/italy-latest.osm.pbf"
COUNTRY_STATE="europe/italy-updates/state.txt"

wget -O $WORK_DIR/input/pbf/$COUNTRY_PBF http://download.geofabrik.de/$COUNTRY_PBF
wget -O $WORK_DIR/input/pbf/state.txt http://download.geofabrik.de/$COUNTRY_STATE

cd $WORK_DIR/output/scripts
chmod +x *.sh

./regioni_poly.sh &> regioni_poly.log
./regioni_bbox.sh &> regioni_bbox.log
./province_poly.sh &> province_poly.log
./province_bbox.sh &> province_bbox.log
./comuni_poly.sh &> comuni_poly.log
./comuni_bbox.sh &> comuni_bbox.log

# per estrarre in formato OSMAND
cd $WORK_DIR/input/osmand
./osmand-regioni.sh

cd /srv/estratti/output/scripts
./convert_regioni_poly.sh &> convert_regioni_poly.log
./convert_regioni_bbox.sh &> convert_regioni_bbox.log
./convert_province_poly.sh &> convert_province_poly.log
./convert_province_bbox.sh &> convert_province_bbox.log
./convert_comuni_poly.sh &> convert_comuni_poly.log
./convert_comuni_bbox.sh &> convert_comuni_bbox.log
