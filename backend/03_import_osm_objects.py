#!/usr/bin/python2
# -*- coding: utf-8 -*-

import psycopg2
import urllib
import time
import os

HOST = os.getenv('PGHOST')
DB = os.getenv('PGDATABASE')
USER = os.getenv('PGUSER')
PASSWORD = os.environ.get('PGPASSWORD')

connstring = "host=%s dbname=%s user=%s password=%s" % (HOST,DB,USER,PASSWORD)
conn = psycopg2.connect(connstring)
cur = conn.cursor()

cur.execute("""UPDATE public.boundaries SET flag=FALSE;""")

def check_record(id_adm):
  cur.execute("""SELECT abs(osm_id), name, istat, short_name, admin_level FROM public.osm_admin WHERE admin_level=%s AND osm_id<0 AND istat<>'';""",(id_adm,))
  rows = cur.fetchall()
  if len(rows) > 0:
    for row in rows:
      print row 
      (id_rel, name, istat, short_name, adm_level) = row
      cur.execute("""SELECT id_osm FROM public.boundaries WHERE id_osm=%s;""", (id_rel,))
      records = cur.fetchall()
      if len(records) > 0:
        cur.execute("""UPDATE public.boundaries SET flag=TRUE, istat=%s, short_name=left(%s,3), id_adm=%s WHERE id_osm=%s;""", (istat,short_name,adm_level,id_rel,))
        conn.commit()
      else:
        print "Insert !!"
        cur.execute("""INSERT INTO boundaries (id_osm, id_adm, istat, name, short_name) VALUES (%s,%s,%s,%s,left(%s,3))""", (id_rel, adm_level, istat, name, short_name))
        conn.commit()


a_admincode = [2,4,6,8]
for adm in a_admincode:
  print adm
  check_record(adm)

conn.close() 

print("Finito !!\n")

