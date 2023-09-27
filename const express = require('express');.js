const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000; // Wybierz odpowiedni port

// Obiekt przechowujący informacje o pokojach
const rooms = {};

// Funkcja do nadawania wiadomości do wszystkich użytkowników w danym pokoju
function sendMessageToRoom(roomName, sender, message) {
  io.to(roomName).emit('message', { sender, message });
}

io.on('connection', (socket) => {
  console.log('Nowy użytkownik połączony');

  // Obsługa dołączania do pokoju
  socket.on('joinRoom', (roomName, username) => {
    // Opuszczamy poprzedni pokój (jeśli użytkownik był już w jakimś pokoju)
    socket.leaveAll();

    // Dołączamy do nowego pokoju
    socket.join(roomName);

    // Dodajemy informacje o pokoju, jeśli nie istnieje
    if (!rooms[roomName]) {
      rooms[roomName] = {
        users: [],
        bannedUsers: [],
      };
    }

    // Sprawdzamy, czy użytkownik jest zbanowany w tym pokoju
    if (rooms[roomName].bannedUsers.includes(username)) {
      socket.emit('message', { sender: 'Admin', message: 'Zostałeś zbanowany w tym pokoju.' });
      socket.leave(roomName); // Opuszczamy pokój
      return;
    }

    // Dodajemy informacje o użytkowniku, jeśli jeszcze nie istnieje
    const user = rooms[roomName].users.find((user) => user.id === socket.id);
    if (!user) {
      rooms[roomName].users.push({ id: socket.id, username });
    }

    // Wysyłamy listę użytkowników w pokoju do klienta, który się właśnie dołączył
    io.to(roomName).emit('userList', rooms[roomName].users.map((user) => user.username));

    // Wyślij wiadomość powitalną do użytkownika
    socket.emit('message', { sender: 'Admin', message: `Witaj w pokoju ${roomName}!` });
  });

  // Obsługa wiadomości od użytkowników
  socket.on('chatMessage', (roomName, message) => {
    const room = rooms[roomName];
    const user = room.users.find((user) => user.id === socket.id);

    if (user) {
      sendMessageToRoom(roomName, user.username, message);
    }
  });

  // Obsługa banowania użytkowników
  socket.on('banUser', (roomName, usernameToBan) => {
    if (socket.id !== rooms[roomName].users[0].id) {
      socket.emit('message', { sender: 'Admin', message: 'Tylko właściciel pokoju może banować użytkowników.' });
      return;
    }

    rooms[roomName].bannedUsers.push(usernameToBan);
    const userToBanIndex = rooms[roomName].users.findIndex((user) => user.username === usernameToBan);
    if (userToBanIndex !== -1) {
      rooms[roomName].users.splice(userToBanIndex, 1);
    }

    sendMessageToRoom(roomName, 'Admin', `${usernameToBan} został zbanowany.`);
    io.to(roomName).emit('userList', rooms[roomName].users.map((user) => user.username));

    // Opuszczamy pokój, jeśli zbanowany użytkownik jest aktualnie w pokoju
    const bannedUserSocket = io.sockets.sockets.get(socket.id);
    if (bannedUserSocket) {
      bannedUserSocket.leave(roomName);
    }
  });

  // Obsługa wyjścia użytkownika z pokoju
  socket.on('leaveRoom', (roomName) => {
    const roomUsers = rooms[roomName].users;
    const userIndex = roomUsers.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      const username = roomUsers[userIndex].username;
      roomUsers.splice(userIndex, 1);
      sendMessageToRoom(roomName, 'Admin', `${username} opuścił pokój.`);
      io.to(roomName).emit('userList', roomUsers.map((user) => user.username));
      socket.leave(roomName);
    }
  });

  // Obsługa wyjścia użytkownika - usuń z wszystkich pokojów, do których należy
  socket.on('disconnect', () => {
    for (const roomName in rooms) {
      const roomUsers = rooms[roomName].users;
      const userIndex = roomUsers.findIndex((user) => user.id === socket.id);
      if (userIndex !== -1) {
        const username = roomUsers[userIndex].username;
        roomUsers.splice(userIndex, 1);
        sendMessageToRoom(roomName, 'Admin', `${username} opuścił pokój.`);
        io.to(roomName).emit('userList', roomUsers.map((user) => user.username));
        socket.leave(roomName);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Serwer czatu działa na porcie ${port}`);
});