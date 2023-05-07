#!/bin/bash

set -eExuo pipefail

OUTPUT=""$WORK_DIR"/output"
PATH=""$NPM_PREFIX"/node_modules/.bin/:$PATH"
sqlite_custom="sqlite3 -bail "$OUTPUT/boundaries.sqlite""

cd ""$OUTPUT"/boundaries/poly"

# Generate regions

cat << EOF | $sqlite_custom | mapshaper -i - -simplify 0.005 -o limits_IT_regions.json
.load mod_spatialite
select json_object(
         'type', 'FeatureCollection',
         'features', json_group_array(json_object(
            'type', 'Feature',
            'geometry', json(asgeojson(geometry)),
            'properties', json_object(
                'name', name,
                'osm', osm,
                'istat', ref_istat,
                'reg_istat_code', reg_istat_code,
                'adm', admin_level,
                '.osm.pbf', 'dati/poly/regioni/pbf/' || filename || '.osm.pbf',
                '.gpkg', 'dati/poly/regioni/gpkg/' || filename || '.gpkg',
                '.obf', 'dati/poly/regioni/obf/' || filename || '.obf'
             )
         ))
       )
  from boundaries
 where admin_level = 4
 group by true;
EOF

geo2topo limits_IT_regions.json -o limits_IT_regions_topo.json
mv limits_IT_regions{_topo,}.json

# Generate provinces

cat << EOF | $sqlite_custom | mapshaper -i - -simplify 0.005 -o limits_IT_provinces.json
.load mod_spatialite
select json_object(
         'type', 'FeatureCollection',
         'features', json_group_array(json_object(
            'type', 'Feature',
            'geometry', json(asgeojson(geometry)),
            'properties', json_object(
                'name', name,
                'osm', osm,
                'istat', ref_istat,
                'reg_istat_code', reg_istat_code,
                'prov_istat_code', pro_istat_code,
                'adm', admin_level,
                '.osm.pbf', 'dati/poly/province/pbf/' || filename || '.osm.pbf',
                '.gpkg', 'dati/poly/province/gpkg/' || filename || '.gpkg'
             )
         ))
       )
  from boundaries
 where admin_level = 6
 group by true;
EOF

geo2topo limits_IT_provinces.json -o limits_IT_provinces_topo.json
mv limits_IT_provinces{_topo,}.json


# Generate municipalities

cat << EOF | $sqlite_custom |  mapshaper -i - -simplify 0.005 -o limits_IT_municipalities.json
.load mod_spatialite
select json_object(
         'type', 'FeatureCollection',
         'features', json_group_array(json_object(
            'type', 'Feature',
            'geometry', json(asgeojson(geometry)),
            'properties', json_object(
                'name', name,
                'osm', osm,
                'istat', ref_istat,
                'reg_istat_code', reg_istat_code,
                'prov_istat_code', pro_istat_code,
                'com_istat_code', com_istat_code,
                'adm', admin_level,
                '.osm.pbf', 'dati/poly/comuni/pbf/' || filename || '.osm.pbf',
                '.gpkg', 'dati/poly/comuni/gpkg/' || filename || '.gpkg'
             )
         ))
       )
  from boundaries
 where admin_level = 8
 group by true;
EOF

geo2topo limits_IT_municipalities.json -o limits_IT_municipalities_topo.json
mv limits_IT_municipalities{_topo,}.json


# Generate provinces for each region

(cat << EOF | $sqlite_custom
select ref_istat
  from boundaries
 where admin_level = 4;
EOF
) |
while read istat
do
    cat << EOF | $sqlite_custom | mapshaper -i - -simplify 0.005 -o limits_R_${istat}_provinces.json
.load mod_spatialite
select json_object(
         'type', 'FeatureCollection',
         'features', json_group_array(json_object(
            'type', 'Feature',
            'geometry', json(asgeojson(geometry)),
            'properties', json_object(
                'name', name,
                'osm', osm,
                'istat', ref_istat,
                'reg_istat_code', reg_istat_code,
                'prov_istat_code', pro_istat_code,
                'adm', admin_level,
                '.osm.pbf', 'dati/poly/province/pbf/' || filename || '.osm.pbf',
                '.gpkg', 'dati/poly/province/gpkg/' || filename || '.gpkg'
             )
         ))
       )
  from boundaries
 where reg_istat_code = '$istat' and admin_level = 6
 group by true;
EOF
    geo2topo limits_R_${istat}_provinces.json -o limits_R_${istat}_provinces_topo.json
    mv limits_R_${istat}_provinces{_topo,}.json
done


# Generate municipalities for each province

(cat << EOF | $sqlite_custom
select ref_istat
  from boundaries
 where admin_level = 6;
EOF
) |
while read istat
do
    cat << EOF | $sqlite_custom | mapshaper -i - -simplify 5% -o limits_P_${istat}_municipalities.json
.load mod_spatialite
select json_object(
         'type', 'FeatureCollection',
         'features', json_group_array(json_object(
            'type', 'Feature',
            'geometry', json(asgeojson(geometry)),
            'properties', json_object(
                'name', name,
                'osm', osm,
                'istat', ref_istat,
                'reg_istat_code', reg_istat_code,
                'prov_istat_code', pro_istat_code,
                'adm', admin_level,
                '.osm.pbf', 'dati/poly/comuni/pbf/' || filename || '.osm.pbf',
                '.gpkg', 'dati/poly/comuni/gpkg/' || filename || '.gpkg'
             )
         ))
       )
  from boundaries
 where pro_istat_code = '$istat' and admin_level = 8
 group by true;
EOF
    geo2topo limits_P_${istat}_municipalities.json -o limits_P_${istat}_municipalities_topo.json
    mv limits_P_${istat}_municipalities{_topo,}.json
done
