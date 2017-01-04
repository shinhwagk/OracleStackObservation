package org.shinhwagk

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import akka.stream.scaladsl._
import scala.concurrent.Future

/**
  * Created by zhangxu on 2016/12/6.
  */
object Bootstrap extends App with RestService {
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  implicit val executionContext = system.dispatcher

  val serverSource: Source[Http.IncomingConnection, Future[Http.ServerBinding]] =
    Http().bind(interface = "0.0.0.0", port = 8081)

  val bindingFuture: Future[Http.ServerBinding] = serverSource.to(Sink.foreach { connection => // foreach materializes the source
    println("Accepted new connection from " + connection.remoteAddress)
    connection.handleWith(route)
  }).run()
}
