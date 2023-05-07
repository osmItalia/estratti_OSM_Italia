#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

WORK_DIR = os.environ.get('WORK_DIR')

type = ['poly']
place = ['regioni','province','comuni']
folder_output = "%s/output/dati/" % (WORK_DIR)
file_script_base = "%s/output/scripts/convert_" % (WORK_DIR)

def crea_script (type,place):
  folder_dati = folder_output + type + '/' + place + '/pbf/'
  file_script = file_script_base + place + '_' + type + '.sh'
  print(folder_dati)
  print(file_script)
  out_file = open(file_script, 'w')
  out_file.write('#!/bin/bash\n#\n\n')

  for file in sorted(os.listdir(folder_dati)):
    if file.endswith('.pbf'):
      print(os.path.join(folder_dati, file))
      print(file)
      out_file.write('echo\necho "'+file+'"\n')
      nomefile = file[:len(file)-8]
      string = 'ogr2ogr -overwrite -f GPKG -dsco VERSION=1.2 "../dati/' + type + '/'+ place + '/geopackage/' + nomefile + '.gpkg" ' + '"../dati/' + type + '/'+ place + '/pbf/' + file + '" -progress\n'
      out_file.write(string)

  out_file.write('\n\n')
  out_file.close()

for ty_item in type:
  for pl_item in place:
    crea_script(ty_item,pl_item)

print("Finito !!\n")

