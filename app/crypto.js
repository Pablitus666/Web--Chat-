// app/crypto.js
import CryptoJS from 'crypto-js';

// Este archivo encapsula la lógica de cifrado.

export function encryptMessage(messageObject, key) {
    // Convierte el objeto del mensaje a una cadena JSON antes de cifrar.
    const jsonString = JSON.stringify(messageObject);
    return CryptoJS.AES.encrypt(jsonString, key).toString();
}

export function decryptMessage(encryptedText, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, key);
        const jsonString = bytes.toString(CryptoJS.enc.Utf8);

        // Si la cadena descifrada está vacía, no es un JSON válido.
        if (!jsonString) {
            return null;
        }

        // Convierte la cadena JSON de nuevo a un objeto.
        return JSON.parse(jsonString);
    } catch (e) {
        // Un error aquí casi siempre significa que la clave es incorrecta y el
        // resultado del descifrado no es un JSON válido.
        console.error("Decryption/JSON parse failed:", e);
        return null; // Devuelve null si ocurre cualquier error
    }
}
