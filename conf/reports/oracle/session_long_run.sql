SELECT *
FROM   (SELECT t.INST_ID,
               t.sid,
               t.SERIAL#,
               t2.spid,
               t.PROGRAM,
               t.status,
               t.sql_id,
               t.PREV_SQL_ID,
               t.event,
               t.WAIT_CLASS,
               t.LOGON_TIME,
               trunc((SYSDATE - logon_time) * 24, 2) total_h
        FROM   gv$session t,
               gv$process t2
        WHERE  t.paddr = t2.ADDR
        AND    t.INST_ID = t2.INST_ID
        AND    t.type <> 'BACKGROUND'
        ORDER  BY logon_time)
WHERE  rownum <= 10
order by INST_ID, logon_time 