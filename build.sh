#!/bin/bash
# mkdir -p /opt/OracleStackObservation && cd /opt/OracleStackObservation;
# curl -LsSf https://raw.githubusercontent.com/shinhwagk/OracleStackObservation/build/docker-compose.yml > docker-compose.yml;

cd /opt/OracleStackObservation

function updateOrCreateSerivce(){
  itemName=$1;
  if [[ -d $itemName ]]; then
    cd $itemName; git pull; cd ..;
  else
    echo "info: git clone branch ${itemName}.";
    git clone -b $itemName https://github.com/shinhwagk/OracleStackObservation $itemName --depth=1;
  fi
}

updateOrCreateSerivce "front";
updateOrCreateSerivce "nginx";

docker-compose rm -f; # delete service front volumes
docker-compose up --build -d;