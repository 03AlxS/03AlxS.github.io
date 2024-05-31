import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const chatHistory = document.getElementById("chatHistory");
const inputPrompt = document.getElementById("inputPrompt");
const sendButton = document.getElementById("sendButton");
const resetButton = document.getElementById("resetButton");

const apiKey = "AIzaSyBirPxbUFg9I2NdcZbRHfTEL4hBbQESNno";
const genAI = new GoogleGenerativeAI(apiKey);

let chatSession = genAI
  .getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction:
      "Eres un asistente virtual para resolver preguntas sobre economía y finanzas.",
  })
  .startChat({
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 64,
      responseMimeType: "text/plain",
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    history: [],
  });

sendButton.addEventListener("click", sendPrompt);
resetButton.addEventListener("click", resetChat);

function formatApiResponse(response) {
  response = response.trim();

  // Convertir Markdown a HTML
  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /\*(.*?)\*/g;
  const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g;
  const listRegex = /\* (.*?)(?:\n|$)/g;

  response = response.replace(boldRegex, "<strong>$1</strong>");
  response = response.replace(italicRegex, "<em>$1</em>");
  response = response.replace(boldItalicRegex, "<strong><em>$1</em></strong>");
  response = response.replace(listRegex, "<li>$1</li>");
  response = response.replace(/<li>(.*?)<\/li>/g, "<ul>$&</ul>");

  return response;
}

window.addEventListener("load", function () {
  resetChat();
  toggleButtonVisibility();
});

function sendPrompt() {
  const prompt = inputPrompt.value.trim();
  if (prompt === "") return;

  addMessageToChat("You", prompt);
  inputPrompt.value = "";
  inputPrompt.disabled = true; // Deshabilitar la entrada de texto
  toggleLoadingState(true);

  chatSession
    .sendMessage(prompt)
    .then((result) => {
      toggleLoadingState(false);
      const response = result.response.text();
      const formattedResponse = formatApiResponse(response);
      addMessageToChat("Economia-GPT", formattedResponse);
      toggleButtonVisibility();
      inputPrompt.disabled = false; // Habilitar la entrada de texto nuevamente
    })
    .catch((error) => {
      console.error("Error:", error);
      toggleLoadingState(false);
      addMessageToChat(
        "Economia-GPT",
        "Lo siento, ocurrió un error al procesar tu solicitud."
      );
      toggleButtonVisibility();
      inputPrompt.disabled = false; // Habilitar la entrada de texto nuevamente
    });
}

function resetChat() {
  chatSession = genAI
    .getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction:
        "Eres un asistente virtual para resolver preguntas sobre economía y finanzas.",
    })
    .startChat({
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      history: [],
    });

  chatHistory.innerHTML = "";
  addMessageToChat("Economia-GPT", "¡Hola! ¿En qué puedo ayudarte?");
  toggleButtonVisibility();
}

function addMessageToChat(sender, message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");
  if (sender === "You") {
    messageElement.classList.add("user-message");
  } else {
    messageElement.classList.add("bot-message");
  }
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function toggleLoadingState(isLoading) {
  if (isLoading) {
    sendButton.classList.add("loading");
    sendButton.disabled = true;
  } else {
    setTimeout(() => {
      sendButton.classList.remove("loading");
      sendButton.disabled = false;
      toggleButtonVisibility();
    }, 500);
  }
}

inputPrompt.addEventListener("input", function () {
  toggleButtonVisibility();
});

function toggleButtonVisibility() {
  if (inputPrompt.value.trim() === "") {
    sendButton.style.display = "none";
    resetButton.style.display = "inline-block";
  } else {
    sendButton.style.display = "inline-block";
    resetButton.style.display = "none";
  }
}
