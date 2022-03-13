#!/usr/bin/env python
# -*- coding: utf-8 -*-

import psycopg2
import os

HOST = os.getenv('PGHOST')
DB = os.getenv('PGDATABASE')
USER = os.getenv('PGUSER')
PASSWORD = os.environ.get('PGPASSWORD')

connstring = "host=%s dbname=%s user=%s password=%s" % (HOST,DB,USER,PASSWORD)
conn = psycopg2.connect(connstring)
cur = conn.cursor()

def check_id_provincia (id_rel):
  print(id_rel)
  cur.execute("""SELECT a.id_osm, a.name FROM public.boundaries AS a
    JOIN public.boundaries AS b ON ST_Contains(a.geom, ST_Buffer(b.geom,-750))
    WHERE (a.id_adm=6 OR a.id_adm=4) AND b.id_osm="""+str(id_rel)+""";""")
  #print cur.fetchone()
  return cur.fetchone()


cur.execute("""SELECT id_osm, name FROM public.boundaries WHERE id_adm=8 AND id_parent IS NULL AND istat<>'' ORDER BY istat;""")
rows = cur.fetchall()

print ("Show me relations:")
for row in rows:
  try:
    (id_parent,name) = check_id_provincia(row[0])
    print(id_parent,name)
    print('')
    cur.execute("""UPDATE public.boundaries SET id_parent=%s WHERE id_osm=%s;""",(id_parent,row[0],))
    conn.commit()
  except:
    pass

conn.commit()
conn.close() 

print("Finito !!\n")

