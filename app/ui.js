// app/ui.js

// Este módulo maneja toda la manipulación directa del DOM.

const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("message-input");
const secretKeyInput = document.getElementById("secret-key-input");
const nicknameInput = document.getElementById("nickname-input");
const generateBtn = document.getElementById('generate-key-btn');
const copyBtn = document.getElementById('copy-key-btn');
const toggleBtn = document.getElementById('toggle-key-visibility-btn');
const keyErrorBanner = document.getElementById('key-error-banner');
const bodyElement = document.body; // Get reference to body
const topFixedElementsContainer = document.getElementById('top-fixed-elements-container');
const infoLinkContainer = document.getElementById('info-link-container');

// Paleta de colores para alias que no son Mr. Green/Blue
const customAliasColors = [
    '#FF0000', // Red
    '#00FF00', // Lime
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#A52A2A', // Brown
    '#FFC0CB', // Pink
    '#808080', // Gray
    '#008000', // Green (Darker)
    '#4682B4', // SteelBlue
    '#D2691E', // Chocolate
    '#FFD700', // Gold
    '#ADFF2F', // GreenYellow
    '#FF6347', // Tomato
    '#40E0D0', // Turquoise
    '#EE82EE', // Violet
    '#F08080', // LightCoral
    '#20B2AA', // LightSeaGreen
    '#8A2BE2', // BlueViolet
    '#DC143C', // Crimson
    '#00CED1', // DarkTurquoise
    '#9932CC', // DarkOrchid
    '#FF4500', // OrangeRed
    '#DAA520', // Goldenrod
    '#7FFF00', // Chartreuse
    '#6495ED', // CornflowerBlue
    '#DEB887'  // BurlyWood
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

function createMessageLine(content, type) {
    const line = document.createElement("div");
    line.className = `output-line ${type}`;

    if (type === 'message' && typeof content === 'object') {
        const senderSpan = document.createElement("span");
        senderSpan.className = "sender";
        senderSpan.textContent = `${content.sender}: `;
        const colorClass = getAliasColorClass(content.sender);
        senderSpan.classList.add(colorClass);
        
        const textSpan = document.createElement("span");
        textSpan.className = "message-text";
        textSpan.textContent = content.text;

        line.appendChild(senderSpan);
        line.appendChild(textSpan);
    } else {
        line.textContent = content;
    }
    return line;
}


/**
 * Añade una línea de texto o un objeto de mensaje al final de la ventana de chat.
 */
export function appendOutput(content, type) {
    const line = createMessageLine(content, type);
    chatWindow.appendChild(line);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Añade una línea de texto o un objeto de mensaje al principio de la ventana de chat.
 * Puede recibir un DocumentFragment como target para optimizar múltiples inserciones.
 */
export function prependOutput(content, type, target = chatWindow) {
    const line = createMessageLine(content, type);
    target.prepend(line);
}

/**
 * Añade un DocumentFragment a la ventana de chat.
 */
export function appendFragment(fragment) {
    chatWindow.appendChild(fragment);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

export function clearChatWindow() {
    chatWindow.innerHTML = '';
    hideKeyError(); // Oculta el banner de error al limpiar la ventana
}

export function enableChat() {
    messageInput.disabled = false;
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

export function lockGenerateButton() {
    generateBtn.disabled = true;
}

export function unlockGenerateButton() {
    generateBtn.disabled = false;
}

/**
 * Actualiza el padding-top del body para acomodar el contenedor de elementos fijos.
 * También ajusta la posición del botón de información si el banner está visible.
 */
export function updateFixedElementsPosition() {
    if (topFixedElementsContainer) {
        const containerHeight = topFixedElementsContainer.offsetHeight;
        bodyElement.style.paddingTop = `${containerHeight}px`;
        bodyElement.style.setProperty('--body-padding-top', `${containerHeight}px`);
    }
}

/**
 * Muestra el banner de error de clave secreta.
 */
export function showKeyError() {
    keyErrorBanner.textContent = 'La clave secreta podría ser incorrecta.';
    keyErrorBanner.classList.remove('hidden');
    
    // Obtener la altura del banner después de que sea visible
    const bannerHeight = keyErrorBanner.offsetHeight;
    bodyElement.style.setProperty('--banner-height', `${bannerHeight}px`);
    bodyElement.classList.add('banner-active');

    updateFixedElementsPosition(); // Llama a la función para recalcular y ajustar
}

/**
 * Oculta el banner de error de clave secreta.
 */
export function hideKeyError() {
    if (keyErrorBanner) {
        keyErrorBanner.classList.add('hidden');
        bodyElement.classList.remove('banner-active');
        bodyElement.style.removeProperty('--banner-height');
        updateFixedElementsPosition(); // Llama a la función para recalcular y ajustar
    }
}

/**
 * Gestiona la UI cuando se introduce una clave inválida.
 */
export function handleInvalidKey() {
    showKeyError();
    secretKeyInput.value = ""; // Limpia el campo de la clave
    secretKeyInput.focus();   // Pone el foco de nuevo para que el usuario reintente
}

