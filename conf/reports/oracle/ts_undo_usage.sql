SELECT r.name 回滚段名, rssize/1024/1024/1024 "RSSize(G)",
  s.sid,
  s.serial#,
  s.username 用户名,
  s.status,
  s.sql_hash_value,
  s.SQL_ADDRESS,
  s.MACHINE,
  s.MODULE,
  substr(s.program, 1, 78) 操作程序,
  r.usn,
  hwmsize/1024/1024/1024,shrinks ,xacts
FROM sys.v_$session s,sys.v_$transaction t,sys.v_$rollname r, v$rollstat rs
WHERE t.addr = s.taddr and t.xidusn = r.usn and r.usn=rs.USN
Order by rssize desc