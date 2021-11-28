#!/bin/bash

set -exuo pipefail

conn_str="postgres://osm:osm@127.0.0.1/osm"
basedir="/srv/estratti/output"

psql_custom="psql -qAtX $conn_str -v ON_ERROR_STOP=1 -1"

### Match entires - files and generate fake provinces

# Convert poly files to geojson

cd "$basedir"

find 'boundaries/poly' -name '[0-9]*_*.poly' -type f |
    xargs -L1 -I% -d '\n' sh -c \
    'poly2geojson < "%" > $(dirname "%")/$(basename "%" .poly).geojson'

# Prepare tables

cat << EOF | $psql_custom
drop materialized view if exists files_agg;
drop table if exists files;
create table files (istat varchar, extension varchar, path varchar);
drop table if exists boundaries_geojson;
create table boundaries_geojson (istat varchar, path varchar);
EOF

# Populate the boundaries_geojson table

find 'boundaries/poly' -type f -name '*.geojson' |
while read path
do
    filename=$(basename "$path")
    istat=${filename%%_*}
    echo "$istat;\"$(readlink -f $path)\""
done | $psql_custom -c "\copy boundaries_geojson FROM STDIN WITH CSV DELIMITER ';' QUOTE '\"'"

# Add id_parent_istat column

cat << EOF | $psql_custom
alter table boundaries drop column if exists id_parent_istat;
alter table boundaries add id_parent_istat varchar(8);
update boundaries as b
  set id_parent_istat = (
     select istat
       from boundaries as p
      where b.id_parent = p.id_osm);
EOF

# Create fake provinces
cat <<EOF | $psql_custom
-- Valle d'Aosta
delete from boundaries
 where id_adm = 6 and id_parent_istat = '02';
insert into boundaries (
    id_adm,
    id_osm,
    name,
    istat,
    id_parent_istat,
    geojson
  )
  (select 6,
          NULL,
          name,
          '007',
          istat,
          geojson
     from boundaries
    where istat = '02' limit 1);
update boundaries
   set id_parent_istat = '007'
 where id_adm = 8 and id_parent_istat = '02';
-- Friuli Venezia Giulia
delete from boundaries
 where id_adm = 6 and id_parent_istat = '06';
insert into boundaries (
    id_adm,
    id_osm,
    name,
    istat,
    id_parent_istat,
    geojson
  )
  (select 6,
          NULL,
          name,
          '032',
          istat,
          geojson
     from boundaries
    where istat = '06' limit 1);
update boundaries
   set id_parent_istat = '032'
 where id_adm = 8 and id_parent_istat = '06';
EOF

# Populate the files table

find 'dati/poly' -type f -not -name '*.log' |
while read path
do
    filename=$(basename "$path")
    istat=${filename%%_*}
    extension=".${filename#*.}"
    echo "$istat;$extension;\"$path\""
    if [ "$istat" = "02" ] # Valle d'Aosta
    then
        echo "007;$extension;\"$path\""
    elif [ "$istat" = "06" ] # Friuli-Venezia-Giulia
    then
        echo "032;$extension;\"$path\""
    fi
done | $psql_custom -c "\copy files FROM STDIN WITH CSV DELIMITER ';'"

$psql_custom -c "create materialized view files_agg as (select istat, jsonb_object_agg(extension, path) as downloads from files where istat <> '' group by istat);"

cd -

### Generate the limits_°.json files

# Prepare tables

cat << EOF | $psql_custom
alter table boundaries alter column geojson type jsonb using geojson::jsonb;
EOF

# Generate regions

cat << EOF | $psql_custom | mapshaper -i - -simplify 0.005 -o limits_IT_regions.json
select jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(jsonb_build_object(
            'type', 'Feature',
            'geometry', jsonb_build_object(
                'type', 'Polygon',
                'coordinates', geojson -> 'geometries' -> 0 -> 'coordinates'
            ),
            'properties', jsonb_build_object(
                'name', name,
                'osm', id_osm,
                'istat', istat,
                'reg_istat_code', istat,
                'adm', id_adm) || f.downloads)))
  from boundaries b
  left join files_agg f using (istat)
 where b.id_adm = 4
 group by true;
EOF

geo2topo limits_IT_regions.json -o limits_IT_regions_topo.json
mv limits_IT_regions{_topo,}.json


# Generate provinces

cat << EOF | $psql_custom | mapshaper -i - -simplify 0.005 -o limits_IT_provinces.json
select jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(jsonb_build_object(
            'type', 'Feature',
            'geometry', jsonb_build_object(
                'type', 'Polygon',
                'coordinates', geojson -> 'geometries' -> 0 -> 'coordinates'
            ),
            'properties', jsonb_build_object(
                'name', b.name,
                'osm', b.id_osm,
                'istat', b.istat,
                'prov_istat_code', b.istat,
                'reg_istat_code', b.id_parent_istat,
                'adm', b.id_adm) || f.downloads)))
  from boundaries b
  left join files_agg f using (istat)
 where b.id_adm = 6
 group by true;
EOF

geo2topo limits_IT_provinces.json -o limits_IT_provinces_topo.json
mv limits_IT_provinces{_topo,}.json


# Generate municipalities

cat << EOF | $psql_custom | mapshaper -i - -simplify 0.005 -o limits_IT_municipalities.json
select jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(jsonb_build_object(
            'type', 'Feature',
            'geometry', jsonb_build_object(
                'type', 'Polygon',
                'coordinates', b.geojson -> 'geometries' -> 0 -> 'coordinates'
            ),
            'properties', jsonb_build_object(
                'name', b.name,
                'osm', b.id_osm,
                'istat', b.istat,
                'com_istat_code', b.istat,
                'prov_istat_code', b.id_parent_istat,
                'reg_istat_code', p.id_parent_istat,
                'adm', b.id_adm) || f.downloads)))
  from boundaries b
  left join files_agg f using (istat)
  join boundaries p
    on b.id_parent_istat = p.istat
 where b.id_adm = 8
 group by true;
EOF

geo2topo limits_IT_municipalities.json -o limits_IT_municipalities_topo.json
mv limits_IT_municipalities{_topo,}.json


# Generate provinces for each region

(cat << EOF | $psql_custom
select distinct p.istat
  from boundaries b
  join boundaries p
    on b.id_parent_istat = p.istat
 where b.id_adm = 6 and p.id_adm = 4;
EOF
) |
while read istat
do
    cat << EOF | $psql_custom | mapshaper -i - -simplify 0.005 -o limits_R_${istat}_provinces.json
        select jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(jsonb_build_object(
                'type', 'Feature',
                'geometry', jsonb_build_object(
                    'type', 'Polygon',
                    'coordinates', b.geojson -> 'geometries' -> 0 -> 'coordinates'
                ),
                'properties', jsonb_build_object(
                    'name', b.name,
                    'osm', b.id_osm,
                    'istat', b.istat,
                    'prov_istat_code', b.istat,
                    'reg_istat_code', p.istat,
                    'adm', b.id_adm) || f.downloads)))
      from boundaries b
      left join files_agg f using (istat)
      join boundaries p
        on b.id_parent_istat = p.istat
     where p.istat = '$istat'
     group by true;
EOF
    geo2topo limits_R_${istat}_provinces.json -o limits_R_${istat}_provinces_topo.json
    mv limits_R_${istat}_provinces{_topo,}.json
done


# Generate municipalities for each province

(cat << EOF | $psql_custom
select distinct p.istat
  from boundaries b
  join boundaries p
    on b.id_parent_istat = p.istat
 where b.id_adm = 8 and p.id_adm = 6;
EOF
) |
while read istat
do
    cat << EOF | $psql_custom | mapshaper -i - -simplify 5% -o limits_P_${istat}_municipalities.json
        select jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(jsonb_build_object(
                'type', 'Feature',
                'geometry', jsonb_build_object(
                    'type', 'Polygon',
                    'coordinates', b.geojson -> 'geometries' -> 0 -> 'coordinates'
                ),
                'properties', jsonb_build_object(
                    'name', b.name,
                    'osm', b.id_osm,
                    'istat', b.istat,
                    'com_istat_code', b.istat,
                    'prov_istat_code', p.istat,
                    'reg_istat_code', p.id_parent_istat,
                    'adm', b.id_adm) || f.downloads)))
      from boundaries b
      left join files_agg f using (istat)
      join boundaries p
        on b.id_parent_istat = p.istat
     where b.id_adm = 8 and p.id_adm = 6
       and p.istat = '$istat'
     group by true;
EOF
    geo2topo limits_P_${istat}_municipalities.json -o limits_P_${istat}_municipalities_topo.json
    mv limits_P_${istat}_municipalities{_topo,}.json
done
