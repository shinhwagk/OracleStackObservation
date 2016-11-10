select d.TABLE_OWNER,
       table_name,
       trunc(count(distinct(column_name)) / count(*), 2) cross_idx_rate
  from dba_ind_columns d
 where TABLE_OWNER not in ('XDB', 'APEX_030200', 'DBSNMP', 'ORDDATA')
   AND TABLE_OWNER not like '%SYS%' 
 group by TABLE_OWNER, table_name
having count(distinct(column_name)) / count(*) < 1
 order by cross_idx_rate desc