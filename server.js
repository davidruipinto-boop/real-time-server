const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors({ origin: "https://davidruipinto-boop.github.io" }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://davidruipinto-boop.github.io",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

const users = {};

io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });

  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', {
      message: message,
      name: users[socket.id]
    });
  });

  socket.on('send-file', data => {
    socket.broadcast.emit('file-message', data);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

// Endpoint de teste opcional (só para verificar se o servidor responde)
app.get('/', (req, res) => {
  res.send("Servidor Socket.IO está ativo");
});

server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
