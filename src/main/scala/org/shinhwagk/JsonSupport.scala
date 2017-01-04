package org.shinhwagk

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import org.shinhwagk.DatabaseService.{ConnInfo, QueryInfo}
import spray.json.DefaultJsonProtocol

/**
  * Created by zhangxu on 2016/12/7.
  */
trait JsonSupport extends SprayJsonSupport with DefaultJsonProtocol {
  import spray.json._

//  implicit object AnyJsonFormat extends JsonFormat[Any] {
//    def write(x: Any) = x match {
//      case n: Int => JsNumber(n)
//      case s: String => JsString(s)
//      case b: Boolean if b == true => JsTrue
//      case b: Boolean if b == false => JsFalse
//    }
//
//    def read(value: JsValue) = value match {
//      case JsNumber(n) => n.intValue()
//      case JsString(s) => s
//      case JsTrue => true
//      case JsFalse => false
//    }
//  }

  implicit val ConnInfoFormat = jsonFormat3(ConnInfo)
  implicit val QueryInfoFormat = jsonFormat3(QueryInfo)
}
