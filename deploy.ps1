ssh root@mydocker.com "mkdir /tmp/oo"
scp .\build.sh root@mydocker.com:/tmp/oo/
scp .\docker-compose.yml root@mydocker.com:/tmp/oo/
ssh root@mydocker.com "/bin/bash /tmp/oo/build.sh"