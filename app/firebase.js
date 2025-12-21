// app/firebase.js

import { decryptMessage } from './crypto.js';
import { appendOutput } from './ui.js';
import { getSecretKey } from './state.js'; // Importamos el gestor de estado

// Firebase se carga desde la CDN, por lo que es una variable global.
const firebaseConfig = {
    apiKey: "AIzaSyCdoahevSS_bDfiwqbcAVwQ0vCAXjuIGM0",
    authDomain: "el-rata-alada.firebaseapp.com",
    databaseURL: "https://el-rata-alada-default-rtdb.firebaseio.com",
    projectId: "el-rata-alada",
    storageBucket: "el-rata-alada.firebasestorage.app",
    messagingSenderId: "591706239422",
    appId: "1:591706239422:web:8128add2d5f9890fc109ef",
    measurementId: "G-CD6B5P1259"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let chatRef;
let presenceRef; // Nueva variable para la referencia de presencia
let clientId = getPersistentClientId(); // Generar o recuperar un ID de cliente único

// Función para generar o recuperar un ID de cliente único y persistente
function getPersistentClientId() {
    let storedClientId = sessionStorage.getItem('chatClientId');
    if (!storedClientId) {
        storedClientId = 'client_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('chatClientId', storedClientId);
        console.log('Generated new clientId:', storedClientId); // <-- LOG
    } else {
        console.log('Retrieved existing clientId:', storedClientId); // <-- LOG
    }
    return storedClientId;
}

export function setChatRoom(room) {
    chatRef = database.ref(`chats/${room}/messages`); // Los mensajes ahora estarán en un sub-nodo 'messages'
    presenceRef = database.ref(`chats/${room}/presences/${clientId}`); // Referencia a la presencia del cliente

    // Establecer la presencia del cliente y registrar onDisconnect
    presenceRef.set(true); // O ServerValue.TIMESTAMP para saber cuándo se conectó
    presenceRef.onDisconnect().remove();
}

export function sendMessage(encryptedMessage) {
    if (!chatRef) return;
    chatRef.push({
        text: encryptedMessage
    });
}

// La función ya no necesita recibir la clave como argumento.
export function listenForMessages() {
    if (!chatRef) return;

    chatRef.off();

    chatRef.on("child_added", (snapshot) => {
        const message = snapshot.val();
        if (message && message.text) {
            // Obtenemos la clave más actualizada desde el estado CADA VEZ que llega un mensaje.
            const currentSecretKey = getSecretKey();
            const decryptedObject = decryptMessage(message.text, currentSecretKey);
            
            if (decryptedObject) {
                console.log('Decrypted message:', decryptedObject);
                console.log('Local clientId (firebase.js):', clientId);
                console.log('Message clientId (from decryptedObject):', decryptedObject.clientId);
                const isOwnMessage = decryptedObject.clientId === clientId;
                console.log('Is own message (decryptedObject.clientId === clientId):', isOwnMessage);
                // Solo mostrar el mensaje si no fue enviado por este mismo cliente
                if (!isOwnMessage) {
                    console.log('Appending message to UI (not own message).');
                    appendOutput(decryptedObject, "message");
                } else {
                    console.log('Not appending message to UI (own message).');
                }
            } else {
                console.log('Decryption failed or returned null.');
                appendOutput("<?>", "undecipherable");
            }
        }
    });
}

export function stopListening() {
    if (chatRef) {
        chatRef.off();
    }
    // También detener la presencia cuando se detiene la escucha
    if (presenceRef) {
        presenceRef.remove(); // Eliminar la presencia manualmente si se detiene la escucha
    }
}