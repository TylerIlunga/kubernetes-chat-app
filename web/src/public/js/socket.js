const socket = io('http://localhost:2222');

socket.on('totalUsers', data => {
  console.log(data);
  data = fromBytesToObject(data);
  document.getElementById('totalUsers').innerHTML = data.totalUsers;
});

socket.on('connectedToRoom', data => {
  data = fromBytesToObject(data);
  console.log('data:', data);
  document.location.href = `http://localhost:4444/chat?username=${
    data.username
  }&room=${data.room}`;
});

socket.on('roomNotification', data => {
  data = fromBytesToObject(data);
  console.log('roomNotification()', data);
  switch (data.type) {
    case 'messageReceived':
      return populateMessages(data.message);
    case 'messageLiked':
      return updateMessageLikeCount(data.message);
    case 'userLeftRoom':
      return notifyUserLeftRoom(data.username);
  }
});
