const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
// const bodyParser = require('body-parser');
const realPassword = '';
const mongo = require('mongodb').MongoClient;
const router = require('./routes/index');

app.use('/', router);

// app.use(bodyParser.urlencoded({ extended: false }));

let connectedUsers = 0;
 
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

server.listen(3000, () => {
  console.log('listening on *:3000');
});