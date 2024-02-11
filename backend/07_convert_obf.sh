#!/bin/bash -eux

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
OUTPUT="$WORK_DIR/output"

cd "$OSMAND_DIR"
envsubst 'WORK_DIR' < "$SCRIPT_DIR/07_osmand_conf.xml.template" > "$WORK_DIR/input/osmand/batch-files/regioni-batch.xml"
exec java \
    -Djava.util.logging.config.file=logging.properties \
    -Xms64M -Xmx12G \
    -cp "./OsmAndMapCreator.jar:lib/OsmAnd-core.jar:./lib/*.jar" "net.osmand.util.IndexBatchCreator" \
    "$WORK_DIR/input/osmand/batch-files/regioni-batch.xml"

cd "$OUTPUT/dati/poly/regioni/obf"
for file in *
do
    newfile="$(echo "$file" | sed -Ef "$SCRIPT_DIR/07_rename.sed")"
    if [ "$file" != "$newfile" ]
    then
        mv -f "$file" "$newfile"
    fi
done
