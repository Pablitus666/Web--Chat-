// app/main.js

import { encryptMessage } from './crypto.js';
import * as fb from './firebase.js';
import * as ui from './ui.js';
import { getSecretKey, setSecretKey } from './state.js';
import { clientId } from './firebase.js'; // <-- Importar clientId

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

// --- Constantes ---
const SK_STORAGE_PREFIX = "rata-alada-key-";
const ALIAS_STORAGE_PREFIX = "rata-alada-alias-";

// --- Lógica de la Aplicación ---

function getRoomFromURL() {
    const hash = window.location.hash.substring(1);
    return decodeURIComponent(hash);
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function handleLobbySubmit(e) {
    e.preventDefault();
    const baseRoomName = roomNameInput.value.trim();
    if (baseRoomName) {
        // Original logic for setting hash, without sessionId
        window.location.hash = baseRoomName;
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
        if (userParam.toLowerCase() === 'green') {
            ui.setNicknameValue('Mr. Green');
        } else if (userParam.toLowerCase() === 'blue') {
            ui.setNicknameValue('Mr. Blue');
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
    
    secretKeyInput.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSecretKeyChange();
            nicknameInput.focus();
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

function handleSecretKeyChange() {
    const key = ui.getSecretKeyValue();
    const storageKeyName = SK_STORAGE_PREFIX + chatRoom;

    setSecretKey(key);

    if (key) {
        sessionStorage.setItem(storageKeyName, key);
        ui.enableChat();
        ui.clearChatWindow();
        ui.appendOutput("Clave secreta establecida. Inicializando sala...", "system");
        fb.setChatRoom(chatRoom);
        fb.listenForMessages();
        ui.appendOutput(`Conectado a la sala: #${chatRoom}`, "system");
        ui.lockSecretKeyInput(); // Bloquea el campo de la clave secreta
    } else {
        sessionStorage.removeItem(storageKeyName);
        ui.disableChat();
        ui.appendOutput("Clave secreta eliminada. Chat desactivado.", "system");
        fb.stopListening();
    }
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
    if (lowerCaseAlias === 'verde' || lowerCaseAlias === 'green') {
        alias = 'Mr. Green';
    } else if (lowerCaseAlias === 'azul' || lowerCaseAlias === 'blue') {
        alias = 'Mr. Blue';
    }

    const currentSecretKey = getSecretKey();
    if (messageText !== "" && currentSecretKey !== "") {
        const messageObject = { sender: alias, text: messageText, clientId: clientId }; // <-- CAMBIO AQUÍ
        const encrypted = encryptMessage(messageObject, currentSecretKey);
        fb.sendMessage(encrypted);
        ui.clearMessageInput();
    }
}

function main() {
    chatRoom = getRoomFromURL();
    if (chatRoom) {
        showChat();
    } else {
        showLobby();
    }
    window.addEventListener('hashchange', () => {
        location.reload(); // This was the line that caused the issue
    });

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