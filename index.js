  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);

  app.use(express.static(process.cwd() + '/public'));

  var connectedSockets = [];

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/about', function(req,res){
  res.sendFile(__dirname + '/about.html');
});

app.get('/admin', function(req, res){
  res.sendFile(__dirname + '/admin.html');
});

app.get('/send/:socket_id', function(req, res){
  var socket_id = req.param.socket_id;
  io.to(socket_id).emit('offer', 'You get an amazing offer');
  res.send('message sent');
});

io.on('connection', function (socket) {
  connectedSockets.push(socket.id);
  console.log('a user connected');
  console.log(connectedSockets);
  console.log("socket id " + socket.id);
  socket.on('offer', function(message){
    console.log(message);
  });
  socket.on('pageChange', function(userData){
    console.log('user changed page ' + userData.page);
    io.emit('pageChange', userData);
  });
});