-- webapp municipalities index
select json_group_array(
           json_object(
               'name', com.name,
               'prov_name', pro.name,
               'reg_name', reg.name,
               'com_istat_code', com.com_istat_code,
               'prov_istat_code', com.pro_istat_code,
               'reg_istat_code', com.reg_istat_code
           )
       )
  from boundaries as com
  join boundaries as pro
    on com.pro_istat_code = pro.ref_istat
  join boundaries as reg
    on com.reg_istat_code = reg.ref_istat
 where com.admin_level = 8 and
       pro.admin_level = 6 and
       reg.admin_level = 4
 group by true;
