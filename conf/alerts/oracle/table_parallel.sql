select t.owner, t.table_name, degree
  from dba_tables t
where (trim(t.degree) >'1' or trim(t.degree)='DEFAULT')