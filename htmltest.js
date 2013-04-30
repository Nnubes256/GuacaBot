var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
app.listen(130);

var ansicodes = {
'reset': '\033[0m',
'bold': '\033[1m',
'italic': '\033[3m',
'underline': '\033[4m',
'blink': '\033[5m',
'black': '\033[30m',
'red': '\033[31m',
'green': '\033[32m',
'yellow': '\033[33m',
'blue': '\033[34m',
'magenta': '\033[35m',
'cyan': '\033[36m',
'white': '\033[37m',
}

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('newMessage', function (data) {
    socket.emit('sendEvent',data);
  });
  socket.on('scriptMsg', function(data){
    socket.emit('sendEvent',data);
  });
});
var test = setInterval(function(){
  io.sockets.emit('sendEvent',{"type":"Info","catText":"Hooray!","text":"WOOO!"});
},10000);