-- webapp municipalities index
select json_group_array(
           json_object(
               'name', name,
               'reg_name', reg_name,
               'prov_name', pro_name,
               'com_istat_code', com_istat_code,
               'prov_istat_code', pro_istat_code,
               'reg_istat_code', reg_istat_code
           )
       )
  from boundaries
 where admin_level = 8
 group by true;
