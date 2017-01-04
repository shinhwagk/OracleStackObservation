name := "OracleStackObjectDetail-Back"

version := "1.0"

scalaVersion := "2.12.1"

resolvers ++= Seq("Spray Repository" at "http://dev.rtmsoft.me/nexus/content/groups/public/")

val akkaVersion = "10.0.1"

libraryDependencies ++= Seq(
  "com.wingtech" % "ojdbc" % "7",
  "com.typesafe.akka" %% "akka-http" % akkaVersion,
  "com.typesafe.akka" %% "akka-http-spray-json" % akkaVersion,
  "org.scalactic" %% "scalactic" % "3.0.1",
  "org.scalatest" %% "scalatest" % "3.0.1" % "test",
  "com.typesafe.akka" %% "akka-http-testkit" % akkaVersion
)

mainClass in assembly := Some("org.shinhwagk.Bootstrap")
assemblyOutputPath in assembly := baseDirectory.value / "OracleStackObjectDetail-Back.jar"