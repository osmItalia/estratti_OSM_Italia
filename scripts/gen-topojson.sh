#!/bin/bash

set -ex

conn_str="postgres://osm:osm@127.0.0.1/osm"
basedir="/srv/estratti/output"

# Match entires - files

cd "$basedir"

find 'boundaries/poly' -name '[0-9]*_*.poly' -type f |
    xargs -L1 -I% -d '\n' sh -c \
    'poly2geojson < "%" > $(dirname "%")/$(basename "%" .poly).geojson'

cat << EOF | psql -qAtX "$conn_str"
drop materialized view if exists files_agg;
drop table if exists files;
create table files (istat varchar, extension varchar, path varchar);
--drop table if exists boundaries_geojson;
--create table boundaries_geojson (istat varchar, path varchar);
EOF

#find 'boundaries/poly' -type f -name '*.geojson' |
#while read path
#do
#    filename=$(basename "$path")
#    istat=${filename%%_*}
#    echo "$istat;\"$(readlink -f $path)\""
#done | psql -qAtX "$conn_str" -c "\copy boundaries_geojson FROM STDIN WITH CSV #DELIMITER ';' QUOTE '\"'"

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
    elif [ "$istat" = "06" ] # Valle d'Aosta
    then
        echo "030;$extension;\"$path\""
    fi
done | psql -qAtX "$conn_str" -c "\copy files FROM STDIN WITH CSV DELIMITER ';'"

psql -qAtX "$conn_str" -c "create materialized view files_agg as (select istat, jsonb_object_agg(extension, path) as downloads from files where istat <> '' group by istat);"

cd -

# Generate regions

cat << EOF | psql -qAtX "$conn_str" | mapshaper -i - -simplify 0.005 -o limits_IT_regions.json
select jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(jsonb_build_object(
            'type', geojson -> 'type',
            'geometry', geojson -> 'geometry',
            'properties', jsonb_build_object(
                'name', name,
                'osm', id_osm,
                'istat', istat,
                'reg_istat_code', istat,
                'adm', id_adm) || f.downloads)))
  from boundaries b
  join files_agg f using (istat)
 where b.id_adm = 4
 group by true;
EOF

geo2topo limits_IT_regions.json -o limits_IT_regions_topo.json
mv limits_IT_regions{_topo,}.json


# Generate provinces

cat << EOF | psql -qAtX "$conn_str" | mapshaper -i - -simplify 0.005 -o limits_IT_provinces.json
select jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(jsonb_build_object(
            'type', geojson -> 'type',
            'geometry', geojson -> 'geometry',
            'properties', jsonb_build_object(
                'name', b.name,
                'osm', b.id_osm,
                'istat', b.istat,
                'prov_istat_code', b.istat,
                'reg_istat_code', b.id_parent_istat,
                'adm', b.id_adm) || f.downloads)))
  from boundaries b
  join files_agg f using (istat)
 where b.id_adm = 6
 group by true;
EOF

geo2topo limits_IT_provinces.json -o limits_IT_provinces_topo.json
mv limits_IT_provinces{_topo,}.json


# Generate municipalities

cat << EOF | psql -qAtX "$conn_str" | mapshaper -i - -simplify 0.005 -o limits_IT_municipalities.json
select jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(jsonb_build_object(
            'type', b.geojson -> 'type',
            'geometry', b.geojson -> 'geometry',
            'properties', jsonb_build_object(
                'name', b.name,
                'osm', b.id_osm,
                'istat', b.istat,
                'com_istat_code', b.istat,
                'prov_istat_code', b.id_parent_istat,
                'reg_istat_code', p.id_parent_istat,
                'adm', b.id_adm) || f.downloads)))
  from boundaries b
  join files_agg f using (istat)
  join boundaries p
    on b.id_parent_istat = p.istat
 where b.id_adm = 8
 group by true;
EOF

geo2topo limits_IT_municipalities.json -o limits_IT_municipalities_topo.json
mv limits_IT_municipalities{_topo,}.json


# Generate provinces for each region

(cat << EOF | psql -qAtX "$conn_str"
select distinct p.istat
  from boundaries b
  join boundaries p
    on b.id_parent_istat = p.istat
 where b.id_adm = 6 and p.id_adm = 4;
EOF
) |
while read istat
do
    cat << EOF | psql -qAtX "$conn_str" | mapshaper -i - -simplify 0.005 -o limits_R_${istat}_provinces.json
        select jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(jsonb_build_object(
                'type', b.geojson -> 'type',
                'geometry', b.geojson -> 'geometry',
                'properties', jsonb_build_object(
                    'name', b.name,
                    'osm', b.id_osm,
                    'istat', b.istat,
                    'prov_istat_code', b.istat,
                    'reg_istat_code', p.istat,
                    'adm', b.id_adm) || f.downloads)))
      from boundaries b
      join files_agg f using (istat)
      join boundaries p
        on b.id_parent_istat = p.istat
     where p.istat = '$istat'
     group by true;
EOF
    geo2topo limits_R_${istat}_provinces.json -o limits_R_${istat}_provinces_topo.json
    mv limits_R_${istat}_provinces{_topo,}.json
done


# Generate municipalities for each province

(cat << EOF | psql -qAtX "$conn_str"
select distinct p.istat
  from boundaries b
  join boundaries p
    on b.id_parent_istat = p.istat
 where b.id_adm = 8 and p.id_adm = 6;
EOF
) |
while read istat
do
    cat << EOF | psql -qAtX "$conn_str" | mapshaper -i - -simplify 5% -o limits_P_${istat}_municipalities.json
        select jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(jsonb_build_object(
                'type', b.geojson -> 'type',
                'geometry', b.geojson -> 'geometry',
                'properties', jsonb_build_object(
                    'name', b.name,
                    'osm', b.id_osm,
                    'istat', b.istat,
                    'com_istat_code', b.istat,
                    'prov_istat_code', p.istat,
                    'reg_istat_code', p.id_parent_istat,
                    'adm', b.id_adm) || f.downloads)))
      from boundaries b
      join files_agg f using (istat)
      join boundaries p
        on b.id_parent_istat = p.istat
     where b.id_adm = 8 and p.id_adm = 6
       and p.istat = '$istat'
     group by true;
EOF
    geo2topo limits_P_${istat}_municipalities.json -o limits_P_${istat}_municipalities_topo.json
    mv limits_P_${istat}_municipalities{_topo,}.json
done
