# 🔐 Web – Chat

Chat web privado con **cifrado del lado del cliente**, salas por nombre y clave secreta compartida. Todo el procesamiento se realiza localmente en el navegador, sin servidores, sin cookies y sin recolección de datos.

---

## 🚀 Características principales

* 🔒 **Cifrado y descifrado local** de mensajes (client-side)
* 🏠 **Salas privadas** mediante nombre de sala
* 🔑 **Clave secreta compartida** entre participantes
* 🎲 Generación automática de claves
* 👁️ Mostrar / ocultar clave secreta
* 📋 Copiado rápido de claves
* 🖥️ **Interfaz estilo consola / terminal**
* 🧭 Aplicación web progresiva (PWA)
* 🛡️ **Privacidad total**: sin cookies, sin tracking, sin almacenamiento

---

## 🧠 ¿Cómo funciona?

1. El usuario crea o se une a una **sala** mediante un nombre.
2. Se define una **clave secreta** compartida entre los participantes.
3. Todos los mensajes se **cifran antes de enviarse** y se **descifran localmente**.
4. Los mensajes **no se almacenan** ni se envían a servidores externos.

> ⚠️ Si un usuario no posee la clave correcta, no podrá leer los mensajes.

---

## 📁 Estructura del proyecto

```
Web Chat/
├── .git/                   # Control de versiones
├── app/                    # Lógica de la aplicación (frontend/backoffice)
├── backend/                # Backend y lógica del servidor
├── functions/              # Funciones backend (Firebase / serverless)
├── dist/                   # Código compilado / bundle final
├── static/                 # Recursos estáticos adicionales
├── templates/              # Plantillas HTML (si aplica backend)
├── images/                 # Íconos, favicons e imágenes
├── node_modules/           # Dependencias Node.js
│
├── index.html              # Interfaz principal del chat
├── info.html               # Términos de uso y política de privacidad
├── styles.css              # Estilos globales
├── script.js               # Lógica principal del frontend
├── sw.js                   # Service Worker (PWA)
├── manifest.json           # Configuración PWA
│
├── app.py                  # Aplicación backend (Python)
├── requirements.txt        # Dependencias Python
├── Procfile                # Configuración de despliegue
├── runtime.txt             # Runtime del servidor
│
├── firebase.json           # Configuración Firebase
├── .firebaserc             # Proyecto Firebase
├── database.rules.json     # Reglas de base de datos
│
├── package.json            # Configuración del proyecto Node.js
├── package-lock.json       # Lockfile de dependencias
├── .gitignore              # Archivos ignorados por Git
├── favicon.ico             # Icono principal
├── listo*.ico              # Variantes de iconos
├── README.md               # Documentación del proyecto
```

---

## 🖥️ Tecnologías utilizadas

* **HTML5**
* **CSS3** (diseño tipo consola)
* **JavaScript moderno (ES Modules)**
* **Web APIs** (Clipboard, Crypto, PWA)

---

## 🔐 Seguridad y privacidad

* ❌ No se recopilan datos personales
* ❌ No se usan cookies ni rastreadores
* ❌ No se almacenan mensajes
* ✅ Todo el cifrado ocurre **en el navegador del usuario**
* ✅ Código transparente y auditable

Consulta los detalles completos en `info.html`.

---

## 📜 Términos de uso

El uso de esta aplicación está permitido únicamente con fines personales y educativos. No debe utilizarse para actividades ilegales, maliciosas o que vulneren derechos de terceros.

Las leyes aplicables son las del **Estado Plurinacional de Bolivia**.

---

## 📦 Instalación y uso

No requiere instalación.

1. Descarga o clona el repositorio
2. Abre `index.html` en tu navegador
3. Crea o únete a una sala
4. Comparte la clave secreta de forma segura

---

## 🧪 Estado del proyecto

🟢 Activo / Experimental

El proyecto está en constante mejora y enfocado en simplicidad, privacidad y control del usuario.

---

## ✉️ Contacto

* 📧 Email: **[pharmakoz@gmail.com](mailto:pharmakoz@gmail.com)**
* 🏢 PABLITUS Inc.

---

## 🧾 Licencia

Este proyecto se distribuye "tal cual", sin garantías explícitas. Puedes usarlo, modificarlo y estudiarlo bajo tu propia responsabilidad.

---

> 🔐 *Privacidad por diseño. Control total del usuario.*
