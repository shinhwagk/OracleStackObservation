FROM centos:latest

RUN curl http://127.0.0,1:8089/jdk-8u112-linux-x64.rpm -o jdk-8u112-linux-x64.rpm > /dev/null
RUN curl http://127.0.0,1:8089/sbt-0.13.13.tgz -o sbt-0.13.13.tgz > /dev/null
RUN rpm -ivh jdk-8u112-linux-x64.rpm
RUN tar zxvf sbt-0.13.13.tgz

ENV PATH /sbt-launcher-packaging-0.13.13/bin:$PATH

RUN mkdir query
WORKDIR query

ADD . .

# EXPOSE 8081
CMD sbt test:compile && sbt test && sbt assembly && java -jar OracleStackObjectDetail-Back.jar