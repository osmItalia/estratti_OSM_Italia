Generate directory and file list:

```
ssh osmit-due find /srv/estratti/output -type d -printf '%P\\n' | grep -v '^$' | sort > dir-list.txt
ssh osmit-due find /srv/estratti/output -type f -printf '%P\\n' | sort > file-list.txt
```

Restore directories and files (as empty files):

```
mkdir output
cd $_
xargs -d '\n' mkdir < "$OLDPWD/dir-list.txt"
xargs -d '\n' touch < "$OLDPWD/file-list.txt"
cd -
```

Fetch boundaries:

```
rsync -av -e ssh osmit-due:/srv/estratti/output/boundaries/ output/boundaries/
```

Convert boundaries:

```
cargo install poly2geojson
find . -name '*.poly' -type f |
    xargs -L1 -I% -d '\n' sh -c \
    'poly2geojson < "%" > $(dirname "%")/$(basename "%" .poly).geojson'
```

If poly2geojson is not available, check that `$HOME/.cargo/bin/` is included in your `PATH`.


First take: nice, polygons overlap and topology is altered:

```sql
.load mod_spatialite

select writefile(
    substr(name, 0, length(name)-7) || '-simplified.geojson',
    AsGeoJSON(SimplifyPreserveTopology(GeomFromGeoJson(json_object(
      'type', json_extract(data, '$.geometry.type'),
      'coordinates', json_extract(data, '$.geometry.coordinates')
    )), .01))
)
from fsdir('output')
where name like '%.geojson' and name not like '%-simplified.geojson'
```


Second take, based on: https://www.gaia-gis.it/fossil/libspatialite/wiki?name=topo-intermediate

additional references:
- https://trac.osgeo.org/postgis/wiki/UsersWikiSimplifyWithTopologyExt#Principleofsimplification
- https://gis.stackexchange.com/questions/178/simplifying-adjacent-polygons-using-postgis


SQLite 5.0.0 or greater required, compiled with libtopo
```sql
.load mod_spatialite
SELECT InitSpatialMetaData();

CREATE TABLE comuni (name TEXT NOT NULL PRIMARY KEY);
SELECT AddGeometryColumn('comuni', 'Geometry', 4326, 'MULTIPOLYGON', 'XY');

INSERT INTO comuni
SELECT name, Geometry
  FROM (
        SELECT name, SetSRID(GeomFromGeoJson(
                json_extract(data, '$.geometry')
            ), 4326) AS Geometry
          FROM fsdir('output')
         WHERE name LIKE '%/poly/comuni/%.geojson'
);

SELECT CreateTopology('topology', 4326, 0, 0);
SELECT TopoGeo_FromGeoTable('topology', NULL, 'comuni', 'Geometry');

SELECT ST_ValidateTopoGeo('topology');
SELECT * FROM TEMP.topology_validate_topogeo;
SELECT TopoGeo_UpdateSeeds('topology');

SELECT TopoGeo_ToGeoTableGeneralize('topology', NULL, 'comuni', 'Geometry', 'comuni_simplified_100m', 0.001);

SELECT TopoGeo_ToGeoTable('topology', NULL, 'comuni', 'Geometry', 'comuni_from_topo');
```

Alternative solution:

```sh
find . -name '*.geojson' -path '*/poly/comuni/*' -type f |
    xargs -L1 -I% -d '\n' cat "%" |
    jq -cs '{"type":"FeatureCollection", "features":.}' > comuni.geojson

npm install -g topojson
export PATH="$PATH:$HOME/.nvm/versions/node/*/bin/"

geo2topo comuni.geojson |
    toposimplify -s 10 - |
    topo2geo -i - comuni
mv comuni comuni-simplified.geojson
```
