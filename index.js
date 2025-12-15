/**
 * ====================================================================
 * 🎛️ PANEL DE CONTROL (¡RELLENA ESTO!)
 * ====================================================================
 */
// 1. Token de Verificación (El que inventaste tú)
const MY_VERIFY_TOKEN = "test2";

// 2. Token de la API de WhatsApp (El de Meta que empieza con EAAG...)
const WHATSAPP_TOKEN = "EAATXNIgf3igBQAZB4LdcICbFWWQuABUaDr7Dbu3irgkD9LIkXo4jciNAn41ZB9q18f6UGZA3dvKKfZBF1DESDcUuiwMFM9NvZB4ZBoAwJcLqEoVcUgvZAhNRCcZBpAFGH5pHAgPu0EoqPtxWL0M7lpOQHuwVVeCYKsd8apB9ZC6cTIwf0m5l66s2sy8UGhybA123j2iiBEp8vIzQloWnb32KGwkzUYy5jvMOgecrT0bo7DkgQR8DfEFDs7S3ijlD9ZCQHOhzNZB11Lxz3ddDO7XwkDqOwZDZD";

// 3. ID de tu número de teléfono (El numérico largo, NO tu celular)
const PHONE_ID = "907448895786536";

const PORT = 3000;

/**
 * ====================================================================
 * ⚙️ CONFIGURACIÓN TÉCNICA
 * ====================================================================
 */
const express = require("express");
const axios = require("axios"); // Importamos axios para poder responder
const app = express();
app.use(express.json());

/**
 * ====================================================================
 * 🔗 RUTA 1: VERIFICACIÓN (GET)
 * ====================================================================
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === MY_VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFICADO");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * ====================================================================
 * 📩 RUTA 2: CEREBRO DEL BOT (RECIBE Y RESPONDE)
 * ====================================================================
 */
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // 1. ¿Es un mensaje de WhatsApp?
  if (body.object === "whatsapp_business_account") {
    
    // 2. ¿Trae contenido?
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // Número del usuario
      const type = message.type;
      const msgBody = message.text ? message.text.body : "";

      console.log(`\n📩 MENSAJE DE: +${from}`);
      console.log(`💬 TEXTO: "${msgBody}"`);

      // 3. 🤖 LÓGICA DE RESPUESTA (Aquí usamos el Token y ID)
      // Solo respondemos si es texto para evitar bucles infinitos
      if (type === "text") {
        await enviarRespuesta(from, `Recibí tu mensaje: "${msgBody}"`);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

/**
 * ====================================================================
 * 📤 FUNCIÓN PARA ENVIAR MENSAJES A META
 * ====================================================================
 */
async function enviarRespuesta(paraQuien, texto) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v24.0/${PHONE_ID}/messages`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: paraQuien,
        type: "text",
        text: { body: texto },
      },
    });
    console.log(`✅ RESPUESTA ENVIADA A +${paraQuien}`);
  } catch (error) {
    console.error("❌ ERROR AL ENVIAR:", error.response ? error.response.data : error.message);
  }
}

/**
 * ====================================================================
 * 🚀 INICIO
 * ====================================================================
 */
app.listen(PORT, () => {
  console.log(`🚀 BOT LISTO EN PUERTO: ${PORT}`);
});