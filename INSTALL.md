# Setup on Debian 11

Everything is run inside `/srv`, if not specified otherwise.

## Install dependencies

### Common

```bash
apt-get install \
    `# generic`
    git curl sqlite3 libsqlite3-mod-spatialite
    `# web app`
    npm \
    nginx libnginx-mod-http-lua \
    `# pbf` \
    osmium-tool \
    `# OsmAndMapCreator` \
    openjdk-11-jre-headless \
    `# gpkg` \
    gdal-bin
```

### Clone repository

```bash
git clone https://github.com/osmItalia/estratti_OSM_Italia.git
cd estratti_OSM_Italia
```

## Configuration

### Scripts

#### Prepare environment

```bash
source estratti_osm-it.env
```

#### Setup OsmAndMapCreator

```bash
mkdir -p "$OSMAND_DIR"
cd "$_"
wget https://download.osmand.net/latest-night-build/OsmAndMapCreator-main.zip
unzip OsmAndMapCreator-main
rm OsmAndMapCreator-main.zip
```

#### mapshaper and topojson

Additional setup that could be required on WM servers to run npm:

```bash
sudo aptitude install npm # select second option
```

Install mapshaper and topojson:

```bash
npm --prefix=$NPM_PREFIX install mapshaper
npm --prefix=$NPM_PREFIX install topojson-server
```

#### Run

```bash
source estratti_osm-it.env
./run.sh
```

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

### crontab (example)

```
0 2 * * * /srv/estratti_OSM_Italia/backend/run.sh
```

