// app/main.js

import { encryptMessage } from './crypto.js';
import * as fb from './firebase.js';
import * as ui from './ui.js';
import { getSecretKey, setSecretKey } from './state.js';
import { updateFixedElementsPosition } from './ui.js'; // Importar la nueva función

// --- Elementos del DOM ---
const lobbyContainer = document.getElementById('lobby-container');
const chatConsole = document.getElementById('chat-console');
const lobbyForm = document.getElementById('lobby-form');
const roomNameInput = document.getElementById('room-name-input');

const secretKeyInput = document.getElementById("secret-key-input");
const nicknameInput = document.getElementById("nickname-input");
const messageInput = document.getElementById("message-input");
const messageForm = document.getElementById("message-form");

// --- Estado Global ---
let chatRoom = "";
let isLoadingOlderMessages = false;
let hasMoreMessages = true;

// --- Constantes ---
const SK_STORAGE_PREFIX = "rata-alada-key-";
const ALIAS_STORAGE_PREFIX = "rata-alada-alias-";
const COLOR_ALIASES = {
    // Rojos
    'rojo': 'Red', 'red': 'Red',
    'carmesi': 'Crimson', 'crimson': 'Crimson',
    'tomate': 'Tomato', 'tomato': 'Tomato',
    'salmon': 'Salmon',
    // Rosas
    'rosa': 'Pink', 'pink': 'Pink',
    'fucsia': 'Fuchsia', 'fuchsia': 'Fuchsia',
    // Naranjas
    'naranja': 'Orange', 'orange': 'Orange',
    'coral': 'Coral',
    // Amarillos
    'amarillo': 'Yellow', 'yellow': 'Yellow',
    'dorado': 'Gold', 'gold': 'Gold',
    'limon': 'Lemon', 'lemon': 'Lemon',
    // Verdes
    'verde': 'Green', 'green': 'Green',
    'lima': 'Lime', 'lime': 'Lime',
    'oliva': 'Olive', 'olive': 'Olive',
    'teal': 'Teal',
    // Cianes
    'cian': 'Cyan', 'cyan': 'Cyan',
    'aqua': 'Aqua', 'agua': 'Aqua',
    'turquesa': 'Turquoise', 'turquoise': 'Turquoise',
    // Azules
    'azul': 'Blue', 'blue': 'Blue',
    'indigo': 'Indigo',
    'marino': 'Navy', 'navy': 'Navy',
    'celeste': 'SkyBlue', 'skyblue': 'SkyBlue',
    // Morados
    'purpura': 'Purple', 'purple': 'Purple', 'morado': 'Purple',
    'violeta': 'Violet', 'violet': 'Violet',
    'magenta': 'Magenta',
    'orquidea': 'Orchid', 'orchid': 'Orchid',
    // Marrones
    'marron': 'Brown', 'brown': 'Brown', 'cafe': 'Brown',
    'chocolate': 'Chocolate',
    'sienna': 'Sienna',
    // Blancos
    'blanco': 'White', 'white': 'White',
    'nieve': 'Snow', 'snow': 'Snow',
    'marfil': 'Ivory', 'ivory': 'Ivory',
    // Grises
    'gris': 'Gray', 'gray': 'Gray', 'grey': 'Gray',
    'plata': 'Silver', 'silver': 'Silver',
    // Negros
    'negro': 'Black', 'black': 'Black'
};



// --- Lógica de Paginación ---
const chatWindow = document.getElementById("chat-window");

async function handleScroll() {
    // Si el usuario está en la parte superior, no se están cargando mensajes y hay más por cargar...
    if (chatWindow.scrollTop === 0 && !isLoadingOlderMessages && hasMoreMessages) {
        isLoadingOlderMessages = true;
        const oldScrollHeight = chatWindow.scrollHeight;

        const result = await fb.fetchOlderMessages();
        
        if (result.messages.length > 0) {
            const fragment = document.createDocumentFragment();
            // Itera en reversa para anteponer los mensajes en el orden correcto (del más nuevo al más viejo)
            for (let i = result.messages.length - 1; i >= 0; i--) {
                ui.prependOutput(result.messages[i], "message", fragment); // Pasa el fragmento
            }
            ui.appendFragment(fragment); // Añade el fragmento al DOM de una vez
            // Restaura la posición del scroll para que no haya un salto
            chatWindow.scrollTop = chatWindow.scrollHeight - oldScrollHeight;
        }

        hasMoreMessages = result.hasMore;
        if (!hasMoreMessages) {
            ui.prependOutput("--- Inicio del historial ---", "system");
            chatWindow.removeEventListener('scroll', handleScroll); // No hay más, se quita el listener
        }

        isLoadingOlderMessages = false;
    }
}

// --- Lógica de la Aplicación ---

function getRoomFromURL() {
    const hash = window.location.hash.substring(1);
    return decodeURIComponent(hash).toLowerCase(); // Convertido a minúsculas
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function handleLobbySubmit(e) {
    e.preventDefault();
    const roomName = roomNameInput.value.trim().toLowerCase(); // Convertido a minúsculas
    if (roomName) {
        // Establece la variable global y actualiza la URL sin recargar
        chatRoom = roomName;
        window.location.hash = roomName;
        // Muestra la vista de chat directamente, sin recargar la página
        showChat();
    }
}

function showLobby() {
    lobbyContainer.classList.remove('hidden');
    chatConsole.classList.add('hidden');
    lobbyForm.addEventListener('submit', handleLobbySubmit);
}

function showChat() {
    lobbyContainer.classList.add('hidden');
    chatConsole.classList.remove('hidden');

    const userParam = getQueryParam('user');
    const storedAlias = sessionStorage.getItem(ALIAS_STORAGE_PREFIX + chatRoom);

    if (userParam) {
        const lowerCaseUser = userParam.toLowerCase();
        const colorName = COLOR_ALIASES[lowerCaseUser];
        if (colorName) {
            ui.setNicknameValue(`Mr. ${colorName}`);
        } else {
            ui.setNicknameValue(userParam);
        }
    } else if (storedAlias) {
        ui.setNicknameValue(storedAlias);
    }

    const storedKey = sessionStorage.getItem(SK_STORAGE_PREFIX + chatRoom);
    
    if (storedKey) {
        ui.setSecretKeyValue(storedKey);
        handleSecretKeyChange();
    } else {
        setTimeout(() => {
            secretKeyInput.focus();
        }, 100);
    }

    if (!storedKey) {
        ui.appendOutput(`Sala actual: #${chatRoom}`, "system");
        ui.appendOutput("Introduce la clave secreta para empezar...", "system");
    }
    
    secretKeyInput.addEventListener("keydown", async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await handleSecretKeyChange();
            // Solo mueve el foco si la clave fue válida y el campo se bloqueó
            if (secretKeyInput.disabled) {
                nicknameInput.focus();
            }
        }
    });

    nicknameInput.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNicknameChange();
            messageInput.focus();
        }
    });

    messageForm.addEventListener("submit", handleMessageSubmit);
}

function handleNicknameChange() {
    const alias = ui.getNicknameValue();
    sessionStorage.setItem(ALIAS_STORAGE_PREFIX + chatRoom, alias);
    // Bloquea el campo de alias una vez que se ha establecido
    if (alias) {
        ui.lockAliasInput();
    }
}

async function handleSecretKeyChange() {
    const key = ui.getSecretKeyValue();
    const storageKeyName = SK_STORAGE_PREFIX + chatRoom;

    // Si no hay clave, se desactiva el chat y se limpia el storage.
    if (!key) {
        setSecretKey(key);
        sessionStorage.removeItem(storageKeyName);
        ui.disableChat();
        ui.unlockGenerateButton();
        ui.appendOutput("Clave secreta eliminada. Chat desactivado.", "system");
        fb.stopListening();
        chatWindow.removeEventListener('scroll', handleScroll);
        return;
    }

    // --- Nueva Lógica de Validación ---
    const isKeyValid = await fb.verifyOrCreateKeyCheck(chatRoom, key);

    if (!isKeyValid) {
        ui.handleInvalidKey(); // Muestra error, limpia el input y pone el foco.
        return; // Detiene la ejecución si la clave es incorrecta.
    }

    // --- Lógica Original (si la clave es válida) ---
    setSecretKey(key);
    sessionStorage.setItem(storageKeyName, key);
    ui.enableChat();
    ui.clearChatWindow();
    ui.appendOutput("Clave secreta válida. Inicializando sala...", "system");
    
    fb.setChatRoom(chatRoom);
    
    // Resetea el estado de paginación
    isLoadingOlderMessages = false;
    hasMoreMessages = true;
    chatWindow.removeEventListener('scroll', handleScroll); // Limpia el listener anterior si existe

    // Escucha los mensajes y, una vez cargados los iniciales, añade el listener de scroll
    fb.listenForMessages(() => {
        chatWindow.addEventListener('scroll', handleScroll);
    });

    ui.appendOutput(`Conectado a la sala: #${chatRoom}`, "system");
    ui.lockSecretKeyInput();
    ui.lockGenerateButton();
}

function handleMessageSubmit(e) {
    e.preventDefault();
    const messageText = ui.getMessageValue();
    let alias = ui.getNicknameValue();

    if (!alias) {
        alert("Por favor, introduce un alias antes de enviar un mensaje.");
        return;
    }

    handleNicknameChange();

    const lowerCaseAlias = alias.toLowerCase();
    const colorName = COLOR_ALIASES[lowerCaseAlias];

    if (colorName) {
        alias = `Mr. ${colorName}`;
    }

    const currentSecretKey = getSecretKey();
    if (messageText !== "" && currentSecretKey !== "") {
        const messageObject = { sender: alias, text: messageText };
        const encrypted = encryptMessage(messageObject, currentSecretKey);
        fb.sendMessage(encrypted);
        ui.clearMessageInput();
    }
}

function main() {
    // --- Icon Button Listeners ---
    const generateBtn = document.getElementById('generate-key-btn');
    const copyBtn = document.getElementById('copy-key-btn');
    const toggleVisibilityBtn = document.getElementById('toggle-key-visibility-btn');
    const eyeOpenIcon = document.getElementById('eye-open-icon');
    const eyeSlashIcon = document.getElementById('eye-slash-icon');

    function generateRandomKey(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        const randomValues = new Uint8Array(length);
        window.crypto.getRandomValues(randomValues);
        let key = '';
        for (let i = 0; i < length; i++) {
            key += chars[randomValues[i] % chars.length];
        }
        return key;
    }

    generateBtn.addEventListener('click', async () => {
        const newKey = generateRandomKey();
        ui.setSecretKeyValue(newKey);
        await handleSecretKeyChange(); // Procesa la nueva clave inmediatamente
        // Solo mueve el foco si la clave fue válida y el campo se bloqueó
        if (secretKeyInput.disabled) {
            nicknameInput.focus();
        }
    });

    copyBtn.addEventListener('click', () => {
        const key = ui.getSecretKeyValue();
        if (key && navigator.clipboard) {
            navigator.clipboard.writeText(key).then(() => {
                // Visual feedback: flash the button
                copyBtn.style.opacity = '1';
                copyBtn.style.color = '#00ff00'; // Brighter green
                setTimeout(() => {
                    copyBtn.style.opacity = '0.6';
                    copyBtn.style.color = '#0f0';
                }, 300);
            }).catch(err => {
                console.error('Failed to copy key: ', err);
            });
        }
    });

    toggleVisibilityBtn.addEventListener('click', () => {
        const isPassword = secretKeyInput.type === 'password';
        secretKeyInput.type = isPassword ? 'text' : 'password';
        eyeOpenIcon.classList.toggle('hidden', isPassword);
        eyeSlashIcon.classList.toggle('hidden', !isPassword);
    });


    // --- Main App Logic ---
    chatRoom = getRoomFromURL();
    if (chatRoom) {
        showChat();
    } else {
        showLobby();
    }
    // Se elimina el listener de 'hashchange' que forzaba la recarga.
    // window.addEventListener('hashchange', () => {
    //     location.reload();
    // });

    // Ajustar la posición de los elementos fijos al cargar la página
    updateFixedElementsPosition();
    // También ajustar si la ventana cambia de tamaño
    window.addEventListener('resize', updateFixedElementsPosition);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);
            }).catch(error => {
                console.log('Fallo en el registro del ServiceWorker:', error);
            });
        });
    }
}

main();