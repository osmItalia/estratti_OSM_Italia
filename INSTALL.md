# Setup on Debian 11

Everything is run inside `/srv`, if not specified otherwise.

## Install dependencies

### Common

```bash
apt-get install \
    `# generic`
    git 
    `# web app`
    npm \
    nginx libnginx-mod-http-lua \
    `# estratti` \
    postgresql-13 postgresql-13-postgis-3 \
    osmium-tool \
    python3-psycopg2 \
    `# estratti (imposm)` \
    golang libgeos-dev libleveldb-dev \
    `# OsmAndMapCreator` \
    openjdk-11-jre-headless \
    `# download_latest.sh` \
    gdal-bin
```

### Imposm

```bash
go get github.com/omniscale/imposm3
GOBIN=/usr/local/bin go install github.com/omniscale/imposm3/cmd/imposm
```

### Clone repository

```bash
git clone https://github.com/osmItalia/estratti_OSM_Italia.git
cd estratti_OSM_Italia
```

## Configuration

### PostgreSQL

```bash
sudo -u postgres createuser osm
sudo -u postgres createdb osm
sudo -u postgres psql -c 'GRANT ALL PRIVILEGES ON DATABASE osm TO osm'
sudo -u postgres psql -c "ALTER USER osm WITH PASSWORD 'osm'"
sudo -u postgres psql -c 'CREATE EXTENSION postgis' osm
```

### Scripts

#### Prepare environment

```bash
source estratti_osm-it.env
```

#### Setup OsmAndMapCreator

```
cd "$WORK_DIR/input/osmand"
wget https://download.osmand.net/latest-night-build/OsmAndMapCreator-main.zip
unzip OsmAndMapCreator-main
rm OsmAndMapCreator-main.zip
cat << 'EOF' > osmand-regioni.sh
#!/bin/bash
exec java \
    -Djava.util.logging.config.file=logging.properties \
    -Xms64M -Xmx12G \
    -cp "./OsmAndMapCreator.jar:lib/OsmAnd-core.jar:./lib/*.jar" "net.osmand.util.IndexBatchCreator" \
    batch-files/regioni-batch.xml
EOF
chmod +x osmand-regioni.sh
mkdir batch-files
cat << EOF > batch-files/regioni-batch.xml
<?xml version="1.0" encoding="utf-8"?>
<batch_process>
        <process_attributes mapZooms="" renderingTypesFile=""
                zoomWaySmoothness="" osmDbDialect="sqlite" mapDbDialect="sqlite" />
        <process directory_for_osm_files="$WORK_DIR/output/dati/poly/regioni/pbf"
                directory_for_index_files="$WORK_DIR/output/dati/poly/regioni/obf"
                directory_for_generation="$WORK_DIR/input/osmand/tmp"
                skipExistingIndexesAt="$WORK_DIR/input/osmand/tmp"
                indexPOI="true" indexRouting="true" indexMap="true"
                indexTransport="true" indexAddress="true"/>
</batch_process>
EOF
cd -
mkdir -p "$WORK_DIR"/input/osmand/tmp
mkdir -p "$WORK_DIR"/output/dati/poly/regioni/{pbf,obf}
```

#### Run

```bash
echo ??_*.{sh,py} | tr ' ' '\n' | sort | (set -e;
while read path
do
    ./"$path"
done)
find "$WORK_DIR" -type f -name "*.sh" -exec chmod +x "{}" \;
mkdir -p "$WORK_DIR"/input/pbf/europe/
./download_latest.sh
```

#### Workaround Sardegna

Should be executed between step 3 and 4 and it relies on some files that have been previously saved on the server.

```bash
psql -c "\copy boundaries FROM '/srv/Sud Sardegna/sudsardegna.tsv' WITH NULL AS ''";
cp "/srv/Sud Sardegna/111_Sud Sardegna.poly" "$WORK_DIR"/output/boundaries/poly/province/
```

#### gen-topojson.sh

Follow `scripts/README.md`.

### Web

Modify `default` accordingly to your needs.

```bash
cp nginx/default.conf /etc/nginx/sites-enabled/default
systemctl start nginx
systemctl enable nginx

cd webapp
npm install
npm run build
```

