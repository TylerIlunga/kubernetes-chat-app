/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./server
 *  Purpose       :  Module for the server.
 *  Author        :  Tyler Ilunga
 *  Date          :  2019-04-19
 *  Description   :  Module that initializes the server for the API
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// NOTE: require("dotenv").load() for command line operation
// of loading in environment variables for private files
const config = require('../config');
const app = require('http').createServer((req, res) => {
  console.log('server created.');
});
app.listen(config.port, err => {
  if (err) return console.error('server load error:', err);
  console.log(`listening on port ${config.port}`);
});

const io = require('socket.io').listen(app);
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: config.redis.host, port: config.redis.port }));

const userData = { room: null };

/** Helper Methods */
const logEventDetails = (eventName, data) => {
  console.log(`${eventName} event fired: `, data);
};

const dataAsBytes = data => {
  return config.toUTF8Array(JSON.stringify(data));
};

const fromBytesToObject = data => {
  return JSON.parse(config.fromUTF8Array(data));
};

const publish = (room, socket, jsonData) => {
  console.log(`Room ${room} to receive message: `, jsonData);
  switch (jsonData.type) {
    case 'self':
      return socket.emit(jsonData.method, jsonData.data);
    case 'allConnectedToServer':
      return io.sockets.emit(jsonData.method, jsonData.data);
    case 'allConnectedToRoom':
      return io.in(room).emit(jsonData.method, jsonData.data);
  }
};

const joinRoom = (socket, data) => {
  const room = data.roomID;
  console.log('room id: ', room);
  socket.join(room);
  userData.room = room;
  userData[socket.id] = data.username;
  publish(room, socket, {
    type: 'self',
    method: 'connectedToRoom',
    data: dataAsBytes({
      room,
      username: data.username,
    }),
  });
};

const sendMessage = (data, socket) => {
  logEventDetails('sendMessage', data);
  publish(userData.room, socket, {
    type: 'allConnectedToRoom',
    method: 'roomNotification',
    data: dataAsBytes({
      type: 'messageReceived',
      message: {
        id: data.id,
        username: data.username,
        message: data.message,
        likes: 0,
      }, // { username: string, message: string }
    }),
  });
};

const likeMessage = (data, socket) => {
  logEventDetails('commentMessage', data);
  publish(userData.room, socket, {
    type: 'allConnectedToRoom',
    method: 'roomNotification',
    data: dataAsBytes({
      type: 'messageLiked',
      message: {
        id: data.id,
        username: data.username,
        message: data.message,
      },
    }),
  });
};

const leaveRoom = (data, socket) => {
  logEventDetails('commentMessage', data);
  publish(userData.room, socket, {
    type: 'allConnectedToRoom',
    method: 'roomNotification',
    data: dataAsBytes({
      type: 'userLeftRoom',
      username: data.username, // String
    }),
  });
};

io.sockets.on('connection', socket => {
  console.log(`User ${socket.id} connected to open socket`);
  if (userData.room) {
    socket.join(userData.room);
  }
  io.sockets.emit(
    'totalUsers',
    dataAsBytes({
      totalUsers: Object.keys(io.sockets.sockets).length,
    }),
  );
  socket.on('joinRoom', data => {
    data = fromBytesToObject(data);
    logEventDetails('joinRoom', data);
    const allRooms = Object.keys(io.sockets.adapter.rooms);
    console.log('allRooms', allRooms);
    if (!allRooms.includes(data.roomID)) {
      io.emit('error', dataAsBytes({ message: 'Room does not exist!' }));
      return;
    }
    joinRoom(socket, data);
    publish(userData.room, socket, {
      type: 'allConnectedToRoom',
      method: 'message',
      data: `User ${data.username} has entered the room`,
    });
  });
  socket.on('createRoom', data => {
    data = fromBytesToObject(data);
    logEventDetails('createRoom', data);
    joinRoom(socket, data);
  });
  socket.on('roomEvent', data => {
    data = fromBytesToObject(data);
    switch (data.type) {
      case 'sendMessage':
        return sendMessage(data, socket);
      case 'likeMessage':
        return likeMessage(data, socket);
      case 'leaveRoom':
        return leaveRoom(data, socket);
    }
  });
});
