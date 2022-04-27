const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser');
const realPassword = 'Ligma';
const mongo = require('mongodb').MongoClient;

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
 
//skila skila4cluster.r12qr.mongodb.net
mongo.connect('mongodb://127.0.0.1/chatserver_msg',{useUnifiedTopology: true}, function(err,db){
  if (err){
    throw err;
  }
  var chatdb = db.db('chatserver_msg');

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
    chatdb.collection('messages').find({}).toArray(function(err, result){
      if (err) throw err;
      console.log(result);
      socket.emit('initialize_chat',result);
    });
    // Velja notendanafn
    socket.on('choose_nick', (username) => {
      console.log('username: ' + username.username);
      if (username.password === realPassword)
        socket.userName = username.username;
    });
    socket.on('chat_message', (msg) => {
        // console.log(msg.password);
        // Logga skilaboð frá notanda í console
        console.log(socket.userName + ' said: ' + msg.value);
        if (msg.password === realPassword)
          chatdb.collection('messages').insertOne({user: socket.userName,msg:msg});
          io.emit('chat_message', msg, socket.userName);
    });
    socket.on('typing', (data)=>{
      data.userName = socket.userName;
      // console.log(data);
      if(data.typing==true) {
        if (data.password === realPassword)
          io.emit('display', data)
      }
      else
        io.emit('display', data)
    });
  });
});

// io.on('connection', (socket) => {
//   //Hækka fjölda innskráðra
//   connectedUsers++;
//   //Látum aðra vita að fjöldi breyttist.
//   io.emit('Connected users changed', connectedUsers);
//   console.log('user connected');
//   socket.on('disconnect', () => {
//     //Lækka fjölda innskráðra
//     connectedUsers--;
//     //Látum aðra vita að fjöldi breyttist.
//     io.emit('Connected users changed', connectedUsers);
//     console.log('user disconnected');
//   });
//   socket.on('choose_nick', (username) => {
//     console.log('username: ' + username.username);
//     if (username.password === realPassword)
//       socket.userName = username.username;
//   });
//   socket.on('chat message', (msg) => {
//       // console.log(msg.password);
//       console.log(socket.userName + ' said: ' + msg.value);
//       if (msg.password === realPassword)
//         io.emit('chat message', msg, socket.userName);
//   });
//   socket.on('typing', (data)=>{
//     data.userName = socket.userName;
//     // console.log(data);
//     if(data.typing==true) {
//       if (data.password === realPassword)
//         io.emit('display', data)
//     }
//     else
//       io.emit('display', data)
//   })
// });

server.listen(3000, () => {
  console.log('listening on *:3000');
});