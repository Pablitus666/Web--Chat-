// app/ui.js

// Este módulo maneja toda la manipulación directa del DOM.

const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("message-input");
const secretKeyInput = document.getElementById("secret-key-input");
const nicknameInput = document.getElementById("nickname-input");

// Paleta de colores para alias que no son Mr. Green/Blue
const customAliasColors = [
    '#FFD700', // Gold
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#FFA500', // Orange
    '#00FF7F', // SpringGreen
    '#ADFF2F', // GreenYellow
    '#FF6347'  // Tomato
];

// Función para obtener la clase de color basada en el alias
function getAliasColorClass(alias) {
    const lowerCaseAlias = alias.toLowerCase();
    if (lowerCaseAlias.includes('green')) return 'sender-green';
    if (lowerCaseAlias.includes('blue')) return 'sender-blue';

    // Genera un hash simple para el alias para elegir un color consistente
    let hash = 0;
    for (let i = 0; i < alias.length; i++) {
        hash = alias.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % customAliasColors.length;
    return `sender-custom-${colorIndex}`;
}


/**
 * Añade una línea de texto o un objeto de mensaje a la ventana de chat.
 * @param {string|{sender: string, text: string}} content El contenido a mostrar.
 * @param {string} type El tipo de línea (system, message, error, etc.).
 */
export function appendOutput(content, type) {
    const line = document.createElement("div");
    line.className = `output-line ${type}`;

    if (type === 'message' && typeof content === 'object') {
        // Crea elementos separados para el remitente y el texto
        const senderSpan = document.createElement("span");
        senderSpan.className = "sender";
        senderSpan.textContent = `${content.sender}: `;

        // Añade una clase de color basada en el alias
        const colorClass = getAliasColorClass(content.sender);
        senderSpan.classList.add(colorClass);
        
        const textSpan = document.createElement("span");
        textSpan.className = "message-text";
        textSpan.textContent = content.text;

        line.appendChild(senderSpan);
        line.appendChild(textSpan);
    } else {
        // Para mensajes de sistema y otros, solo muestra el texto.
        line.textContent = content;
    }

    chatWindow.appendChild(line);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

export function clearChatWindow() {
    chatWindow.innerHTML = '';
}

export function enableChat() {
    messageInput.disabled = false;
    messageInput.focus();
}

export function disableChat() {
    messageInput.disabled = true;
}

export function getMessageValue() {
    return messageInput.value.trim();
}

export function clearMessageInput() {
    messageInput.value = "";
}

export function getSecretKeyValue() {
    return secretKeyInput.value.trim();
}

export function setSecretKeyValue(key) {
    secretKeyInput.value = key;
}

export function getNicknameValue() {
    return nicknameInput.value.trim();
}

export function setNicknameValue(name) {
    nicknameInput.value = name;
}

export function lockSecretKeyInput() {
    secretKeyInput.disabled = true;
}

export function lockAliasInput() {
    nicknameInput.disabled = true;
}
