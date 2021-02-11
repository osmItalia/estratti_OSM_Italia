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

Add properties:

```
(
find . -name '*.geojson' -path '*/poly/regioni/*' -type f |
while read file_path
do
    title=$(basename "$file_path" .geojson)
    jq -c \
        --arg ric "${title%_*}" \
        --arg rn "${title##*_}" \
        '.properties |= [{"ente": "regione", "reg_istat_code": $ric, "reg_name": $rn}]' "$file_path"
done
find . -name '*.geojson' -path '*/poly/province/*' -type f |
while read file_path
do
    title=$(basename "$t" .geojson)
    jq -c \
        --arg pic "${title%_*}" \
        --arg pn "${title##*_}" \
        '.properties |= [{"ente": "provincia", "prov_istat_code": $pic, "prov_name": $pn}]' "$file_path"
done
find . -name '*.geojson' -path '*/poly/comuni/*' -type f |
while read file_path
do
    title=$(basename "$t" .geojson)
    jq -c \
        --arg name "${title##*_}" \
        '.properties |= [{"ente": "comune", "name": $name}]' "$file_path"
done
) |
jq -cs |
geo2topo comuni.geojson |
    toposimplify -s 10 - | gzip > confini.json
```

Final solution: see gen-topojson.sh

How to recreate the boundaries table from the files (inverse procedure):

```
psql -qAtX "$conn_str" -c "create table boundaries (id_adm int, id_osm int, name text, istat text primary key, id_parent_istat text, geojson jsonb);"
for file in topojson/limits_IT_regions.json topojson/limits_{P,R}_*.json
do
    level=$(echo "$file" | cut -d_ -f 4)
    if [ "$level" = "municipalities" ]
    then
        level="8"
    elif [ "$level" = "provinces" ]
    then
        level="6"
    else
        level="4"
    fi
    parent=$(echo "$file" | cut -d_ -f 3)
    if [ "$parent" = "regions.json" ]
    then
        parent=""
    fi
    jq -rc '.objects[].geometries[].properties | with_entries( select(.key | startswith(".") | not) )' "$file" |
        while read line
        do
            istat=$(jq -r .istat <<< "$line")
            geojson=$(jq -rc '.' /srv/estratti/output/boundaries/poly/*/${istat}_*.geojson)
            csv=$(jq -rc '. | [to_entries[].value] | @tsv' <<< "$line")
            echo -e "$csv\t$parent\t$geojson"
        done | psql -qAtX "$conn_str" -c "\copy boundaries FROM STDIN WITH CSV DELIMITER E'\t' QUOTE '@'"
done
```

Fake provinces:

```
insert INTO boundaries (select 6 as id_adm, p.id_osm, p.name, substring(b.istat, 0, 4) as istat, p.istat, p.geojson from boundaries b join boundaries p on b.id_parent_istat = p.istat where p.istat = '02' limit 1);
update boundaries set id_parent_istat = substring(istat, 0, 4) where id_adm = 8 and id_parent_istat = '02';

insert INTO boundaries (select 6 as id_adm, p.id_osm, p.name, substring(b.istat, 0, 4) as istat, p.istat, p.geojson from boundaries b join boundaries p on b.id_parent_istat = p.istat where p.istat = '06' limit 1);
update boundaries set id_parent_istat = substring(istat, 0, 4) where id_adm = 8 and id_parent_istat = '06';
```

Additional setup that could be required on WM servers to run npm:

```
sudo aptitude install npm # select second option
npm install n -g
export PATH="/usr/local/bin/:$PATH"
```
