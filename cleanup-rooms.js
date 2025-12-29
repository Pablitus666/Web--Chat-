const admin = require('firebase-admin');
const { getDatabase, ref, get } = require('firebase-admin/database');

// --- Configuración ---
// El número de minutos de inactividad antes de que una sala sea eliminada.
const INACTIVITY_THRESHOLD_MINUTES = 10;

// Las credenciales se cargan desde las variables de entorno de GitHub Actions.
// Necesitarás configurar los secretos FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY y FIREBASE_CLIENT_EMAIL en tu repositorio.
// Además, la URL de la base de datos se pasa como argumento.
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

const databaseURL = process.argv[2];
if (!databaseURL) {
  console.error('Error: La URL de la base de datos de Firebase debe ser proporcionada como argumento.');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  });
} catch (error) {
  console.error('Error al inicializar Firebase Admin SDK:', error.message);
  process.exit(1);
}


const db = admin.database();
const roomsRef = db.ref('rooms');

async function cleanupInactiveRooms() {
  console.log('Iniciando la limpieza de salas inactivas...');

  try {
    const snapshot = await roomsRef.once('value');
    const rooms = snapshot.val();

    if (!rooms) {
      console.log('No hay salas para revisar. Finalizando.');
      return;
    }

    const now = Date.now();
    const inactivityThreshold = INACTIVITY_THRESHOLD_MINUTES * 60 * 1000;
    let roomsDeleted = 0;

    const promises = Object.keys(rooms).map(async (roomId) => {
      const room = rooms[roomId];
      const lastActive = room.lastActive || 0;
      const timeSinceLastActive = now - lastActive;

      if (timeSinceLastActive > inactivityThreshold) {
        // Obtener el número de presencias activas
        const presencesRef = db.ref(`chats/${roomId}/presences`);
        const presencesSnapshot = await presencesRef.once('value');
        const numActivePresences = presencesSnapshot.numChildren(); // Cuenta los hijos en el nodo presences

        if (numActivePresences === 0) {
          console.log(`Sala '${roomId}' está inactiva y no tiene usuarios. Ha pasado más de ${INACTIVITY_THRESHOLD_MINUTES} minutos. Eliminando...`);
          await roomsRef.child(roomId).remove();
          roomsDeleted++;
          console.log(`Sala '${roomId}' eliminada.`);
        } else {
          console.log(`Sala '${roomId}' está inactiva pero tiene ${numActivePresences} usuarios activos. No se eliminará.`);
        }
      } else {
        console.log(`Sala '${roomId}' está activa, no se eliminará.`);
      }
    });

    await Promise.all(promises);

    if (roomsDeleted > 0) {
      console.log(`Limpieza completada. Se eliminaron ${roomsDeleted} salas inactivas.`);
    } else {
      console.log('No se encontraron salas inactivas para eliminar.');
    }

  } catch (error) {
    console.error('Error durante el proceso de limpieza:', error);
    process.exit(1);
  } finally {
    // Cierra la conexión de la base de datos para permitir que el script finalice.
    db.goOffline();
  }
}

cleanupInactiveRooms();
