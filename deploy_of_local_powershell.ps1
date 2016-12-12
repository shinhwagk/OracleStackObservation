ssh root@mydocker.com "mkdir -p /opt/OracleStackObservation"

scp .\build.sh root@mydocker.com:/opt/OracleStackObservation/
scp .\docker-compose.yml root@mydocker.com:/opt/OracleStackObservation/

ssh root@mydocker.com "/bin/bash /tmp/oo/build.sh"