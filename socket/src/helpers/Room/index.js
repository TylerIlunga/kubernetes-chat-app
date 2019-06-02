class Room {
  constructor(io, converter) {
    this.io = io;
    this.Converter = converter;
  }

  publish(room, socket, jsonData) {
    console.log(`Room ${room} to receive message: `, jsonData);
    switch (jsonData.type) {
      case 'self':
        return socket.emit(jsonData.method, jsonData.data);
      case 'allConnectedToServer':
        return this.io.sockets.emit(jsonData.method, jsonData.data);
      case 'allConnectedToRoom':
        return this.io.in(room).emit(jsonData.method, jsonData.data);
    }
  }

  joinRoom(socket, eventData, userData, log) {
    const room = eventData.roomID;
    log('joining a room(join/create)', eventData);
    console.log('room id: ', room);
    socket.join(room);
    userData.room = room;
    this.publish(room, socket, {
      type: 'self',
      method: 'connectedToRoom',
      data: this.Converter.dataAsBytes({
        room,
        username: eventData.username,
      }),
    });
  }

  sendMessage(socket, eventData, userData, log) {
    log('sendMessage', eventData);
    const username = eventData.username;
    this.publish(userData.room, socket, {
      type: 'allConnectedToRoom',
      method: 'roomNotification',
      data: this.Converter.dataAsBytes({
        type: 'messageReceived',
        message: {
          username,
          id: eventData.id,
          message: eventData.message,
          likes: 0,
        },
      }),
    });
  }

  likeMessage(socket, eventData, userData, log) {
    log('commentMessage', eventData);
    this.publish(userData.room, socket, {
      type: 'allConnectedToRoom',
      method: 'roomNotification',
      data: this.Converter.dataAsBytes({
        type: 'messageLiked',
        message: {
          id: eventData.id,
          username: eventData.username,
          message: eventData.message,
        },
      }),
    });
  }

  leaveRoom(socket, eventData, userData, log) {
    log('commentMessage', eventData);
    this.publish(userData.room, socket, {
      type: 'allConnectedToRoom',
      method: 'roomNotification',
      data: this.Converter.dataAsBytes({
        type: 'userLeftRoom',
        username: eventData.username,
      }),
    });
  }
}

module.exports = Room;
