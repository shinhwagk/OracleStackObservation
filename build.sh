#!/bin/bash
mkdir -p /opt/OracleStackObservation && cd /opt/OracleStackObservation;
curl -LsSf https://raw.githubusercontent.com/shinhwagk/OracleStackObservation/build/docker-compose.yml > docker-compose.yml

function updateItem(){
  itemname=$1
  if [[ -d $1 ]]; then
    cd $itemname;
    git pull;
  else
    git clone -b itemname https://github.com/shinhwagk/OracleStackObservation itemname --depth=1
  fi
}

updateItem front
updateItem nginx

docker-compose up