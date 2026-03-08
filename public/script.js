const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const fileInput = document.getElementById('file-input');
const fileButton = document.getElementById('file-button');
const imagePreviewContainer = document.getElementById('image-preview-container');
const newChatBtn = document.getElementById('new-chat-btn');
const historyList = document.getElementById('history-list');

let conversation = [];
let attachedFile = null;
let currentSessionId = null;

const converter = new showdown.Converter();
const STORAGE_KEY = 'mealplanner_sessions';

// ---- LocalStorage Helpers ----

function getAllSessions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveAllSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function generateId() {
  return Date.now().toString();
}

function saveCurrentSession() {
  if (conversation.length === 0) return;

  const sessions = getAllSessions();
  const firstUserMsg = conversation.find(m => m.role === 'user');
  const title = firstUserMsg ? firstUserMsg.text.slice(0, 40) + (firstUserMsg.text.length > 40 ? '...' : '') : 'Sesi Baru';
  const existing = sessions.findIndex(s => s.id === currentSessionId);

  const sessionData = {
    id: currentSessionId,
    title,
    updatedAt: new Date().toISOString(),
    conversation,
  };

  if (existing >= 0) {
    sessions[existing] = sessionData;
  } else {
    sessions.unshift(sessionData);
  }

  saveAllSessions(sessions);
  renderSidebar();
}

function renderSidebar() {
  const sessions = getAllSessions();
  historyList.innerHTML = '';

  if (sessions.length === 0) {
    historyList.innerHTML = '<li class="no-history">Belum ada riwayat.</li>';
    return;
  }

  sessions.forEach(session => {
    const li = document.createElement('li');
    li.classList.add('history-item');
    if (session.id === currentSessionId) li.classList.add('active');

    li.innerHTML = `
      <span class="history-title">${session.title}</span>
      <button class="delete-session" data-id="${session.id}" title="Hapus">&#10005;</button>
    `;

    li.querySelector('.history-title').addEventListener('click', () => loadSession(session.id));
    li.querySelector('.delete-session').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSession(session.id);
    });

    historyList.appendChild(li);
  });
}

function loadSession(id) {
  saveCurrentSession();
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (!session) return;

  currentSessionId = id;
  conversation = [...session.conversation];
  chatBox.innerHTML = '';

  session.conversation.forEach(({ role, text }) => {
    appendMessage(role === 'user' ? 'user' : 'bot', text);
  });

  renderSidebar();
}

function deleteSession(id) {
  let sessions = getAllSessions();
  sessions = sessions.filter(s => s.id !== id);
  saveAllSessions(sessions);

  if (id === currentSessionId) {
    startNewChat(false);
  } else {
    renderSidebar();
  }
}

function startNewChat(saveCurrent = true) {
  if (saveCurrent) saveCurrentSession();
  conversation = [];
  currentSessionId = generateId();
  chatBox.innerHTML = '';
  renderSidebar();
}

// ---- Init ----
currentSessionId = generateId();
renderSidebar();

// ---- Event Listeners ----

newChatBtn.addEventListener('click', () => startNewChat());

fileButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    attachedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewContainer.innerHTML = `
        <div class="image-preview">
          <img src="${e.target.result}" alt="Image preview" />
          <span class="remove-image">x</span>
        </div>
      `;
      imagePreviewContainer.querySelector('.remove-image').addEventListener('click', () => {
        attachedFile = null;
        imagePreviewContainer.innerHTML = '';
        fileInput.value = '';
      });
    };
    reader.readAsDataURL(file);
  }
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage && !attachedFile) return;

  const formData = new FormData();
  formData.append('prompts', userMessage);

  let imageUrl = null;
  if (attachedFile) {
    formData.append('document', attachedFile);
    if (attachedFile.type.startsWith('image/')) {
      imageUrl = URL.createObjectURL(attachedFile);
    }
  }

  appendMessage('user', userMessage, imageUrl);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';
  imagePreviewContainer.innerHTML = '';
  attachedFile = null;
  fileInput.value = '';

  appendMessage('bot', 'Chatbot is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    const { result } = await response.json();
    const lastBotMessage = chatBox.querySelector('.message.bot:last-child');
    lastBotMessage.innerHTML = converter.makeHtml(result);
    conversation.push({ role: 'model', text: result });

    saveCurrentSession();
  } catch (error) {
    const lastBotMessage = chatBox.querySelector('.message.bot:last-child');
    lastBotMessage.textContent = 'Oops! Something went wrong. Please try again.';
    console.error(error);
  }
});

function appendMessage(sender, text, imageUrl = null) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'user') {
    if (text) {
      const textNode = document.createElement('div');
      textNode.textContent = text;
      msg.appendChild(textNode);
    }
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '10px';
      img.style.marginTop = text ? '10px' : '0';
      msg.appendChild(img);
    }
  } else {
    msg.innerHTML = converter.makeHtml(text);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(sender, text, imageUrl = null) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'user') {
    if (text) {
      const textNode = document.createElement('div');
      textNode.textContent = text;
      msg.appendChild(textNode);
    }
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '10px';
      img.style.marginTop = text ? '10px' : '0';
      msg.appendChild(img);
    }
  } else {
    msg.innerHTML = converter.makeHtml(text);
  }
  
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
