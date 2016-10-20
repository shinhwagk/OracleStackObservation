select count(*) from (select tablespace_name,
       round(sum(bytes)) used,
       round(sum(maxbytes)) maxuse,
       round(sum(bytes) / sum(maxbytes) * 100)  userate
  from (select df.tablespace_name,
               (df.BYTES - fs.BYTES) / 1024 / 1024 / 1024 BYTES,
               decode(df.MAXBYTES, 0, df.bytes, df.maxbytes) / 1024 / 1024 / 1024 maxbytes
          from dba_data_files df,
               (select tablespace_name, file_id, sum(bytes) bytes
                  from dba_free_space
                 group by tablespace_name, file_id) fs
         where df.file_id = fs.file_id(+))
 group by tablespace_name
 order by round(sum(bytes) / sum(maxbytes) * 100) desc)
 where userate > 80