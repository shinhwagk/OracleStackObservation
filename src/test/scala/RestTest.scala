/**
  * Created by zhangxu on 2016/12/7.
  */

import akka.http.scaladsl.model.{HttpEntity, _}
import akka.http.scaladsl.testkit.{RouteTestTimeout, ScalatestRouteTest}
import org.scalatest.{Matchers, WordSpec}
import org.shinhwagk.DatabaseService.{ConnInfo, QueryInfo}
import org.shinhwagk.{JsonSupport, RestService}
import spray.json._
import scala.concurrent.duration._

class RestTest extends WordSpec with Matchers with ScalatestRouteTest with RestService with JsonSupport {

  implicit val routeTestTimeout = RouteTestTimeout(5.second)

  "proper rejection collection" in {
    val ci: ConnInfo = ConnInfo("jdbc:oracle:thin:@10.65.193.22:1521/whdb2", "system", "oracle")
    val qi = QueryInfo(ci, "select table_name,owner from dba_tables where rownum < ? and owner = ?", List(111, "SYS"))
    val httpEntity = HttpEntity(MediaTypes.`application/json`, qi.toJson.toString())

    Post("/query/map", httpEntity) ~> route ~> check {
      status shouldEqual StatusCodes.OK
    }
  }

  "proper rejection collection2" in {
    val ci: ConnInfo = ConnInfo("jdbc:oracle:thin:@10.65.193.22:1521/whdb2", "system", "oracle")
    val qi = QueryInfo(ci, "select table_name,owner from dba_tables where rownum < ? and owner = ?", List(111, "SYS"))
    val httpEntity = HttpEntity(MediaTypes.`application/json`, qi.toJson.toString())

    Post("/query/array", httpEntity) ~> route ~> check {
      status shouldEqual StatusCodes.OK
    }
  }

}