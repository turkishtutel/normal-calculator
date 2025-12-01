let expression = '';
let showTime = true;
let darkMode = false;

const changelogBtn = document.getElementById('changelogBtn');
const changelogFrame = document.getElementById('changelogFrame');
const modalOverlay = document.getElementById('modalOverlay');
const musicplayer = document.getElementById('musictoggle')
const music = document.getElementById('bgMusic')

changelogBtn.addEventListener('click', () => {
    const isOpen = changelogFrame.style.display === 'flex';
    changelogFrame.style.display = isOpen ? 'none' : 'flex';
    modalOverlay.style.display = isOpen ? 'none' : 'block';
});

modalOverlay.addEventListener('click', () => {
    changelogFrame.style.display = 'none';
    modalOverlay.style.display = 'none';
});

function toggleTheme() {
    darkMode = !darkMode;
    const body = document.body;
    if(darkMode){
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
            .replace(/\++/g, '+')
            .replace(/-+/g, '-');
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

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2,'0');
    const seconds = now.getSeconds().toString().padStart(2,'0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    if(showTime) {
        document.title = `⌛ Timpul este: ${hours}:${minutes}:${seconds}${ampm}`;
    }
}

function tickClock() {
    updateClock();
    requestAnimationFrame(tickClock);
}
tickClock();

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateClock();
});

let lastTitle = document.title;
let lastUpdate = Date.now();

setInterval(() => {
  if (document.title !== lastTitle) {
    lastTitle = document.title;
    lastUpdate = Date.now();
  }
  if (Date.now() - lastUpdate > 5000) {
    location.reload();
  }
}, 2000);
    
function toggleTitle() {
    showTime = !showTime;
    if(!showTime) document.title = "Calc";
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
    timestamp.textContent = now.getHours().toString().padStart(2,'0')+':' +
                            now.getMinutes().toString().padStart(2,'0');
    msg.textContent = text;
    msg.appendChild(timestamp);
    aiBody.appendChild(msg);
    aiBody.scrollTop = aiBody.scrollHeight;
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
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer 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',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-20b:free',
                    messages: conversation
                }),
            });
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content 
                || data.error?.message 
                || "No response";
            conversation.push({ role: 'assistant', content: reply });
            typingMsg.remove();
            addMessage(reply, 'ai-msg');
        } catch(err) {
            typingMsg.remove();
            addMessage("Error: " + err.message, 'ai-msg');
        } finally {
            aiInput.disabled = false;
            aiInput.focus();
        }
    }
});

musicplayer.addEventListener('click', () => {
    if (music.paused) {
        music.play();
        musicplayer.textContent = "⏸";
    } else {
        music.pause();
        musicplayer.textContent = "▶"
    }
})
