const ws = new WebSocket('ws://localhost:3000');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

ws.onmessage = (event) => {
    const messages = JSON.parse(event.data);
    messagesDiv.innerHTML = messages.map(msg => `
        <div class="message">
            <div>${msg.content}</div>
            <div class="actions">
                <button onclick="editMessage('${msg.id}')">✏️</button>
                <button onclick="deleteMessage('${msg.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
};

function sendMessage() {
    const content = messageInput.value.trim();
    if (content) {
        ws.send(JSON.stringify({
            action: 'CREATE',
            content: content
        }));
        messageInput.value = '';
    }
}

function editMessage(id) {
    const newContent = prompt('Edit message:');
    if (newContent !== null) {
        ws.send(JSON.stringify({
            action: 'UPDATE',
            id: id,
            content: newContent
        }));
    }
}

function deleteMessage(id) {
    if (confirm('Delete this message?')) {
        ws.send(JSON.stringify({
            action: 'DELETE',
            id: id
        }));
    }
}

// Handle Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});