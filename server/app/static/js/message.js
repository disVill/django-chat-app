const roomPk = JSON.parse(document.getElementById('room_pk').textContent);
const reqUserPk = JSON.parse(document.getElementById('req_user_pk').textContent);

const ws_scheme = window.location.protocol == 'https:' ? 'wss' : 'ws';
const chatSocket = new WebSocket(
  `${ws_scheme}://${window.location.host}/ws/chat/${roomPk}`
);

const escape_html_string = (string) => {
  if (typeof string !== 'string') return string;

  return string.replace(/[&'`"<>]/g, (match) => {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match];
  });
};

const getMyIcon = (icon) => {
  if (icon) {
    return `<img src="` + icon + `" class="message-sender-icon"/>`;
  } else {
    return `<svg class="message-sender-icon">
              <use xlink:href="#user_symbol"/>
            </svg>`
  };
};

const getPartnerIcon = (icon) => {
  if (icon) {
    return `<img src="${icon}" class="message-sender-icon partners"/>`;
  } else {
    return `<svg class="message-sender-icon partners">
              <use xlink:href="#user_symbol"/>
            </svg>`;
  }
};

const chatLog = document.getElementById('chat_log');
chatLog.scrollTop = chatLog.scrollHeight;

chatSocket.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.user_pk === reqUserPk) {
    const messageElement = `
      <div class="message-block-wrapper">
        <div class="icon-wrapper">
        `+ getMyIcon(data.icon_url) + `
        </div>
        <div class="message-text-block">
          <div class="message-content">${escape_html_string(data.message)}</div>
        </div>
      </div>
      <div class="message-send-at">
        <div class="send-at">${escape_html_string(data.send_at)}</div>
      </div>
    `;
    chatLog.insertAdjacentHTML('beforeend', messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
  } else {
    const messageElement = `
      <div class="message-block-wrapper partners">
        <div class="icon-wrapper">
        `+ getMyIcon(data.icon_url) + `
        </div>
        <div class="message-text-block partners-text-block">
          <div class="message-content">${escape_html_string(data.message)}</div>
        </div>
      </div>
      <div class="message-send-at">
        <div class="send-at">${escape_html_string(data.send_at)}</div>
      </div>
    `;
    chatLog.insertAdjacentHTML('beforeend', messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
  };
}

chatSocket.onclose = (e) => {
  console.error(e);
  console.error('Chat socket closed unexpectedly');
};

const messageInput = document.getElementById('message_input');
const messageSubmit = document.getElementById('message_submit');

messageInput.focus();

messageInput.onkeyup = (e) => {
  if (e.keyCode === 13) {
    messageSubmit.click();
  }
}

messageSubmit.onclick = () => {
  chatSocket.send(JSON.stringify({
    'message': messageInput.value,
    'user_pk': reqUserPk
  }));
  messageInput.value = '';
}

document.querySelector('.arrow').onclick = () => history.back(-1);
