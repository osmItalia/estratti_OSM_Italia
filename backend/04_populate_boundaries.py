#!/usr/bin/env python
# -*- coding: utf-8 -*-

import psycopg2
import urllib
import time
import datetime
import urllib
import urllib2
import socket
import os

timeout = 20
socket.setdefaulttimeout(timeout)

HOST = os.getenv('PGHOST')
DB = os.getenv('PGDATABASE')
USER = os.getenv('PGUSER')
PASSWORD = os.environ.get('PGPASSWORD')

connstring = "host=%s dbname=%s user=%s password=%s" % (HOST,DB,USER,PASSWORD)
conn = psycopg2.connect(connstring)
cur = conn.cursor()

def refresh_geometry (id_rel):
  url = 'http://polygons.openstreetmap.fr/?id='+str(id_rel)
  user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
  values = {  'name':'refresh',
    'refresh':'Refresh original geometry',
    'type':'submit'
    }
  headers = {'User-Agent': user_agent}
	data = urllib.urlencode(values)

  req = urllib2.Request(url=url, data=data, headers=headers)
  try:
    response = urllib2.urlopen(req) 
    the_page = response.read()
    #print response.info()
    cur.execute("""UPDATE public.boundaries SET date=%s  WHERE id_osm=%s;""", (datetime.datetime.now().date(), id_osm,))
    conn.commit()

  except urllib2.HTTPError, e:
    print 'HTTP Error ERROR code => %s \n URL=> %s\n' % (e.code,url)
  pass
	
def get_wkt (id_osm):
  params = urllib.urlencode({'id':id_osm,'params':0})
  page = urllib.urlopen("http://polygons.openstreetmap.fr/get_wkt.py?%s" % params)
  time.sleep(1.0)
  #print page.read()
  cur.execute("""UPDATE public.boundaries SET geom=ST_Transform(ST_MULTI(ST_MakeValid(ST_GeomFromEWKT(%s))),3857) WHERE id_osm=%s;""", (page.read(), id_osm))
  conn.commit()

def get_geojson (id_osm):
  params = urllib.urlencode({'id':id_osm,'params':0})
  page = urllib.urlopen("http://polygons.openstreetmap.fr/get_geojson.py?%s" % params)
  time.sleep(1.0)
  #print page.read()
  cur.execute("""UPDATE public.boundaries SET geojson=%s WHERE id_osm=%s;""", (page.read(), id_osm))
  conn.commit()

def get_poly (id_osm):
  params = urllib.urlencode({'id':id_osm,'params':0})
  page = urllib.urlopen("http://polygons.openstreetmap.fr/get_poly.py?%s" % params)
  time.sleep(1.0)
  #print page.read()
  cur.execute("""UPDATE public.boundaries SET poly=%s WHERE id_osm=%s;""", (page.read(), id_osm))
  conn.commit()

def check_id_regione (id_osm):
  #print(id_osm)
  cur.execute("""SELECT a.id_osm, a.name FROM public.boundaries AS a 
    JOIN public.boundaries AS b ON ST_Contains(a.geom, ST_Buffer(b.geom,-500))
    WHERE a.id_adm=4 AND b.id_osm="""+str(id_osm)+""";""")
  #print cur.fetchone()
  return cur.fetchone()

def check_id_provincia (istat):
  cur.execute("""SELECT id_osm FROM public.boundaries WHERE id_adm=6 and istat='"""+str(istat[:3])+"""';""")
  return cur.fetchone()
    
def get_bbox(id_osm):
  cur.execute("""UPDATE public.boundaries SEt bbox=ST_Envelope(ST_Transform(geom,4326)), flag=TRUE WHERE id_osm=%s;""",(id_osm,))
  conn.commit()


a_admincode = [2,4,6,8]
#a_admincode = [2,4]
#a_admincode = [8]
for adm in a_admincode:
  print adm
  cur.execute("""SELECT id, id_osm, istat FROM public.boundaries WHERE id_adm=%s AND flag=FALSE ORDER BY id_adm,istat;""", (adm,))
  rows = cur.fetchall()
  if len(rows) > 0:
    for row in rows: 
      print row
      (id,id_osm,istat) = row
      refresh_geometry (id_osm)
      get_wkt(id_osm)
      get_geojson(id_osm)
      get_poly(id_osm)
      get_bbox(id_osm)
      if adm == 6:
        (id_parent,name) = check_id_regione(id_osm)
        try:
          cur.execute("""UPDATE public.boundaries SET id_parent=%s WHERE id_osm=%s;""",(id_parent,id_osm,))
          conn.commit()
        except:
          pass
      if adm == 8:
        id_parent = check_id_provincia(istat)
        try:
          cur.execute("""UPDATE public.boundaries SET id_parent=%s WHERE id_osm=%s;""",(id_parent,id_osm,))
          conn.commit()
        except:
          pass
  conn.commit()

conn.close() 

print("Finito !!\n")

