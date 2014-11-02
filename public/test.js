function sendData(data){
  var xhReq = new XMLHttpRequest();
  var url = 'http://53f5c161.ngrok.com/postdata';
  xhReq.open('POST', url, true);
  xhReq.setRequestHeader("Content-Type", "application/json");
  xhReq.send(data);
}