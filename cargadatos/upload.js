const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./clave.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const data = JSON.parse(fs.readFileSync("paises.json", "utf8"));

async function uploadData() {
  const collection = db.collection("datos");

  for (const item of data) {
    await collection.add(item);
  }

  console.log("Datos cargados correctamente");
}

uploadData();