SELECT
    owner                               owner
  , table_name                          table_name
  , ''                                  partition_name
  , num_rows                            num_rows
  , ROUND((chain_cnt/num_rows)*100, 2)  pct_chained_rows
  , avg_row_len                         avg_row_length
FROM
    (select
         owner
       , table_name
       , chain_cnt
       , num_rows
       , avg_row_len 
     from
         sys.dba_tables 
     where
           chain_cnt is not null 
       and num_rows is not null 
       and chain_cnt > 0 
       and num_rows > 0 
       and owner != 'SYS')  
UNION ALL 
SELECT
    table_owner                         owner
  , table_name                          table_name
  , partition_name                      partition_name
  , num_rows                            num_rows
  , ROUND((chain_cnt/num_rows)*100, 2)  pct_chained_rows
  , avg_row_len                         avg_row_length
FROM
    (select
         table_owner
       , table_name
       , partition_name
       , chain_cnt
       , num_rows
       , avg_row_len 
     from
         sys.dba_tab_partitions 
     where
           chain_cnt is not null 
       and num_rows is not null 
       and chain_cnt > 0 
       and num_rows > 0 
       and table_owner != 'SYS') b 
WHERE
    (chain_cnt/num_rows)*100 > 10