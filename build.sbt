
name := "sqlquery"

version := "1.0"

scalaVersion := "2.12.1"

resolvers ++= Seq("Spray Repository" at "http://dev.rtmsoft.me/nexus/content/groups/public/")

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http-core" % "10.0.0",
  "com.typesafe.akka" %% "akka-http" % "10.0.0",
  "com.wingtech" % "ojdbc" % "7"
)