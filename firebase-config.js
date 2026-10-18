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
    apiKey: "AIzaSyALqHtgmWLYYmrRY4drbJRV6FecAOmGVpE",
    authDomain: "relevamiento-com-36.firebaseapp.com",
    projectId: "relevamiento-com-36",
    storageBucket: "relevamiento-com-36.firebasestorage.app",
    messagingSenderId: "995048627386",
    appId: "1:995048627386:web:6b839b52ebfb69efc2b683"
  },
  secretaria: [
    "relevamientocomercial36@protonmail.com"
  ],
  // OPCIONAL: planilla de Google. Cuando Secretaría carga un alumno nuevo,
  // se agrega también como fila en la planilla (ver README.md).
  // Dejalo así si todavía no lo configuraste.
  sheet: {
    url: "https://comercial36.github.io/relevamiento/"
  }
};
