#!/bin/bash

#check command exist
command -v node >/dev/null 2>&1 || { echo >&2 "command: node, no exist "; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "command: npm, no exist "; exit 1; }
command -v env >/dev/null 2>&1 || { echo >&2 "command: env, no exist "; exit 1; }

# set command
NODE_COMMAND=`command -v node`
NPM_COMMAND=`command -v npm`
ENV_COMMAND=`command -v env`

#set base dir
cd `dirname $0`/../
BASE_HOME=`pwd`

# set pid file name
PID_FILE=$BASE_HOME/RUNNING_PID

process_args(){
  case "$1" in
    -h|-help) help; exit 1 ;;
    -start)   start ;;
    -stop)    stop ;;
    *)        help; exit 1;;
    esac
}

start(){
  if [ -f $PID_FILE ]; then
    echo "pid file exist...";
    exit 1;
  fi

  nohup $NODE_COMMAND dist/src/app.js &
}

stop(){
  if [ -f $PID_FILE ]
  then
    app_pid=`cat $PID_FILE`;
    kill -9 $app_pid;
    rm -f $PID_FILE;
  else
    echo "pid file not exist.";
    exit 1;
  fi
}

help(){
  echo -e "
    -h | -help   print help
    -start       start oracle-observation
    -stop        stop oracle-observation
  "
}

npm_install(){
  $NPM_COMMAND i --registry=https://registry.npm.taobao.org;

  if [ $? -ne 0 ]; then
    echo "npm i error;"
    exit 1;
  fi
}

gulp_compile(){
  $NPM_COMMAND run default;

  if [ $? -ne 0 ]; then
    echo "npm run default error;"
    exit 1;
  fi
}

check_env(){
    $ENV_COMMAND | grep ORACLE_HOME || { echo >&2 "env: ORACLE_HOME, no set "; exit 1; }
    $ENV_COMMAND | grep OCI_LIB_DIR || { echo >&2 "env: OCI_LIB_DIR, no set "; exit 1; }
    $ENV_COMMAND | grep OCI_INC_DIR || { echo >&2 "env: OCI_INC_DIR, no set "; exit 1; }
}

npm_install;

gulp_compile;

process_args $1;