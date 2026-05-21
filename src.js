let expression = '';
let showTime = true;
let darkMode = false;
let currentController = null;

const changelogBtn = document.getElementById('changelogBtn');
const changelogFrame = document.getElementById('changelogFrame');
const modalOverlay = document.getElementById('modalOverlay');

changelogBtn.addEventListener('click', () => {
    const isOpen = changelogFrame.style.display === 'flex';
    changelogFrame.style.display = isOpen ? 'none' : 'flex';
    modalOverlay.style.display = isOpen ? 'none' : 'block';
});

modalOverlay.addEventListener('click', () => {
    changelogFrame.style.display = 'none';
    modalOverlay.style.display = 'none';
});

const anontubeBtn = document.getElementById('anontubeBtn');
anontubeBtn.addEventListener('click', () => {
    window.open('YOUR_URL_HERE', '_blank');
});

function toggleTheme() {
    darkMode = !darkMode;
    const body = document.body;
    if (darkMode) {
        body.style.background = '#2e2e2e';
        document.getElementById('themeToggle').textContent = '🌙';
    } else {
        body.style.background = '#ffffff';
        document.getElementById('themeToggle').textContent = '🌞';
    }
}
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

function calculate() {
    try {
        let sanitized = expression
            .replace(/\/+/g, '/')
            .replace(/\*+/g, '*')
            .replace(/\++/g, '+');
        expression = eval(sanitized).toString().slice(0, 15);
    } catch {
        expression = 'Error';
    }
    document.getElementById('display').textContent = expression;
}

function press(value) {
    expression += value;
    document.getElementById('display').textContent = expression;
}

function clearDisplay() {
    expression = '';
    document.getElementById('display').textContent = '0';
}

setInterval(() => {
    if (showTime) {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        document.title = `⌛ Timpul este: ${hours}:${minutes}:${seconds} ${ampm}`;
    } else {
        document.title = 'Calc';
    }
}, 1000);

function toggleTitle() {
    showTime = !showTime;
}

function toggleAIFrame() {
    const frame = document.getElementById('aiFrame');
    frame.style.display = frame.style.display === 'flex' ? 'none' : 'flex';
}

const aiInput = document.getElementById('aiInput');
const aiBody = document.getElementById('aiBody');
const conversation = [
    { role: 'system', content: 'You are a chatbot that speaks Romanian only. Do NOT use any formatting like code blocks, math symbols, lists, bold, italics, or tables. Just write simple text sentences.' }
];

function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `ai-message ${type}`;
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = now.getHours().toString().padStart(2, '0') + ':' +
                            now.getMinutes().toString().padStart(2, '0');
    msg.textContent = text;
    msg.appendChild(timestamp);
    aiBody.appendChild(msg);
    aiBody.scrollTop = aiBody.scrollHeight;
}

function clearChat() {
    aiBody.innerHTML = '';
    conversation.splice(1);
    aiInput.disabled = false;
    aiInput.focus();
    currentController?.abort();
}

aiInput.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = aiInput.value.trim();
        if (!text) return;

        addMessage(text, 'user-msg');
        aiInput.value = '';
        aiInput.disabled = true;
        conversation.push({ role: 'user', content: text });

        const typingMsg = document.createElement('div');
        typingMsg.className = 'ai-message ai-msg typing';
        typingMsg.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        aiBody.appendChild(typingMsg);
        aiBody.scrollTop = aiBody.scrollHeight;

        try {
            const model = 'gemini-2.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

            const geminiContents = conversation
                .filter(msg => msg.role !== 'system')
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

            currentController = new AbortController();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': 'AIzaSyD2BBb6BYxn7DO73VcH6l2VizNesuiIzg4',
                    'Content-Type': 'application/json',
                },
                signal: currentController.signal,
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: conversation[0].content }]
                    },
                    contents: geminiContents
                }),
            });

            const data = await response.json();

            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
                || data.error?.message
                || "No response";

            conversation.push({ role: 'assistant', content: reply });
            typingMsg.remove();
            addMessage(reply, 'ai-msg');
        } catch(err) {
            typingMsg.remove();
            if (err.name !== 'AbortError') {
                addMessage("Error: " + err.message, 'ai-msg');
            }
        } finally {
            aiInput.disabled = false;
            aiInput.focus();
        }
    }
});
