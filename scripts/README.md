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

Final solution:

```
(set -ex
conn_str="postgres://osm:osm@127.0.0.1/osm"
basedir="/srv/estratti/output/dati/poly"

(cd "$basedir"

cat << EOF | psql -qAtX "$conn_str"
drop materialized view if exists files_agg;
drop table if exists files;
create table files (istat varchar, extension varchar, path varchar);
EOF

find . -type f -not -name '*.log' | cut -b3- |
while read path
do
    filename=$(basename "$path")
    istat=${filename%%_*}
    extension=".${filename#*.}"
    echo "$istat;$extension;$path"
done | psql -qAtX "$conn_str" -c "\copy files FROM STDIN WITH DELIMITER ';'"

psql -qAtX "$conn_str" -c "create materialized view files_agg as (select istat, jsonb_object_agg(extension, path) as downloads from files where istat <> '' group by istat);"
)


# generate regions
cat << EOF | psql -qAtX "$conn_str" | geo2topo | toposimplify -s 1 - > limits_IT_regions.json
select jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(jsonb_build_object(
            'type', 'feature',
            'geometry', b.geojson::jsonb -> 'geometries' -> 0,
            'properties', jsonb_build_object(
                'name', b.name,
                'osm', b.id_osm,
                'istat', b.istat,
                'adm', b.id_adm))))
  from boundaries b
 where b.id_adm = 4
 group by true;
EOF

# generate provinces for each region
(cat << EOF | psql -qAtX "$conn_str"
select distinct p.istat
  from boundaries b
  join boundaries p
    on b.id_parent = p.id_osm
 where b.id_adm = 6 and p.id_adm = 4;
EOF
) |
while read istat
do
    cat << EOF | psql -qAtX "$conn_str" | geo2topo | toposimplify -s 1 - > limits_R_${istat}_provinces.json
        select jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(jsonb_build_object(
                'type', 'feature',
                'geometry', b.geojson::jsonb -> 'geometries' -> 0,
                'properties', jsonb_build_object(
                    'name', b.name,
                    'osm', b.id_osm,
                    'istat', b.istat,
                    'adm', b.id_adm,
                    'parent_name', p.name,
                    'parent_osm', p.id_osm,
                    'parent_istat', p.istat,
                    'parent_adm', p.id_adm) || f.downloads)))
      from boundaries b
      join boundaries p
        on b.id_parent = p.id_osm
      join files_agg f
        on b.istat = f.istat
     where b.id_adm = 6 and p.id_adm = 4
       and p.istat::int = '$istat'::int
     group by true;
EOF
done

# generate municipalities for each province
(cat << EOF | psql -qAtX "$conn_str"
select distinct p.istat
  from boundaries b
  join boundaries p
    on b.id_parent = p.id_osm
 where b.id_adm = 8 and p.id_adm = 6;
EOF
) |
while read istat
do
    cat << EOF | psql -qAtX "$conn_str" | geo2topo | toposimplify -s 1 - > limits_P_${istat}_municipalities.json
        select jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(jsonb_build_object(
                'type', 'feature',
                'geometry', b.geojson::jsonb -> 'geometries' -> 0,
                'properties', jsonb_build_object(
                    'name', b.name,
                    'osm', b.id_osm,
                    'istat', b.istat,
                    'adm', b.id_adm,
                    'parent_name', p.name,
                    'parent_osm', p.id_osm,
                    'parent_istat', p.istat,
                    'parent_adm', p.id_adm) || f.downloads)))
      from boundaries b
      join boundaries p
        on b.id_parent = p.id_osm
      join files_agg f
        on b.istat = f.istat
     where b.id_adm = 8 and p.id_adm = 6
       and p.istat::int = '$istat'::int
     group by true;
EOF
done

# generate municipalities for each region without provinces
(cat << EOF | psql -qAtX "$conn_str"
select distinct p.istat
  from boundaries b
  join boundaries p
    on b.id_parent = p.id_osm
 where b.id_adm = 8 and p.id_adm = 4;
EOF
) |
while read istat
do
    cat << EOF | psql -qAtX "$conn_str" | geo2topo | toposimplify -s 1 - > limits_R_${istat}_municipalities.json
        select jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(jsonb_build_object(
                'type', 'feature',
                'geometry', b.geojson::jsonb -> 'geometries' -> 0,
                'properties', jsonb_build_object(
                    'name', b.name,
                    'osm', b.id_osm,
                    'istat', b.istat,
                    'adm', b.id_adm,
                    'parent_name', p.name,
                    'parent_osm', p.id_osm,
                    'parent_istat', p.istat,
                    'parent_adm', p.id_adm) || f.downloads)))
      from boundaries b
      join boundaries p
        on b.id_parent = p.id_osm
      join files_agg f
        on b.istat = f.istat
     where b.id_adm = 8 and p.id_adm = 4
       and p.istat::int = '$istat'::int
     group by true;
EOF
done
)
```
