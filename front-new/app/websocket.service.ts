/**
 * Created by zhangxu on 2016/7/29.
 */

export class NodeInfoWebSocketService {

  ws:WebSocket = new WebSocket("ws://127.0.0.1:9000/api/nodes2");

  open(_nodes) {
    this.ws.onopen = (evn:Event)=> {
      console.info('open.')

    }
    this.ws.onmessage = (messevn:MessageEvent)=> {
      _nodes = messevn.data
    }
  }

}