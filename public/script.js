const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const fileInput = document.getElementById('file-input');
const fileButton = document.getElementById('file-button');
const imagePreviewContainer = document.getElementById('image-preview-container');

let conversation = [];
let attachedFile = null;

const converter = new showdown.Converter();

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

  // Simulasi dummy balasan bot (placeholder)
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
