#!/bin/bash -eu

pushd "$WORK_DIR"/input/pbf
wget -N http://download.geofabrik.de/europe/italy-latest.osm.pbf
popd

mkdir -p config
cat <<EOF > config/estratti.json
{
    "cachedir": "$PWD/imposm/cache/estratti",
    "connection": "postgis://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE",
    "mapping": "$PWD/imposm/mapping/estratti.yml"
}
EOF

imposm import -config "$PWD"/config/estratti.json --read "$WORK_DIR"/input/pbf/italy-latest.osm.pbf -overwritecache
imposm import -config "$PWD"/config/estratti.json -write -optimize
imposm import -config "$PWD"/config/estratti.json -deployproduction
