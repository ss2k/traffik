var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/about', function(req,res){
  res.sendFile(__dirname + '/about.html');
});

app.get('/admin', function(req, res){
  console.log(req.url);
  res.sendFile(__dirname + '/admin.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('pageChange', function(userData){
    console.log('user changed page ' + userData.page);
    io.emit('pageChange', userData);
  });
});