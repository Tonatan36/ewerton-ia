// ~/zapia-v3/js/config.js
export const CONFIG = {
    // A chave será buscada do localStorage para segurança total
    getApiKey: () => localStorage.getItem('ZAPIA_KEY') || "",
    setApiKey: (key) => localStorage.setItem('ZAPIA_KEY', key),
    
    MODEL: "llama-3.3-70b-versatile",
    ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
    
    SYSTEM_PROMPT: "Você é Zapia, assistente de Ewerton. Seja técnico, direto e use emojis de tecnologia. 🚀"
};
