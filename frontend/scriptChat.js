// CONFIGURATION
const API_KEY = "AIzaSyBVkA8RIK29KnHXvxNAJ5ZS-YbwOGF8B4Q"; // Paste your API key here
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatbotPopup = document.getElementById("chatbot-popup");

// Toggle Chat Popup Visibility
function toggleChatbot() {
    chatbotPopup.style.display = chatbotPopup.style.display === "block" ? "none" : "block";
}

// Function to create a chat message list item
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = `<div>${message}</div>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

// Function to call Gemini API
const generateResponse = async (userMessage) => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatBox.appendChild(incomingChatLi);
    chatBox.scrollTo(0, chatBox.scrollHeight);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: userMessage }] 
                }]
            }),
        });

        const data = await response.json();
        const botMessage = data.candidates[0].content.parts[0].text;
        
        // Update the "Thinking..." message with the actual response
        incomingChatLi.querySelector("p").textContent = botMessage;

    } catch (error) {
        incomingChatLi.querySelector("p").textContent = "Oops! Something went wrong. Please try again.";
        console.error("Error:", error);
    } finally {
        chatBox.scrollTo(0, chatBox.scrollHeight);
    }
};

// Handle User Input
const handleChat = () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Append user message
    chatBox.appendChild(createChatLi(userMessage, "outgoing"));
    chatBox.scrollTo(0, chatBox.scrollHeight);
    
    // Clear input
    userInput.value = "";

    // Generate Bot Response
    setTimeout(() => {
        generateResponse(userMessage);
    }, 600);
};

// Event Listeners
sendBtn.addEventListener("click", handleChat);

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});