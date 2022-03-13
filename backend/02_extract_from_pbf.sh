#!/bin/bash
#

#!/bin/bash
#

pushd $SCRIPTS_DIR/imposm

./run_import_boundaries.sh

popd

psql < boundaries_struct.sql



#

