#!/bin/bash -eux

MAPCREATOR="$1"
CONF="$2"
 
cd "$MAPCREATOR"
exec java \
     -Djava.util.logging.config.file=logging.properties \
     -Xms64M -Xmx12G \
     -cp "./OsmAndMapCreator.jar:lib/OsmAnd-core.jar:./lib/*.jar" "net.osmand.util.IndexBatchCreator" \
    "$CONF"

