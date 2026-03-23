const { onRequest } = require("firebase-functions/v2/https");

const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.getDatos = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const nombreBusqueda = req.query.nombre; // Captura el parámetro de búsqueda
      let snapshot;

      if (nombreBusqueda) {
        // Implementa búsqueda por columna secundaria como pide la guía
        snapshot = await db.collection("dato")
                           .where("nombre", "==", nombreBusqueda)
                           .get();
      } else {
        snapshot = await db.collection("datos").get();
      }

      let resultados = [];
      snapshot.forEach(doc => {
        resultados.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(resultados);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
});