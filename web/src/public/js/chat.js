(() => {
  setTimeout(() => {
    document
      .getElementById('chat-input')
      .addEventListener('keyup', function(e) {
        const event = e || window.event;
        const charCode = event.which || event.keyCode;
        const username = document.getElementById('chat-input').placeholder;
        if (charCode === 13) sendMessage(username);
      });
  }, 100);
})();

const sendMessage = username => {
  console.log('sendMessage()', username);
  const message = document.getElementById('chat-input').value;
  socket.emit(
    'roomEvent',
    dataAsBytes({
      message,
      username,
      type: 'sendMessage',
      id: genMessageId(),
      likes: 0,
    }),
  );
};

const likeMessage = (username, message, id) => {
  console.log('likeMessage()', username, message, id);
  socket.emit(
    'roomEvent',
    dataAsBytes({
      type: 'likeMessage',
      id,
      username,
      message,
    }),
  );
};

const leaveRoom = messageData => {
  console.log('leaveRoom()', messageData);
  socket.emit(
    'roomEvent',
    dataAsBytes({
      type: 'leaveRoom',
      username: messageData.username,
    }),
  );
};

let messages = [];
const populateMessages = message => {
  console.log('populateMessages()', message);
  if (message) {
    messages.push(message);
  }
  const ejsTemplate = `
  <% messages.forEach(function(message){ %>
    <div class="message-container">
        <div class="message-displayed">
         <p class="message-user"><%- message.username %>: <%- message.message %></p>
        </div> 
        <div id="heart-img" onClick="likeMessage('<%- message.username %>', '<%- message.message %>', '<%- message.id %>')">
            <i class="fa fa-heart red"></i> <%= message.likes%>
        </div>
    </div>
  <% }); %>
  `;
  const html = ejs.render(ejsTemplate, { messages });
  console.log(html);
  document.getElementById('messages').innerHTML = html;
};

const updateMessageLikeCount = message => {
  console.log('updateMessageLikeCount()', message);
  messages = messages.map(m => {
    if (
      m.username === message.username &&
      m.message === message.message &&
      m.id &&
      message.id
    ) {
      return { ...m, likes: m.likes + 1 };
    }
    return m;
  });
  populateMessages(null);
};

const notifyUserLeftRoom = username => {
  console.log('notifyUserLeftRoom()', username);
  document.getElementById(
    'roomAlert',
  ).innerHTML = `${username} has left the chat.`;
};
