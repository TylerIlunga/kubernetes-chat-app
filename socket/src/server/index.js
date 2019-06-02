/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./server
 *  Purpose       :  Module for the chat's socket server.
 *  Author        :  Tyler Ilunga
 *  Date          :  2019-06-02
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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

const c = require('../helpers/Converter');
const Converter = new c();
const r = require('../helpers/Room');
const Room = new r(io, Converter);

const userData = { room: null };

/** Helper Methods */

io.sockets.on('connection', socket => {
  console.log(`User ${socket.id} connected to open socket`);
  if (userData.room) {
    socket.join(userData.room);
  }
  io.sockets.emit(
    'totalUsers',
    Converter.dataAsBytes({
      totalUsers: Object.keys(io.sockets.sockets).length,
    }),
  );
  socket.on('joinRoom', data => {
    data = Converter.fromBytesToObject(data);
    const allRooms = Object.keys(io.sockets.adapter.rooms);
    console.log('allRooms', allRooms);
    if (!allRooms.includes(data.roomID)) {
      io.emit(
        'error',
        Converter.dataAsBytes({ message: 'Room does not exist!' }),
      );
      return;
    }
    Room.joinRoom(socket, data, userData, config.logEventDetails);
    Room.publish(userData.room, socket, {
      type: 'allConnectedToRoom',
      method: 'message',
      data: `User ${data.username} has entered the room`,
    });
  });
  socket.on('createRoom', data => {
    data = Converter.fromBytesToObject(data);
    Room.joinRoom(socket, data, userData, config.logEventDetails);
  });
  socket.on('roomEvent', data => {
    data = Converter.fromBytesToObject(data);
    switch (data.type) {
      case 'sendMessage':
        return Room.sendMessage(socket, data, userData, config.logEventDetails);
      case 'likeMessage':
        return Room.likeMessage(socket, data, userData, config.logEventDetails);
      case 'leaveRoom':
        return Room.leaveRoom(socket, data, userData, config.logEventDetails);
    }
  });
});
