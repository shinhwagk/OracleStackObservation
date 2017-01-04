package org.shinhwagk

import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import scala.util.{Failure, Success}

import org.shinhwagk.DatabaseService.QueryInfo

/**
  * Created by zhangxu on 2016/12/7.
  */
trait RestService extends JsonSupport {

  import spray.json._

  val route =
  //    (post & pathPrefix("v5" / "query") & entity(as[QueryInfo])) { qi =>
    (post & pathPrefix("query") & entity(as[QueryInfo])) { qi =>
      path("map") {
        val query = DatabaseService.query[Map[String, String]](qi, DatabaseService.queryToMap)
        onComplete(query) {
          case Success(json) => complete(HttpEntity(ContentTypes.`application/json`, json.toJson.toString))
          case Failure(ex) => (complete(ex.getMessage))
        }
      } ~ path("array") {
        val query = DatabaseService.query[List[String]](qi, DatabaseService.queryToAarry)
        onComplete(query) {
          case Success(json) => complete(HttpEntity(ContentTypes.`application/json`, json.toJson.toString))
          case Failure(ex) => (complete(ex.getMessage))
        }
      }
    }
}
