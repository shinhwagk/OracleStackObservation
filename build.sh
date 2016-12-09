#!/bin/bash
mkdir -p /opt/OracleStackObservation && cd /opt/OracleStackObservation;
curl -LsSf https://raw.githubusercontent.com/shinhwagk/OracleStackObservation/build/docker-compose.yml > docker-compose.yml

git clone -b front https://github.com/shinhwagk/OracleStackObservation front --depth=1
git clone -b nginx https://github.com/shinhwagk/OracleStackObservation nginx --depth=1

docker-compose up