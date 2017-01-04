package org.shinhwagk

import java.sql.{DriverManager, ResultSet}

import scala.collection.mutable.ArrayBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by zhangxu on 2016/12/6.
  */
object DatabaseService {
  Class.forName("oracle.jdbc.driver.OracleDriver");

  def query[T](qi: QueryInfo, f: (ResultSet) => List[T]) = Future {
    val ci = qi.ci
    val sqlText = qi.sqlText
    val parameters = qi.parameters
    val conn = DriverManager.getConnection(ci.jdbcUrl, ci.username, ci.password)
    val stmt = conn.prepareStatement(sqlText)
    (1 to parameters.length).foreach(num => stmt.setObject(num, parameters(num - 1)))
    val rs = stmt.executeQuery()

    val rows = f(rs)

    stmt.close()
    rs.close()
    conn.close()
    rows
  }

  def queryToMap(rs: ResultSet): List[Map[String, String]] = {
    val meta = rs.getMetaData
    val rows = new ArrayBuffer[Map[String, String]]()
    import scala.collection.mutable.Map
    while (rs.next()) {
      val row: Map[String, String] = Map.empty
      for (i <- 1 to meta.getColumnCount) {
        row += (meta.getColumnName(i) -> (if (rs.getString(i) == null) "" else rs.getString(i)))
      }
      rows += row.toMap
    }
    rows.toList
  }


  def queryToAarry(rs: ResultSet): List[List[String]] = {
    val meta = rs.getMetaData
    val rows: ArrayBuffer[List[String]] = new ArrayBuffer[List[String]]()
    rows += (1 to meta.getColumnCount).toList.map(meta.getColumnName)
    while (rs.next()) {
      rows += (1 to meta.getColumnCount).toList.map(i => (if (rs.getString(i) == null) "" else rs.getString(i)))
    }
    rows.toList
  }

  final case class ConnInfo(jdbcUrl: String, username: String, password: String)

  final case class QueryInfo(ci: ConnInfo, sqlText: String, parameters: List[Any])

}



