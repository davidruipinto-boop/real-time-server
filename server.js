const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const typingUsers = new Set();
const app = express();

// ✅ CORS para o Express (necessário para polling funcionar corretamente)
app.use(cors({
  origin: "https://davidruipinto-boop.github.io"
}));

const server = http.createServer(app);

// ✅ CORS para o Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://davidruipinto-boop.github.io",
    methods: ["GET", "POST"],
    credentials: true
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

  socket.on('typing', name => {
        typingUsers.add(name);
        io.emit('update-typing', Array.from(typingUsers));
    });

    socket.on('stop-typing', name => {
        typingUsers.delete(name);
        io.emit('update-typing', Array.from(typingUsers));
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

    // Atualiza lista de utilizadores
    io.emit('update-user-list', Object.values(users));
  });
});

// Endpoint opcional para verificar se o servidor responde
app.get('/', (req, res) => {
  res.send("Servidor Socket.IO está ativo!");
});

server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
