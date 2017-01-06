#!/bin/bash
LS='/bin/ls'

fileCnt=`$LS /bak_nfs/ | wc -l`

rs=""

if [ $fileCnt -gt 1 ]; then
    ${LS} | grep -e 'log$' | while read logFile
            do
                tail -n 1 ${logFile} | grep 'successfully' > /dev/null 2>&1
                bakFile=`echo ${logFile} | sed 's/log$/dmp/'`
                if [ $? == 0 && -f ${bakFile} ]; then
                    rs = rs "[${bakFile},'successfully']"
                else
                    rs = rs "[${bakFile},'failure']"
                fi
            done
else
    rs = "[]"
fi

echo $rs