#!/bin/bash -eux

MAPCREATOR="$1"
CONF="$2"
 
cd "$MAPCREATOR"
# https://github.com/osmandapp/OsmAnd-tools/issues/484#issuecomment-1315382705
exec java \
     -Djava.util.logging.config.file=logging.properties \
     -Xms64M -Xmx12G \
     --add-opens java.base/java.util=ALL-UNNAMED \
     -cp "./OsmAndMapCreator.jar:lib/OsmAnd-core.jar:./lib/*.jar" "net.osmand.util.IndexBatchCreator" \
    "$CONF"

