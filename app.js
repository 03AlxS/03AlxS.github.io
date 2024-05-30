const chatHistory = document.getElementById('chatHistory');
const inputPrompt = document.getElementById('inputPrompt');
const sendButton = document.getElementById('sendButton');

const apiKey = 'AIzaSyBirPxbUFg9I2NdcZbRHfTEL4hBbQESNno';
const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

sendButton.addEventListener('click', sendPrompt);

function sendPrompt() {
  const prompt = inputPrompt.value.trim();
  if (prompt === '') return;

  addMessageToChat('You', prompt);
  inputPrompt.value = '';
  toggleLoadingState(true);

  fetch(endpoint + '?key=' + apiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": prompt
            }
          ]
        }
      ]
    })
  })
  .then(response => response.json())
  .then(data => {
    toggleLoadingState(false);
    handleApiResponse(data);
  })
  .catch(error => {
    console.error('Error:', error);
    toggleLoadingState(false);
    addMessageToChat('Economia-GPT', 'Lo siento, ocurrió un error al procesar tu solicitud.');
  });
}

function handleApiResponse(data) {
  if (data.error) {
    console.error('Error de API:', data.error);
    addMessageToChat('Economia-GPT', `Error: ${data.error.message}`);
  } else if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    const generatedText = data.candidates[0].content.parts[0].text;
    addMessageToChat('Economia-GPT', generatedText);
  } else {
    console.error('Respuesta inesperada:', data);
    addMessageToChat('Economia-GPT', 'Lo siento, ocurrió un error al procesar tu solicitud.');
  }
}

function addMessageToChat(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message');
  if (sender === 'You') {
    messageElement.classList.add('user-message');
  } else {
    messageElement.classList.add('bot-message');
  }
  messageElement.innerHTML = `<strong>${sender}:</strong> ${markdownToHTML(message)}`;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function markdownToHTML(text) {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /\*(.*?)\*/g;
  const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g;
  const listRegex = /\* (.*?)(?:\n|$)/g;

  text = text.replace(boldRegex, '<strong>$1</strong>');
  text = text.replace(italicRegex, '<em>$1</em>');
  text = text.replace(boldItalicRegex, '<strong><em>$1</em></strong>');
  text = text.replace(listRegex, '<li>$1</li>');
  text = text.replace(/<li>(.*?)<\/li>/g, '<ul>$&</ul>');

  return text;
}

function toggleLoadingState(isLoading) {
  if (isLoading) {
    sendButton.classList.add('loading');
    sendButton.disabled = true;
  } else {
    sendButton.classList.remove('loading');
    sendButton.disabled = false;
  }
}
