import { CONFIG } from './config.js';

let chatHistory = []; 

const chatBox = document.getElementById('chat-box');
const input = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-key');

window.onload = () => {
    if (!CONFIG.getApiKey()) {
        const key = prompt("Zapia v3: Insira sua Groq API Key:");
        if (key) {
            CONFIG.setApiKey(key);
            location.reload();
        }
    }
    
    const saved = localStorage.getItem('zapia_v3_history');
    if (saved) {
        chatBox.innerHTML = saved;
        setTimeout(scrollToBottom, 300);
    }
    input.focus();
};

async function sendMessage() {
    const text = input.value.trim();
    if (!text || !CONFIG.getApiKey()) return;

    appendMessage('user', text);
    input.value = '';
    
    chatHistory.push({ role: 'user', content: text });
    if (chatHistory.length > 10) chatHistory.shift();

    try {
        const response = await fetch(CONFIG.ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.getApiKey()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [{ role: 'system', content: CONFIG.SYSTEM_PROMPT }, ...chatHistory],
                stream: true
            })
        });

        const aiDiv = appendMessage('assistant', '');
        const aiText = aiDiv.querySelector('p');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const json = JSON.parse(line.substring(6));
                        const content = json.choices[0].delta.content;
                        if (content) {
                            fullResponse += content;
                            aiText.innerText = fullResponse;
                            scrollToBottom();
                        }
                    } catch (e) {}
                }
            }
        }

        chatHistory.push({ role: 'assistant', content: fullResponse });
        localStorage.setItem('zapia_v3_history', chatBox.innerHTML);

    } catch (err) {
        appendMessage('assistant', 'Erro na conexão. Verifique sua chave.');
    }
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', () => {
    sendMessage();
    input.focus();
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
        if (window.innerWidth > 768) {
            input.focus();
        } else {
            input.blur();
        }
    }
});

resetBtn.onclick = () => { 
    if(confirm("Deseja resetar sua API Key?")) {
        localStorage.removeItem('ZAPIA_KEY'); 
        location.reload(); 
    }
};
