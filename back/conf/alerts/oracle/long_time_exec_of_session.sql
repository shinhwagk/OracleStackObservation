select 
  SID,
  SERIAL#,
  to_char(START_TIME,'yyyy-mm-dd hh24:mi:ss') START_TIME,
  ELAPSED_SECONDS,
  USERNAME,
  SQL_ID 
from v$SESSION_LONGOPS where ELAPSED_SECONDS > 10