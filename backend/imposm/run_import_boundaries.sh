#!/bin/bash -eu
#

pushd $WORK_DIR/input/pbf
wget http://download.geofabrik.de/europe/italy-latest.osm.pbf
popd

cat <<EOF > $(pwd)/config/estratti.json 
{
    "cachedir": "$SCRIPTS_DIR/imposm/cache/estratti",
    "connection": "postgis://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE",
    "mapping": "$SCRIPTS_DIR/imposm/mapping/estratti.yml"
}

EOF


imposm import -config $(pwd)/config/estratti.json --read $WORK_DIR/input/pbf/italy-latest.osm.pbf -overwritecache
imposm import -config $(pwd)/config/estratti.json -write -optimize
imposm import -config $(pwd)/config/estratti.json -deployproduction




#

