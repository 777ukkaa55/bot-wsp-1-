/**
 * ====================================================================
 * 🚀 TWILIO WHATSAPP BOT (Node.js/Express)
 * Este código está optimizado para usar la infraestructura de Twilio.
 * ====================================================================
 */

// 1. Módulos Esenciales
const express = require("express");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require("body-parser");
const app = express();

// 2. Middleware para analizar solicitudes POST de Twilio
// Twilio envía datos como 'application/x-www-form-urlencoded'
app.use(bodyParser.urlencoded({ extended: false }));

// 3. Variables de Entorno (Se leen automáticamente de Render)
const PORT = process.env.PORT || 3000;
// NOTA: Para el Auth Token, Twilio lo lee directamente usando el módulo 'twilio'
// pero es buena práctica tenerlas en las variables de Render.

/**
 * ====================================================================
 * 📩 RUTA PRINCIPAL: WEBHOOK DE WHATSAPP
 * Soluciona el Error 404, implementando la ruta POST /whatsapp
 * ====================================================================
 */
app.post("/whatsapp", (req, res) => {
    // 1. Crear el objeto de respuesta de Twilio (TwiML)
    const twiml = new MessagingResponse();

    // 2. Capturar el mensaje entrante del usuario (Twilio lo envía como 'Body')
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;

    console.log(`\n================================`);
    console.log(`📩 MENSAJE RECIBIDO de: ${fromNumber}`);
    console.log(`💬 CONTENIDO: "${incomingMessage}"`);
    console.log(`================================`);

    // 3. Lógica simple de respuesta
    let responseText = `¡Hola! Soy un bot Twilio. Recibí tu mensaje: "${incomingMessage}".`;

    if (incomingMessage.toLowerCase().includes("ayuda")) {
        responseText = "Para ayuda, puedes visitar twilio.com/docs";
    }

    // 4. Agregar la respuesta al objeto TwiML
    twiml.message(responseText);

    // 5. Enviar la respuesta a Twilio en formato XML (TwiML)
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
});

/**
 * ====================================================================
 * 🚀 INICIO DEL SERVIDOR
 * ====================================================================
 */
app.listen(PORT, () => {
    console.log(`🚀 BOT TWILIO LISTO EN PUERTO: ${PORT}`);
});