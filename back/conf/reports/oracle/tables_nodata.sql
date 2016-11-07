SELECT  
       t.owner,
       t.table_name,
       t.partition_name,
       t.tablespace_name,
       t.logging,
       t.last_analyzed,
       t.sizes sizes_m 
  FROM (
        ---------------------------------- 非分区表
        SELECT D.owner,
                D.table_name,
                '' partition_name,
                D.tablespace_name,
                D.logging,
                D.last_analyzed,
                b.sizes
          FROM dba_tables d,
                (SELECT NB.owner,
                        NB.segment_name,
                        SUM(NB.BYTES) / 1024 / 1024 SIZES
                   FROM DBA_SEGMENTS NB
                  WHERE NB.partition_name IS NULL
                    AND nb.segment_type = 'TABLE'
                    AND nb.BYTES / nb.initial_extent > 1.1
                    AND nb.owner NOT IN ('SYS', 'SYSTEM')
                    AND nb.tablespace_name NOT IN ('SYSTEM', 'SYSAUX')
                  GROUP BY NB.owner, NB.segment_name) B
         WHERE B.segment_name = D.table_name
           AND D.owner = B.owner
           AND d.partitioned = 'NO'
           AND D.owner NOT IN ('SYS', 'SYSTEM')
           AND D.tablespace_name NOT IN ('SYSTEM', 'SYSAUX')
           AND D.num_rows = 0
           AND B.SIZES > 10     
        UNION ALL      
        ------------------------------------------------------------  分区表    
        SELECT D.Table_Owner,
                D.table_name,
                d.partition_name,
                D.tablespace_name,
                D.logging,
                D.last_analyzed,
                b.sizes
          FROM DBA_TAB_PARTITIONS d,
                (SELECT NB.owner,
                        NB.segment_name,
                        nb.partition_name,
                        SUM(NB.BYTES) / 1024 / 1024 SIZES
                   FROM DBA_SEGMENTS NB
                  WHERE NB.partition_name IS NOT NULL
                    AND nb.segment_type = 'TABLE PARTITION'
                    AND nb.BYTES / nb.initial_extent > 1.1
                    AND nb.owner NOT IN ('SYS', 'SYSTEM')
                    AND nb.tablespace_name NOT IN ('SYSTEM', 'SYSAUX')
                  GROUP BY NB.owner, NB.segment_name, nb.partition_name) B
         WHERE B.segment_name = D.table_name
           AND D.Table_Owner = B.owner
           AND d.partition_name = b.partition_name
           AND D.TABLE_OWNER NOT IN ('SYS', 'SYSTEM')
           AND D.tablespace_name NOT IN ('SYSTEM', 'SYSAUX')
           AND D.num_rows = 0
           AND B.SIZES > 10) t
 WHERE t.table_name NOT LIKE '%TMP%'
   AND t.table_name NOT LIKE '%TEMP%'