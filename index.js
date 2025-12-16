/**
 * ====================================================================
 * 🚀 TWILIO WHATSAPP BOT (Node.js/Express) - VERSIÓN FINAL Y ROBUSTA
 * ====================================================================
 */

// 1. Módulos Esenciales
const express = require("express");
// Importamos el constructor completo de twilio para evitar errores de referencia
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;
const bodyParser = require("body-parser");
const app = express();

// 2. Middleware para analizar solicitudes POST de Twilio
// AJUSTE CRÍTICO: Configuración robusta para manejar solicitudes POST de Twilio
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })); 

// 3. Variables de Entorno
const PORT = process.env.PORT || 3000;


/**
 * ====================================================================
 * 📩 RUTA PRINCIPAL: WEBHOOK DE WHATSAPP
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

    // 3. Lógica de respuesta (Mensaje de confirmación final)
    const responseText = `¡ÉXITO! Conexión Twilio-Render OK. Recibí: "${incomingMessage}"`;

    // 4. Agregar la respuesta al objeto TwiML
    twiml.message(responseText);

    // 5. ENVIAR RESPUESTA: Usamos res.set para forzar el Content-Type y solucionar el 502
    res.set('Content-Type', 'text/xml');
    res.status(200).end(twiml.toString());
});

/**
 * ====================================================================
 * 🚀 INICIO DEL SERVIDOR
 * ====================================================================
 */
app.listen(PORT, () => {
    console.log(`🚀 BOT TWILIO LISTO EN PUERTO: ${PORT}`);
});