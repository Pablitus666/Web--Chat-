// Configuración de Firebase en tu archivo de configuración (tu-configuracion-de-firebase.js)
document.addEventListener("DOMContentLoaded", function () {
    const commandForm = document.getElementById("command-form");
    const commandInput = document.getElementById("command-input");
    const output = document.getElementById("output");
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");
    const chatMessages = document.getElementById("chat-messages");

    // Inicializa Firebase con tu configuración (reemplaza con tu propia configuración)
    const firebaseConfig = {
        apiKey: "AIzaSyBr1ihXsIQTroVfgO9aetmeEtHVRAVoNPc",
        authDomain: "rata-alada-86e54.firebaseapp.com",
        databaseURL: "https://rata-alada-86e54-default-rtdb.firebaseio.com",
        projectId: "rata-alada-86e54",
        storageBucket: "rata-alada-86e54.appspot.com",
        messagingSenderId: "914513504892",
        appId: "1:914513504892:web:7ce6a78e7c870d913c37f9",
        measurementId: "G-Y5PQZ3S36T"
    };

    // Inicializa Firebase
    firebase.initializeApp(firebaseConfig);

    // Función para enviar un mensaje al chat
    function sendMessage(messageText) {
        // Obten el usuario actualmente autenticado (debes implementar la autenticación si es necesario)
        const user = getCurrentUser();

        const message = {
            text: messageText,
            sender: user.displayName,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
        };

        // Guarda el mensaje en la base de datos de Firebase
        firebase.database().ref("chat").push(message);
    }

    // Función para mostrar un mensaje en la interfaz de usuario del chat
    function displayMessage(message) {
        const messageElement = document.createElement("div");
        messageElement.textContent = `${message.sender}: ${message.text}`;
        chatMessages.appendChild(messageElement);

        // Desplázate hacia abajo para ver el último mensaje
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Escucha los cambios en la base de datos y muestra los mensajes en la interfaz de usuario del chat
    firebase
        .database()
        .ref("chat")
        .on("child_added", function (snapshot) {
            const message = snapshot.val();
            displayMessage(message);
        });

    // Agrega un evento al formulario para enviar mensajes
    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message !== "") {
            sendMessage(message);
            messageInput.value = "";
        }
    });

    // Evento para procesar comandos en la consola
    commandForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const command = commandInput.value.trim();
        if (command !== "") {
            appendCommand(command);
            processCommand(command);
            commandInput.value = "";
        }
    });

    // Enfocar el campo de entrada cuando se carga la página
    commandInput.focus();

    // Evitar que el clic en la página afecte al formulario
    document.body.addEventListener("click", function (e) {
        if (e.target !== commandInput) {
            e.preventDefault();
            commandInput.focus(); // Enfocar el campo de entrada
        }
    });

    function appendCommand(command) {
        const commandElement = document.createElement("div");
        commandElement.className = "command";
        commandElement.textContent = "> " + command;
        output.appendChild(commandElement);
    }

    function appendOutput(outputText) {
        const outputElement = document.createElement("div");
        outputElement.className = "output-line";
        outputElement.textContent = outputText;
        output.appendChild(outputElement);
        output.scrollTop = output.scrollHeight;
    }

    function processCommand(command) {
        if (command.toLowerCase() === "saludo") {
            appendOutput("Hola, ¿en qué puedo ayudarte?");
        } else {
            appendOutput("Comando no reconocido. Prueba 'saludo'.");
        }
    }

    // Debes implementar getCurrentUser() para obtener el usuario autenticado según tu sistema de autenticación
    function getCurrentUser() {
        // Aquí deberías obtener el usuario autenticado de Firebase Authentication
        // Por ejemplo, puedes usar: return firebase.auth().currentUser;
        // Asegúrate de manejar la autenticación de usuarios adecuadamente en tu proyecto.
    }
});
