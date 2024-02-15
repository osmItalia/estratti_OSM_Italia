.load mod_spatialite

select writefile(
          (
            case admin_level
            when '4' then 'regioni'
            when '6' then 'province'
            when '8' then 'comuni'
            end
          ) || '/' || filename || '.geojson',
          json_object(
            'type', 'Feature',
            'geometry', json(asgeojson(geometry))
          )
      )
 from boundaries
;
