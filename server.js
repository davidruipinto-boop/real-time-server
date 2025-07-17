
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

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

    // Notificar outros que alguém entrou
    socket.broadcast.emit('user-connected', name);

    // Enviar a lista atualizada para todos
    io.emit('update-user-list', Object.values(users));
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
    const name = users[socket.id];
    delete users[socket.id];

    socket.broadcast.emit('user-disconnected', name);

    io.emit('update-user-list', Object.values(users));
  });
});

server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
