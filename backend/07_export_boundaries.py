#!/usr/bin/python2
# -*- coding: utf-8 -*-

import psycopg2
import codecs
import os

HOST = os.getenv('PGHOST')
DB = os.getenv('PGDATABASE')
USER = os.getenv('PGUSER')
PASSWORD = os.environ.get('PGPASSWORD')
WORK_DIR = os.environ.get('WORK_DIR')

connstring = "host=%s dbname=%s user=%s password=%s" % (HOST,DB,USER,PASSWORD)
conn = psycopg2.connect(connstring)
cur = conn.cursor()


##### polygons 
def create_poly():
  folder_base = "%s/output/boundaries/poly/" % (WORK_DIR)
  folder = folder_base

  print('Create polygons files')
  a_admincode = [2,4,6,8]
  for adm in a_admincode:
    #print adm
    if adm == 4:
      folder = folder_base + "regioni/"
    elif adm == 6:
      folder = folder_base + "province/"
    elif adm == 8:
      folder = folder_base + "comuni/"
    cur.execute("""SELECT id_osm, name, istat, poly FROM public.boundaries WHERE id_adm=%s AND flag=TRUE AND poly<>'';""",(adm,))
    rows = cur.fetchall()
    if len(rows) > 0:
      for row in rows: 
        (id_osm, name, istat, poly) = row
        string = folder + istat + "_" + name.decode('utf8').replace('/','-') + ".poly"
        out_file = open(string, 'w')
        #print id_osm, name, istat
        out_file.write(poly)
        out_file.close()
    #cur.execute("""SELECT id_osm, name, istat, geojson FROM public.boundaries WHERE id_adm=%s AND flag=TRUE AND geojson<>'';""",(adm,))
    #rows = cur.fetchall()
    #if len(rows) > 0:
    #  for row in rows: 
    #    (id_osm, name, istat, geojson) = row
    #    string = folder + istat + "_" + name.decode('utf8').replace('/','-') + ".geojson"
    #    out_file = open(string, 'w')
    #    #print id_osm, name, istat
    #    out_file.write(geojson)
    #    out_file.close()

def create_script_poly():
  folder_base = "%s/output/scripts/" % (WORK_DIR)
  folder = folder_base
  folder_osm = "%s/input/pbf/italy-latest.osm.pbf" % (WORK_DIR)
  folder_poly = "%s/output/boundaries/poly/" % (WORK_DIR)
  folder_data = "%s/output/dati/poly/" % (WORK_DIR)

  print('Create script poly')
  a_admincode = [2,4,6,8]
  for adm in a_admincode:
    #print adm
    if adm == 2:
      path_poly = "../boundaries/poly/"
      path_data = "../dati/poly/"
      string = folder + "nazioni_poly.sh"
      string_gj = folder + "nazioni_geojson.sh"
    elif adm == 4:
      path_poly = "../boundaries/poly/regioni/"
      path_data = "../dati/poly/regioni/pbf/"
      string = folder + "regioni_poly.sh"
      string_gj = folder + "regioni_geojson.sh"
      folder_poly_loc = folder_poly + "regioni/"
      folder_data_loc = folder_data + "regioni/pbf/"
    elif adm == 6:
      path_poly = "../boundaries/poly/province/"
      path_data = "../dati/poly/province/pbf/"
      path_data_par = "../dati/poly/regioni/pbf/"
      string = folder + "province_poly.sh"
      string_gj = folder + "province_geojson.sh"
      folder_poly_loc = folder_poly + "province/"
      folder_data_loc = folder_data + "province/pbf/"
    elif adm ==8:
      path_poly = "../boundaries/poly/comuni/"
      path_data = "../dati/poly/comuni/pbf/"
      path_data_par = "../dati/poly/province/pbf/"
      string = folder + "comuni_poly.sh"
      string_gj = folder + "comuni_geojson.sh"
      folder_poly_loc = folder_poly + "comuni/"
      folder_data_loc = folder_data + "comuni/pbf/"
    #file_out = open(string, 'w')
    file_out = codecs.open(string, 'w', encoding='utf8')
    file_out.write('#!/bin/bash\n'+'#\n\n')

    cur.execute("""SELECT id_osm, name, istat, id_parent FROM public.boundaries WHERE id_adm=%s AND flag=TRUE AND poly<>'';""",(adm,))
    rows = cur.fetchall()
    if len(rows) > 0:
      for row in rows: 
        #print row
        (id_osm, name, istat, id_parent) = row
        if adm == 6:
          if id_parent <> None:
            cur.execute("""SELECT name, istat, id_adm FROM public.boundaries WHERE id_osm=%s;""",(id_parent,))
            parent  = cur.fetchone()
            (name_par, istat_par, id_adm_par) = parent
            path_pbf = '"' + path_data_par + istat_par + "_" + name_par.decode('utf8').replace('/','-') + '_poly.osm.pbf"'
            folder_osm = path_pbf
        elif adm == 8:
          if id_parent <> None:
            cur.execute("""SELECT name, istat, id_adm FROM public.boundaries WHERE id_osm=%s;""",(id_parent,))
            parent  = cur.fetchone()
            (name_par, istat_par, id_adm_par) = parent
            if id_adm_par == 4:
              path_data_par = "../dati/poly/regioni/pbf/"
            elif id_adm_par == 6:
              path_data_par = "../dati/poly/province/pbf/"
            path_pbf = '"' + path_data_par + istat_par + "_" + name_par.decode('utf8').replace('/','-') + '_poly.osm.pbf"'
            folder_osm = path_pbf
        #string = 'osmium extract --polygon "' + path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '.poly" --overwrite -f pbf -o "' + path_data + istat + "_" + name.decode('utf8').replace('/','-') + '_poly.osm.pbf" ' + folder_osm + '\n'
        string = 'osmium extract --config="' + path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '.json" --overwrite -f pbf -o "' + path_data + istat + "_" + name.decode('utf8').replace('/','-') + '_poly.osm.pbf" ' + folder_osm + '\n'
        string = path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '.poly'
        file_out.write('echo "' + string + '"\n')
        string = 'osmium extract --config="' + path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '_poly.json" --overwrite ' + folder_osm + '\n'
        #print string
        file_out.write(string)
        if adm >= 4:
          string = folder_poly_loc + istat + "_" + name.decode('utf8').replace('/','-') + "_poly.json"
          out_file2 = codecs.open(string, 'w', encoding='utf8')
          out_file2.write('{\n\t"extracts": [\n\t{\n')
          string = folder_data_loc + istat + "_" + name.decode('utf8').replace('/','-') + '_poly.osm.pbf'
          out_file2.write('\t\t\t"output": "'+ string +'",\n')
          out_file2.write('\t\t\t"output_format": "pbf",\n')
          out_file2.write('\t\t\t"multipolygon": {\n')
          str_poly = folder_poly_loc + istat + "_" + name.decode('utf8').replace('/','-') + ".poly"
          string2 = '\t\t\t\t"file_name": "' + str_poly + '",\n'
          out_file2.write(string2)
          out_file2.write('\t\t\t\t"file_type": "poly"\n\t\t\t}\n')
          out_file2.write('\t\t}\n\t]\n}\n')
          out_file2.close()

    file_out.write('\n')
    file_out.close()


#    file_out = codecs.open(string_gj, 'w', encoding='utf8')
#    file_out.write('#!/bin/bash\n'+'#\n\n')
#
#    cur.execute("""SELECT id_osm, name, istat, id_parent FROM public.boundaries WHERE id_adm=%s AND flag=TRUE AND poly<>'';""",(adm,))
#    rows = cur.fetchall()
#    if len(rows) > 0:
#      for row in rows: 
#        #print row
#        (id_osm, name, istat, id_parent) = row
#        if adm == 6:
#          if id_parent <> None:
#            cur.execute("""SELECT name, istat, id_adm FROM public.boundaries WHERE id_osm=%s;""",(id_parent,))
#            parent  = cur.fetchone()
#            (name_par, istat_par, id_adm_par) = parent
#            path_pbf = '"' + path_data_par + istat_par + "_" + name_par.decode('utf8').replace('/','-') + '_poly.osm.pbf"'
#            folder_osm = path_pbf
#        elif adm == 8:
#          if id_parent <> None:
#            cur.execute("""SELECT name, istat, id_adm FROM public.boundaries WHERE id_osm=%s;""",(id_parent,))
#            parent  = cur.fetchone()
#            (name_par, istat_par, id_adm_par) = parent
#            if id_adm_par == 4:
#              path_data_par = "../dati/poly/regioni/pbf/"
#            elif id_adm_par == 6:
#              path_data_par = "../dati/poly/province/pbf/"
#            path_pbf = '"' + path_data_par + istat_par + "_" + name_par.decode('utf8').replace('/','-') + '_poly.osm.pbf"'
#            folder_osm = path_pbf
#        #string = 'osmium extract --polygon "' + path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '.poly" --overwrite -f pbf -o "' + path_data + istat + "_" + name.decode('utf8').replace('/','-') + '_poly.osm.pbf" ' + folder_osm + '\n'
#        #string = 'osmium extract --config="' + path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '.json" --overwrite -f pbf -o "' + path_data + istat + "_" + name.decode('utf8').replace('/','-') + '_poly.osm.pbf" ' + folder_osm + '\n'
#        string = path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '.poly'
#        file_out.write('echo "' + string + '"\n')
#        string = 'osmium extract --config="' + path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '_geojson.json" --overwrite ' + folder_osm + '\n'
#        #print string
#        file_out.write(string)
#        if adm >= 4:
#          string = folder_poly_loc + istat + "_" + name.decode('utf8').replace('/','-') + "_geojson.json"
#          out_file2 = codecs.open(string, 'w', encoding='utf8')
#          out_file2.write('{\n\t"extracts": [\n\t{\n')
#          string = folder_data_loc + istat + "_" + name.decode('utf8').replace('/','-') + '_poly.osm.pbf'
#          out_file2.write('\t\t\t"output": "'+ string +'",\n')
#          out_file2.write('\t\t\t"output_format": "pbf",\n')
#          out_file2.write('\t\t\t"multipolygon": {\n')
#          str_poly = folder_poly_loc + istat + "_" + name.decode('utf8').replace('/','-') + ".geojson"
#          string2 = '\t\t\t\t"file_name": "' + str_poly + '",\n'
#          out_file2.write(string2)
#          out_file2.write('\t\t\t\t"file_type": "geojson"\n\t\t\t}\n')
#          out_file2.write('\t\t}\n\t]\n}\n')
#          out_file2.close()
#
#    file_out.write('\n')
#    file_out.close()


##### bounding box
def create_bbox():
  folder_base = "%s/output/boundaries/bbox/" % (WORK_DIR)
  folder = folder_base

  print('Create bbox files')
  a_admincode = [2,4,6,8]
  for adm in a_admincode:
    #print adm
    if adm == 4:
      folder = folder_base + "regioni/"
    elif adm == 6:
      folder = folder_base + "province/"
    elif adm == 8:
      folder = folder_base + "comuni/"
    cur.execute("""SELECT id_osm, name, istat, ST_XMax(bbox) AS Xmax, ST_XMin(bbox) AS Xmin, ST_YMax(bbox) AS Ymax, ST_YMin(bbox) AS Ymin FROM public.boundaries WHERE id_adm=%s AND flag=TRUE AND poly<>'';""",(adm,))
    rows = cur.fetchall()
    if len(rows) > 0:
      for row in rows: 
        (id_osm, name, istat, XMax, XMin, YMax, YMin) = row
        string = folder + istat + "_" + name.decode('utf8').replace('/','-') + ".poly"
        out_file = open(string, 'w')
        #print id_osm, name, istat
        out_file.write('poligon\n')
        out_file.write('1\n')
        out_file.write('\t'+str(XMin)+'\t'+str(YMax)+'\n')
        out_file.write('\t'+str(XMax)+'\t'+str(YMax)+'\n')
        out_file.write('\t'+str(XMax)+'\t'+str(YMin)+'\n')
        out_file.write('\t'+str(XMin)+'\t'+str(YMin)+'\n')
        out_file.write('\t'+str(XMin)+'\t'+str(YMax)+'\n')
        out_file.write('END\n'+'END\n')
        out_file.close()

def create_script_bbox():
  folder_base = "%s/output/scripts/" % (WORK_DIR)
  folder = folder_base
  folder_osm = "%s/input/pbf/italy-latest.osm.pbf" % (WORK_DIR)

  print('Create script bbox')
  a_admincode = [2,4,6,8]
  for adm in a_admincode:
    #print adm
    if adm == 2:
      path_poly = "../boundaries/bbox/"
      path_data = "../dati/bbox/"
      string = folder + "nazioni_bbox.sh"
    elif adm == 4:
      path_poly = "../boundaries/bbox/regioni/"
      path_data = "../dati/bbox/regioni/pbf/"
      string = folder + "regioni_bbox.sh"
    elif adm == 6:
      path_poly = "../boundaries/bbox/province/"
      path_data = "../dati/bbox/province/pbf/"
      path_data_par = "../dati/bbox/regioni/pbf/"
      string = folder + "province_bbox.sh"
    elif adm ==8:
      path_poly = "../boundaries/bbox/comuni/"
      path_data = "../dati/bbox/comuni/pbf/"
      path_data_par = "../dati/bbox/province/pbf/"
      string = folder + "comuni_bbox.sh"
    #file_out = open(string, 'w')
    file_out = codecs.open(string, 'w', encoding='utf8')
    file_out.write('#!/bin/bash\n'+'#\n\n')

    cur.execute("""SELECT id_osm, name, istat, id_parent FROM public.boundaries WHERE id_adm=%s AND flag=TRUE AND poly<>'';""",(adm,))
    rows = cur.fetchall()
    if len(rows) > 0:
      for row in rows: 
        #print row
        (id_osm, name, istat, id_parent) = row
        if adm == 6:
          if id_parent <> None:
            cur.execute("""SELECT name, istat, id_adm FROM public.boundaries WHERE id_osm=%s;""",(id_parent,))
            parent  = cur.fetchone()
            (name_par, istat_par, id_adm_par) = parent
            path_pbf = '"' + path_data_par + istat_par + "_" + name_par.decode('utf8').replace('/','-') + '_bbox.osm.pbf"'
            folder_osm = path_pbf
        elif adm == 8:
          if id_parent <> None:
            cur.execute("""SELECT name, istat, id_adm FROM public.boundaries WHERE id_osm=%s;""",(id_parent,))
            parent  = cur.fetchone()
            (name_par, istat_par, id_adm_par) = parent
            if id_adm_par == 4:
              path_data_par = "../dati/bbox/regioni/pbf/"
            elif id_adm_par == 6:
              path_data_par = "../dati/bbox/province/pbf/"
            path_pbf = '"' + path_data_par + istat_par + "_" + name_par.decode('utf8').replace('/','-') + '_bbox.osm.pbf"'
            folder_osm = path_pbf
        string = 'osmium extract --polygon "' + path_poly + istat + "_" + name.decode('utf8').replace('/','-') + '.poly" --overwrite -f pbf -o "' + path_data + istat + "_" + name.decode('utf8').replace('/','-') + '_bbox.osm.pbf" ' + folder_osm + '\n'
        #print string
        file_out.write(string)

    file_out.write('\n')
    file_out.close()


create_poly()
create_script_poly()
create_bbox()
create_script_bbox()

conn.close() 

print("\nFinito !!\n")

