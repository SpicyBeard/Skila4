const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser');
const realPassword = 'Ligma';


app.use(bodyParser.urlencoded({ extended: false }));

let connectedUsers = 0;
// Milliforrit sem bætir breytunni requestTime við req hlutinn/objectinn 
var requestTime = (req, res, next) => { 
  req.requestTime = new Date(); 
  // köllum á næsta milliforriti í röðinni   
  next(); 
};

// biðjum um að requestTime milliforritið sé notað 
app.use(requestTime);

app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/index.html'); 
  // með næstu skipun getum við séð í console hvenær beiðni barst 
  console.log('Site visitor arrived at: '+req.requestTime); 
}); 
  
io.on('connection', (socket) => {
  //Hækka fjölda innskráðra
  connectedUsers++;
  //Látum aðra vita að fjöldi breyttist.
  io.emit('Connected users changed', connectedUsers);
  console.log('user connected');
  socket.on('disconnect', () => {
    //Lækka fjölda innskráðra
    connectedUsers--;
    //Látum aðra vita að fjöldi breyttist.
    io.emit('Connected users changed', connectedUsers);
    console.log('user disconnected');
  });
  socket.on('choose_nick', (username) => {
    console.log('username: ' + username.username);
    if (username.password === realPassword)
      socket.userName = username.username;
  });
  socket.on('chat message', (msg) => {
      console.log(msg.password);
      console.log('message: ' + msg);
      if (msg.password === realPassword)
        io.emit('chat message', msg, socket.userName);
  });
  socket.on('typing', (data)=>{
    data.userName = socket.userName;
    console.log(data);
    if(data.typing==true) {
      if (data.password === realPassword)
        io.emit('display', data)
    }
    else
      io.emit('display', data)
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});