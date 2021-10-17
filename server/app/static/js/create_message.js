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

const modal = document.getElementById('modal');
const user_list = document.getElementById('user_list');
const input_name_element = document.getElementById('input_name')

document.getElementById('display_modal').addEventListener('click', () => {
  modal.style.display = 'flex';
  input_name_element.value = '';
  input_name_element.focus();
  while (user_list.firstChild) {
    user_list.removeChild(user_list.firstChild);
  }
});

document.getElementById('exit_button').addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target == modal) modal.style.display = 'none';
});

const getIcon = (icon) => {
  if (icon) {
    return `<img src="` + icon + `" class="modal-user-icon"/>`;
  } else {
    return `
      <div class="modal-default-usericon">
        <i class="fas fa-user"></i>
      </div>
    `;
  }
};

const create_user_dom = (data) => {
  return `
    <div class="modal-user" id="${data.id}">
      ${data.is_following ? '<div class="user-is-following">Following</div>' : ''}
      <div class="modal-user-wrapper">
        <div class="modal-user-icon">${getIcon(data.icon_url)}</div>
        <div class="modal-username-wrapper">
          <div class="modal-display-name">${escape_html_string(data.display_name)}</div>
          <div class="modal-username">@${escape_html_string(data.username)}</div>
        </div>
      </div>
    </div>
  `
};

input_name_element.addEventListener('keyup', () => {
  const input = input_name_element.value.trim();
  if (!input) {
    while (user_list.firstChild) {
      user_list.removeChild(user_list.firstChild);
    }
    return;
  }
  fetch(`../users?name=${input}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(response => {
    while (user_list.firstChild) {
      user_list.removeChild(user_list.firstChild);
    }
    response.forEach(data => {
      user_list.innerHTML += create_user_dom(data);
    })
    Array.from(user_list.childNodes).forEach((child) => {
      child.addEventListener('click', () => {
        fetch(`../room_redirect/${child.id}?json=true`, {method: 'GET'})
        .then(response => {
          if (response.status >= 400) throw('error');
          return response.json();
        })
        .then(response => window.location.href = `../rooms/${response.room_pk}`)
        .then(console.error)
      });
    });
  })
  .catch(console.error);
})
