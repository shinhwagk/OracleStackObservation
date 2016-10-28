#!/bin/bash
stepA=`df -hP | while read line ; do echo $line | sed 's/\s/'\",\"'/g' | sed 's/^/[\"/' | sed 's/$/\"]/'; done`;
stepB=`echo ${stepA} | sed 's/\] \[/\],\[/g'`;
echo '['${stepB}']'
