// app/state.js
// Un módulo simple para mantener el estado compartido de la aplicación.

let secretKey = '';

export function setSecretKey(key) {
    secretKey = key;
}

export function getSecretKey() {
    return secretKey;
}
