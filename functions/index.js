const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/*
 * ESTA FUNCIÓN HA SIDO DESACTIVADA INTENCIONALMENTE.
 * La lógica para limpiar las salas de chat ahora es manejada exclusivamente 
 * por el script en `backend/index.js`.
 *
 * Este script `backend/index.js` incluye un período de gracia para evitar 
 * que las salas se eliminen durante una recarga de página, solucionando el problema original.
 *
 * Para que el sistema funcione, asegúrate de que el proceso `node backend/index.js` esté en ejecución.
 *
exports.cleanupChatRoom = functions.database.ref('/chats/{roomId}/presences/{clientId}')
    .onDelete(async (snapshot, context) => {
        const roomId = context.params.roomId;
        const presencesRef = admin.database().ref(`/chats/${roomId}/presences`);
        const messagesRef = admin.database().ref(`/chats/${roomId}/messages`);

        // Verificar si quedan presencias en la sala
        const presencesSnapshot = await presencesRef.once('value');
        if (!presencesSnapshot.exists() || presencesSnapshot.numChildren() === 0) {
            // Si no quedan presencias, eliminar los mensajes de la sala
            functions.logger.log(`No more presences in room ${roomId}. Deleting messages.`);
            return messagesRef.remove();
        } else {
            functions.logger.log(`Presences still exist in room ${roomId}. Not deleting messages.`);
            return null;
        }
    });
*/
