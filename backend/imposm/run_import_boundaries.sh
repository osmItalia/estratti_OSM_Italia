#!/bin/bash
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


/usr/bin/imposm import -config $(pwd)/config/estratti.json --read $WORK_DIR/input/pbf/italy-latest.osm.pbf -overwritecache
/usr/bin/imposm import -config $(pwd)/config/estratti.json -write -optimize
/usr/bin/imposm import -config $(pwd)/config/estratti.json -deployproduction




#

