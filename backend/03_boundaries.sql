.echo on
.load mod_spatialite
begin;

-- Aggiunta codici ISTAT proince sarde
update boundaries
   set ref_istat = '104'
 where name = 'Nord-Est Sardegna';
update boundaries
   set ref_istat = '105'
 where name = 'Ogliastra';
update boundaries
   set ref_istat = '106'
 where name = 'Medio Campidano';
update boundaries
   set ref_istat = '107'
 where name = 'Sulcis Iglesiente';

-- Creazione proincia fittizia della Valle d'Aosta
insert into boundaries (osm, name, ref_istat, admin_level, GEOMETRY)
select null,
       name,
       '007',
       '6',
       GEOMETRY
  from boundaries
 where ref_istat = '02';

-- Rimozione aree non italiane
delete from boundaries where ref_istat is null;

-- Creazione colonna aggiuntiva per il nome dei file, senza caratteri speciali
alter table boundaries add column "filename" varchar;
update boundaries
   set filename = ref_istat || '_' || replace(replace(name, '/', '-'), '.', '');

-- Creazione colonne aggiuntive ISTAT
alter table boundaries add column "com_istat_code" varchar;
alter table boundaries add column "pro_istat_code" varchar;
alter table boundaries add column "reg_istat_code" varchar;

-- Copia valori ISTAT nella relativa colonna
update boundaries
   set com_istat_code = ref_istat
 where admin_level = '8';
update boundaries
   set pro_istat_code = ref_istat
 where admin_level = '6';
update boundaries
   set reg_istat_code = ref_istat
 where admin_level = '4';

-- Le relazioni tra i vari enti sono prensenti in OSM,
--   ma non sono esportate da ogr2ogr
update boundaries
   set pro_istat_code = (
        select ref_istat
          from boundaries as p
         where p.admin_level == '6' and
               ST_Contains(p.geometry, ST_PointOnSurface(boundaries.geometry))
       )
 where admin_level = '8';
update boundaries
   set reg_istat_code = (
        select ref_istat
          from boundaries as p
         where p.admin_level == '4' and
               ST_Contains(p.geometry, ST_PointOnSurface(boundaries.geometry))
       )
 where admin_level in ('6', '8');

commit;
