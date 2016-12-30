#!/bin/bash
##
# ["dump file","backup status"]
##
LS='/bin/ls'

#fileCnt=`$LS /bak_nfs/ | wc -l`
dmpDir='/orabak'
nfsDir='/bak_nfs'
rs=""

function setColumnName(){
    echo '["dump file: '${1}'","backup status"],'
}

function fileOfDirCnt(){
  echo `$LS $1 | wc -l`
}

if [ -d $nfsDir ] && [ `fileOfDirCnt ${nfsDir}` -gt 1 ]; then
  for logFileName in `${LS} ${nfsDir} | grep -e 'log$'`
  do
    logFile="$nfsDir/$logFileName"
    dmpFileName=`echo ${logFileName} | sed 's/log$/dmp/'`
    dmpFile="$nfsDir/$dmpFileName"
    cat ${logFile} | tail -n 1 | grep 'successfully' >/dev/null 2>&1
    if [ $? == 0 ]; then
      if [ -f $dmpFile ]; then
        rs=${rs}"[\"${dmpFileName}\",\"successfully\"]"
      else
        rs=${rs}"[\"${dmpFileName}\",\"File no exist\"]"
      fi
    else
      rs=${rs}"[\"${dmpFileName}\",\"dump failure\"]"
    fi
  done
  rs=`echo $rs | sed 's/\]\[/\],\[/g'`
  rs="["`setColumnName ${nfsDir}`${rs}"]"
elif [ -d $dmpDir ] && [ `fileOfDirCnt ${dmpDir}` -gt 1 ]; then
  for logFileName in `${LS} ${dmpDir} | grep -e 'log$'`
  do
    logFile="$dmpDir/$logFileName"
    dmpFileName=`echo ${logFileName} | sed 's/log$/dmp/'`
    dmpFile="$dmpDir/$dmpFileName"
    cat ${logFile} | tail -n 1 | grep 'successfully' >/dev/null 2>&1
    if [ $? == 0 ]; then
      if [ -f $dmpFile ]; then
        rs=${rs}"[\"${dmpFileName}\",\"successfully\"]"
      else
        rs=${rs}"[\"${dmpFileName}\",\"File no exist\"]"
      fi
    else
      rs=${rs}"[\"${dmpFileName}\",\"dump failure\"]"
    fi
  done
  rs=`echo $rs | sed 's/\]\[/\],\[/g'`
  rs="["`setColumnName ${dmpDir}`${rs}"]"
else
  rs='["none","none"]'
  rs="["`setColumnName ${nfsDir}"_&&_"${dmpDir}`${rs}"]"
fi

echo $rs