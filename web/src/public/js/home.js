const roomOptionChoice = (isCreate, isJoin) => {
  document.getElementById('room-option-create').checked = isCreate;
  document.getElementById('room-option-join').checked = isJoin;
};

const joinRoom = () => {
  console.log('joinRoom()');
  const username = document.getElementById('username').value;
  const createChoice = document.getElementById('room-option-create');
  const joinChoice = document.getElementById('room-option-join');
  if (!(createChoice.checked || joinChoice.checked) && username.length === 0)
    return;
  console.log('joinRoom()');
  const choice = createChoice.checked ? 'create' : 'join';
  const roomID = document.getElementById('roomID').value;
  socket.emit(
    `${choice}Room`,
    dataAsBytes({
      username,
      roomID,
    }),
  );
};
