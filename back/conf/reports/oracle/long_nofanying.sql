SELECT A.USERNAME,
       A.LOGON_TIME,
       A.STATUS,
       A.SID,
       A.SERIAL#,
       (SELECT nb.SPID FROM v$process nb WHERE nb.ADDR = a.PADDR) SPID,
       A.MACHINE,
       A.OSUSER,
       round(a.LAST_CALL_ET / 60 / 60, 2) total_h
FROM   v$session A
WHERE  A.STATUS IN ('INACTIVE')
AND    A.USERNAME IS NOT NULL
AND    A.LAST_CALL_ET >= 60 * 60 * 10
ORDER  BY a.LAST_CALL_ET DESC,
          a.USERNAME,
          a.LOGON_TIME