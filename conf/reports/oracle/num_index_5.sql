select owner,table_name, count(*) cnt
  from dba_indexes
 where owner not in ('XDB',
                     'APEX_030200', 
                     'DBSNMP','ORDDATA')
   AND owner not like '%SYS%'
 group by owner,table_name
having count(*) >= 6
order by cnt desc