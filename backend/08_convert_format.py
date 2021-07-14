#!/usr/bin/python2
#

import os

WORK_DIR = os.environ.get('WORK_DIR')

type = ['poly','bbox']
place = ['regioni','province','comuni']
folder_output = "%s/output/dati/" % (WORK_DIR)
file_script_base = "%s/output/scripts/convert_" % (WORK_DIR)

def crea_script (type,place):
  #print type,' - ',place
  folder_dati = folder_output + type + '/' + place + '/pbf/'
  file_script = file_script_base + place + '_' + type + '.sh'
  print folder_dati
  print file_script
  out_file = open(file_script, 'w')
  out_file.write('#!/bin/bash\n#\n\n')

  for file in sorted(os.listdir(folder_dati)):
    if file.endswith('.pbf'):
      print(os.path.join(folder_dati, file))
      print(file)
      out_file.write('echo\necho "'+file+'"\n')
      #nomefile,osm,ext = file.split('.')
      nomefile = file[:len(file)-8]

      ###### shapefile
      #string = 'ogr2ogr -overwrite -f "ESRI Shapefile" "../dati/' + type + '/'+ place + '/shapefile/' + nomefile + '" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress points lines multilinestrings multipolygons;\n'
      #out_file.write(string)

      ##### sqlite
      #string = 'ogr2ogr -overwrite -f SQLite -dsco SPATIALITE=YES -dsco METADATA=YES  "../dati/' + type + '/'+ place + '/sqlite/' + nomefile + '.sqlite" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress;\n'
      #out_file.write(string)

      # geojson
      #string = 'ogr2ogr -overwrite -f GeoJSON -lco RFC7946=YES "../dati/' + type + '/'+ place + '/geojson/' + nomefile + '_points.json" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress points;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f GeoJSON -lco RFC7946=YES "../dati/' + type + '/'+ place + '/geojson/' + nomefile + '_lines.json" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress lines;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f GeoJSON -lco RFC7946=YES "../dati/' + type + '/'+ place + '/geojson/' + nomefile + '_multilinestrings.json" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress multilinestrings;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f GeoJSON -lco RFC7946=YES "../dati/' + type + '/'+ place + '/geojson/' + nomefile + '_multipolygons.json" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress multipolygons;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f GeoJSON -lco RFC7946=YES "../dati/' + type + '/'+ place + '/geojson/' + nomefile + '_other_relations.json" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress other_relations;\n'
      #out_file.write(string)

      ##### geopackage
      string = 'ogr2ogr -overwrite -f GPKG -dsco VERSION=1.2 "../dati/' + type + '/'+ place + '/geopackage/' + nomefile + '.gpkg" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress\n'
      out_file.write(string)

      ###### csv
      #string = 'ogr2ogr -overwrite -f CSV -lco GEOMETRY=AS_WKT "../dati/' + type + '/'+ place + '/csv/' + nomefile + '" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress points;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f CSV -lco GEOMETRY=AS_WKT "../dati/' + type + '/'+ place + '/csv/' + nomefile + '" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress lines;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f CSV -lco GEOMETRY=AS_WKT "../dati/' + type + '/'+ place + '/csv/' + nomefile + '" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress multilinestrings;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f CSV -lco GEOMETRY=AS_WKT "../dati/' + type + '/'+ place + '/csv/' + nomefile + '" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress multipolygons;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f CSV -lco GEOMETRY=AS_WKT "../dati/' + type + '/'+ place + '/csv/' + nomefile + '" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress other_relations;\n'
      #out_file.write(string)

      ###### KML
      #string = 'ogr2ogr -overwrite -f KML "../dati/' + type + '/'+ place + '/kml/' + nomefile + '_points.kml" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress points;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f KML "../dati/' + type + '/'+ place + '/kml/' + nomefile + '_lines.kml" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress lines;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f KML "../dati/' + type + '/'+ place + '/kml/' + nomefile + '_multilinestrings.kml" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress multilinestrings;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f KML "../dati/' + type + '/'+ place + '/kml/' + nomefile + '_multipolygons.kml" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress multipolygons;\n'
      #out_file.write(string)
      #string = 'ogr2ogr -overwrite -f KML "../dati/' + type + '/'+ place + '/kml/' + nomefile + '_other_relations.kml" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress other_relations;\n'
      #out_file.write(string)


  out_file.write('\n\n')
  out_file.close()



for ty_item in type:
  #print ty_item
  for pl_item in place:
    #print '\t',pl_item
    crea_script(ty_item,pl_item)

print "Finito !!\n"
#

