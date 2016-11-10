SELECT d.tablespace_name "Name",
       TO_CHAR(NVL(a.bytes / 1024 / 1024, 0), '99,999,990.900') "Size (M)",
       TO_CHAR(NVL(t.hwm, 0) / 1024 / 1024, '99999999.999') "HWM (M)",
       TO_CHAR(NVL(t.hwm / a.bytes * 100, 0), '990.00') "HWM % ",
       TO_CHAR(NVL(t.bytes / 1024 / 1024, 0), '99999999.999') "Using (M)",
       TO_CHAR(NVL(t.bytes / a.bytes * 100, 0), '990.00') "Using %"
  FROM sys.dba_tablespaces d,
       (select tablespace_name, sum(bytes) bytes
          from dba_temp_files
         group by tablespace_name) a,
       (select tablespace_name,
               sum(bytes_cached) hwm,
               sum(bytes_used) bytes
          from v$temp_extent_pool
         group by tablespace_name) t
 WHERE d.tablespace_name = a.tablespace_name(+)
   AND d.tablespace_name = t.tablespace_name(+)
   AND d.extent_management like 'LOCAL'
   AND d.contents like 'TEMPORARY';
   
SELECT "SID",
       "SERIAL#",
       "STATUS",
       "ACTION",
       "MACHINE",
       "MODULE",
       "OSUSER",
       "TERMINAL",
       "PROGRAM",
       SQL_ID,
       (SELECT NB.SQL_TEXT FROM V$SQLAREA NB WHERE NB.SQL_ID = TT.SQL_ID) SQL_TEXT,
       "sums(M)",
       "sizes(G)",
       "TEMP表空间占用情况"
FROM   (SELECT v.SID,
               v.SERIAL#,
               v.STATUS,
               v.ACTION,
               v.MACHINE,
               v.MODULE,
               v.OSUSER,
               v.TERMINAL,
               v.PROGRAM,
               v.SQL_ID,
               SUM(blocks) * 8 / (1024) "sums(M)",
               (SELECT round(SUM(bytes) / (1024 * 1024 * 1024), 3)
                FROM   v$tempfile) "sizes(G)",
               round((SUM(blocks) * 8 / (1024)) /
                     (SELECT SUM(bytes) / (1024 * 1024) FROM v$tempfile),
                     3) temp表空间占用情况
        FROM   v$tempseg_usage t,
               v$session       v
        WHERE  t.SESSION_ADDR = v.SADDR
        GROUP  BY v.SID,
                  v.SERIAL#,
                  v.STATUS,
                  v.ACTION,
                  v.MACHINE,
                  v.MODULE,
                  v.OSUSER,
                  v.TERMINAL,
                  v.PROGRAM,
                  v.SQL_ID
        ORDER  BY "sums(M)" DESC) TT
WHERE  "sums(M)" >= 10