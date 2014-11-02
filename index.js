
  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);

  app.use(express.static(process.cwd() + '/public'));

  var connectedSockets = [];
var adminchannel = io.of('/adminchannel');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

server.listen(8080);

app.use(session({secret: 'secret'}));

app.get('/', function (req, res) {
  console.log(req.sessionID);
  res.render('index', {a:req.sessionID});
});

app.get('/about', function(req,res){
  console.log(req.sessionID);
  res.render('about', {a:req.sessionID});
});

app.get('/admin', function(req, res){
  res.sendFile(__dirname + '/admin.html');
  console.log(req.url);
  res.render('admin', {a:req.sessionID});
});

//http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients
function findClientsSocket(roomId, namespace) {
    var res = [], ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}

function findClientsSocketByRoomId(roomId) {
    var res = [], room = io.sockets.adapter.rooms[roomId];
    if (room) {
        for (var id in room) {
        res.push(io.sockets.adapter.nsp.connected[id]);
        }
    }
    return res;
}

adminchannel.on('connection', function(socket){
    console.log('Admin connected');
    var clients = findClientsSocket();
    var clientIDs = [];
    for (var index in clients) {
      console.log(clients[index].id);
      clientIDs.push(clients[index].id);
    }
    adminchannel.emit('initAdmin', clientIDs);
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
  console.log("socket id is " + socket.id);

  //get socket id and hence room id for all clients
  var clients = findClientsSocket();
  var clientIDs = [];
  for (var index in clients) {
    console.log(clients[index].id);
    clientIDs.push(clients[index].id);
  }
  //var clients = findClientsSocket('room', '/chat') ;
  socket.on('pageChange', function(userData){
    
    //Is this the intended users socket id and not the admins
    //And does it matter
    userData.socketID = socket.id;
    userData.clientIDs = clientIDs;
    console.log('user with sid ' + userData.sid + ' and session id ' + userData.socketID + ' changed page ' + userData.page);
    adminchannel.emit('alertAdmin', userData);
  });

  socket.on('adminMessage', function(userData) {
    socket.broadcast.to(userData.socketID).emit('adminBroadcast', userData);
  });

  socket.on('disconnect', function(userData) {
    userData.socketID = socket.id;
    adminchannel.emit('user left', userData);
  });

});