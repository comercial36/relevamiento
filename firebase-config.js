// ============================================================
//  CONFIGURACIÓN DEL SISTEMA  (editar solo este archivo)
// ============================================================
//  1) Pegá abajo los datos de tu proyecto de Firebase
//     (Firebase > Configuración del proyecto > Tus apps > Configuración del SDK).
//  2) En "secretaria" escribí el correo de la ÚNICA cuenta de Secretaría
//     (ve cuadros, cambia preceptores y cursos y genera el link).
//     Los preceptores NO tienen cuenta: entran con el link que genera Secretaría.
//
//  Estos datos NO son secretos: la protección real está en las reglas
//  de seguridad (archivo firestore.rules) y en las cuentas de usuario.
// ============================================================
window.APP_CONFIG = {
  firebase: {
    apiKey: "PEGAR_AQUI_apiKey",
    authDomain: "PEGAR_AQUI.firebaseapp.com",
    projectId: "PEGAR_AQUI_projectId",
    storageBucket: "PEGAR_AQUI.appspot.com",
    messagingSenderId: "PEGAR_AQUI",
    appId: "PEGAR_AQUI_appId"
  },
  secretaria: [
    "prosecretario@tu-escuela.edu.ar"
  ],
  // OPCIONAL: planilla de Google. Cuando Secretaría carga un alumno nuevo,
  // se agrega también como fila en la planilla (ver README.md).
  // Dejalo así si todavía no lo configuraste.
  sheet: {
    url: "PEGAR_AQUI_la_URL_de_la_aplicacion_web_de_Apps_Script"
  }
};
