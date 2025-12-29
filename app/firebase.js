// app/firebase.js
import { initializeApp } from 'firebase/app';
import {
    getDatabase,
    ref,
    child,
    push,
    set,
    get,
    query,
    limitToLast,
    orderByKey,
    endAt,
    onValue,
    onChildAdded,
    onDisconnect,
    off,
    remove,
    serverTimestamp
} from 'firebase/database';
import { decryptMessage, encryptMessage } from './crypto.js';
import { appendOutput } from './ui.js';
import { getSecretKey } from './state.js';

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

// --- Inicialización de Firebase (v9+) ---
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- Referencias y Estado Global ---
let chatRef;
let currentMessagesListener = null; // Para poder desuscribirnos
let currentConnectionListener = null;
let userPresenceRef = null; // <-- NUEVO: Almacenar referencia a la entrada de presencia del usuario

// --- Lógica de Presencia ---
function managePresence() {
    if (!chatRef) return;

    const presencesRef = child(chatRef, 'presences');
    const connectionRef = ref(database, '.info/connected');

    currentConnectionListener = onValue(connectionRef, (snap) => {
        if (snap.val() === true) {
            // Crea una entrada de presencia cuando se establece la conexión
            if (!userPresenceRef) { // Solo crear si no existe para esta sesión
                userPresenceRef = push(presencesRef); // Crea una ref única
                onDisconnect(userPresenceRef).remove(); // Establece la eliminación al desconectar
            }
        }
    });
}

// NUEVA función para establecer el alias en la entrada de presencia
export function setUserPresence(alias) {
    if (!userPresenceRef) {
        // Esto puede ocurrir si la función se llama antes de que se establezca la conexión.
        // Podemos crearlo aquí como respaldo.
        const presencesRef = child(chatRef, 'presences');
        userPresenceRef = push(presencesRef);
        onDisconnect(userPresenceRef).remove();
    }
    set(userPresenceRef, { alias: alias }); // Establece el alias
}

// NUEVA función para obtener todos los alias actuales
export async function getExistingAliases(room) {
    const presencesRef = ref(database, `chats/${room}/presences`);
    const snapshot = await get(presencesRef);
    const aliases = [];
    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            if (data && data.alias) {
                aliases.push(data.alias);
            }
        });
    }
    return aliases;
}

// Función para actualizar el timestamp de la última actividad de la sala
export function updateRoomLastActive() {
    if (!chatRef) return;
    // chatRef ya es la referencia correcta a la sala: chats/{roomId}
    set(child(chatRef, 'lastActive'), serverTimestamp());
}


// --- Lógica de Chat ---
let oldestMessageKey = null;
let initialLoad = true;
const KEY_CHECK_TEXT = 'rata-alada-ok';

export async function verifyOrCreateKeyCheck(room, key) {
    const keyCheckRef = ref(database, `chats/${room}/keyCheck`);
    try {
        const snapshot = await get(keyCheckRef);
        if (snapshot.exists()) {
            const encryptedCheck = snapshot.val();
            const decryptedCheck = decryptMessage(encryptedCheck, key);
            return decryptedCheck === KEY_CHECK_TEXT;
        } else {
            const newEncryptedCheck = encryptMessage(KEY_CHECK_TEXT, key);
            await set(keyCheckRef, newEncryptedCheck);
            updateRoomLastActive(); // <--- Añadido: Actualizar lastActive al crear/verificar la clave
            return true;
        }
    } catch (error) {
        console.error("Error en la verificación de clave:", error);
        return false;
    }
}

export function setChatRoom(room) {
    chatRef = ref(database, `chats/${room}`);
    oldestMessageKey = null;
    initialLoad = true;
    managePresence();
    updateRoomLastActive(); // <--- Añadido: Actualizar lastActive al establecer la sala
}

export function sendMessage(encryptedMessage) {
    if (!chatRef) return;
    const messagesRef = child(chatRef, 'messages');
    push(messagesRef, {
        text: encryptedMessage
    });
    updateRoomLastActive(); // <--- Añadido: Actualizar lastActive al enviar un mensaje
}

export function listenForMessages(onInitialMessagesLoaded) {
    if (!chatRef) return;
    const messagesRef = child(chatRef, 'messages');

    // Desuscribe el listener anterior si existe
    if (currentMessagesListener) {
        off(currentMessagesListener);
    }
    
    initialLoad = true;

    const messagesQuery = query(messagesRef, limitToLast(50));

    currentMessagesListener = onChildAdded(messagesQuery, (snapshot) => {
        if (initialLoad && oldestMessageKey === null) {
            oldestMessageKey = snapshot.key;
        }

        const message = snapshot.val();
        if (message && message.text) {
            const currentSecretKey = getSecretKey();
            const decryptedObject = decryptMessage(message.text, currentSecretKey);
            
            if (decryptedObject) {
                appendOutput(decryptedObject, "message");
            } else {
                appendOutput("<?>", "undecipherable");
            }
        }
    });

    get(messagesQuery).then(() => {
        initialLoad = false;
        if (onInitialMessagesLoaded) {
            onInitialMessagesLoaded();
        }
    });
}

export async function fetchOlderMessages() {
    if (!chatRef || !oldestMessageKey) {
        return { messages: [], hasMore: false };
    }

    const messagesRef = child(chatRef, 'messages');
    const messagesQuery = query(messagesRef, orderByKey(), endAt(oldestMessageKey), limitToLast(51));

    const snapshot = await get(messagesQuery);
    
    if (!snapshot.exists()) {
        return { messages: [], hasMore: false };
    }

    const messages = [];
    snapshot.forEach(childSnapshot => {
        messages.push({ key: childSnapshot.key, val: childSnapshot.val() });
    });

    messages.pop(); 

    if (messages.length === 0) {
        oldestMessageKey = null;
        return { messages: [], hasMore: false };
    }

    oldestMessageKey = messages[0].key;

    const decryptedMessages = messages.map(msg => {
        const currentSecretKey = getSecretKey();
        return decryptMessage(msg.val.text, currentSecretKey);
    }).filter(Boolean);

    return { messages: decryptedMessages, hasMore: true };
}

export function stopListening() {
    if (currentMessagesListener) {
        off(currentMessagesListener);
        currentMessagesListener = null;
    }
    if (currentConnectionListener) {
        off(currentConnectionListener);
        currentConnectionListener = null;
    }
    if (userPresenceRef) {
        remove(userPresenceRef); // Limpia la presencia al salir manualmente
        userPresenceRef = null;
    }
    // La gestión de onDisconnect se hace al desconectar, pero si el usuario
    // sale manualmente, no hay una referencia directa para cancelar aquí
    // sin guardar la 'userPresenceRef' globalmente, lo cual es complejo.
    // La limpieza al desconectar es suficiente para este caso de uso.
}