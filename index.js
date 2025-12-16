/**
 * ====================================================================
 * 🚀 TWILIO WHATSAPP BOT - HOSPEDAJE EL RETORNO (Lógica Avanzada)
 * ====================================================================
 */

const express = require("express");
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;
const bodyParser = require("body-parser");
const { GoogleGenAI } = require("@google/genai"); 
const app = express();

// --- CONFIGURACIÓN ---
const ai = new GoogleGenAI({});
const PORT = process.env.PORT || 3000;

// --- MEMORIA DE SESIÓN (RAM) ---
// Guardaremos el estado de cada número de teléfono aquí
// Estructura: { '+569...': { haSaludado: false, contadorInsultos: 0, bloqueado: false } }
const sesiones = {};

// --- INSTRUCCIÓN DE SISTEMA (PERSONALIDAD) ---
const SYSTEM_INSTRUCTION_BASE = `
Eres "El Retorno Bot", el asistente virtual del Hospedaje "El Retorno".
Ubicación: Medio Poniente 1347, muy cerca de la playa.
Habitaciones disponibles (3 en total):
1. Matrimonial
2. Pieza Triple 1
3. Pieza Triple 2

REGLAS DE COMPORTAMIENTO:
1. Eres muy amable, servicial y educado.
2. Si te preguntan por disponibilidad, menciona las 3 habitaciones y solicita la fecha para revisar manualmente (aún no tienes calendario conectado).
3. NO menciones Booking, Airbnb ni Google Calendar (aún no implementados).
4. SOLO respondes texto.
`;

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })); 

/**
 * Función auxiliar para obtener o crear la sesión de un usuario
 */
function obtenerSesion(numero) {
    if (!sesiones[numero]) {
        sesiones[numero] = {
            haSaludado: false,
            contadorInsultos: 0,
            bloqueado: false
        };
    }
    return sesiones[numero];
}

/**
 * Función para detectar insultos usando IA (Detección ligera)
 */
async function esOfensivo(texto) {
    try {
        const model = ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analiza el siguiente texto: "${texto}". Responde SOLAMENTE con la palabra "SI" si el usuario está insultando, agrediendo o siendo grosero con el bot. Responde "NO" si es una pregunta normal o una queja educada.`
        });
        const result = await model;
        const respuesta = (await result).response.text().trim().toUpperCase();
        return respuesta.includes("SI");
    } catch (e) {
        return false; // Ante la duda, asumimos que no es ofensivo
    }
}

/**
 * ====================================================================
 * 📩 RUTA PRINCIPAL
 * ====================================================================
 */
app.post("/whatsapp", async (req, res) => {
    const twiml = new MessagingResponse();
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;
    const numMedia = req.body.NumMedia; // Cantidad de archivos adjuntos (fotos/audios)

    // 1. Obtener sesión del usuario
    const usuario = obtenerSesion(fromNumber);

    console.log(`\n=== MENSAJE DE: ${fromNumber} ===`);

    // 2. VERIFICAR BLOQUEO (Si ya insultó 2 veces)
    if (usuario.bloqueado) {
        console.log("🚫 Usuario bloqueado intentando hablar.");
        // No respondemos nada, cortamos comunicación efectivamente.
        res.set('Content-Type', 'text/xml');
        return res.status(200).end(twiml.toString());
    }

    // 3. FILTRO DE FORMATO (Solo Texto)
    // Si NumMedia > 0 significa que enviaron foto, audio, video, sticker, etc.
    if (numMedia > 0) {
        console.log("Media detectado (Audio/Foto). Rechazando.");
        twiml.message("🤖 Solo leo textos. No puedo escuchar audios ni ver fotos. Por favor, escríbeme.");
        res.set('Content-Type', 'text/xml');
        return res.status(200).end(twiml.toString());
    }

    try {
        // 4. VERIFICACIÓN DE INSULTOS
        const insulta = await esOfensivo(incomingMessage);

        if (insulta) {
            usuario.contadorInsultos++;
            console.log(`⚠️ Insulto detectado. Contador: ${usuario.contadorInsultos}`);

            if (usuario.contadorInsultos === 1) {
                // Primera advertencia
                twiml.message("⚠️ He detectado un lenguaje ofensivo. Soy un asistente amable, por favor mantengamos el respeto o tendré que finalizar el chat.");
            } else {
                // Segunda vez: Bloqueo
                usuario.bloqueado = true;
                twiml.message("🚫 Has sido bloqueado por faltar el respeto reiteradamente. Fin de la comunicación.");
            }
            
            res.set('Content-Type', 'text/xml');
            return res.status(200).end(twiml.toString());
        }

        // 5. CONSTRUCCIÓN DE LA RESPUESTA (Si pasó todos los filtros)
        
        // Instrucción dinámica según si ya saludó o no
        let instruccionAdicional = "";
        if (!usuario.haSaludado) {
            instruccionAdicional = "Esta es la PRIMERA vez que hablas con este usuario. DEBES presentarte formalmente: 'Hola, soy el Bot del Hospedaje El Retorno...' y luego responder su consulta.";
            usuario.haSaludado = true; // Marcamos que ya saludó
        } else {
            instruccionAdicional = "Ya has hablado con este usuario antes. NO te vuelvas a presentar. Responde directamente a su pregunta de forma fluida.";
        }

        // Llamada a Gemini para generar la respuesta
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_BASE + "\n" + instruccionAdicional
            },
            contents: [
                 { role: "user", parts: [{ text: incomingMessage }] }
            ],
        });

        const responseText = response.text.trim();
        twiml.message(responseText);

    } catch (error) {
        console.error("Error:", error);
        twiml.message("Tuve un pequeño error técnico, ¿podrías repetirme la pregunta?");
    }

    res.set('Content-Type', 'text/xml');
    res.status(200).end(twiml.toString());
});

app.listen(PORT, () => {
    console.log(`🚀 BOT EL RETORNO LISTO EN PUERTO: ${PORT}`);
});