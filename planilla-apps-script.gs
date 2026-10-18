/**
 * Recibe los alumnos NUEVOS que carga Secretaría en la página y los agrega
 * como una fila nueva en la planilla de Google de la escuela.
 *
 * - Solo acepta pedidos de usuarios de Secretaría (se verifica el ingreso
 *   con el mismo usuario de Firebase de la página).
 * - Si el legajo ya está en la planilla, NO lo duplica ni lo modifica.
 * - Reconoce las columnas por su título (ver COLUMNAS). Las columnas que
 *   no reconoce las deja vacías.
 *
 * Instalación: ver README.md ("Conectar con la planilla de Google").
 */
const CONFIG = {
  SHEET_NAME: 'Alumnos',                       // nombre de la pestaña de la planilla
  HEADER_ROW: 1,                               // fila donde están los títulos
  FIREBASE_API_KEY: 'PEGAR_AQUI_apiKey',       // la misma apiKey de firebase-config.js
  ALLOWED_EMAILS: ['prosecretario@tu-escuela.edu.ar'],  // correos de Secretaría
  SEXO: { 'Varón': 'Varón', 'Mujer': 'Mujer', 'X': 'X' },   // cómo escribe el sexo la planilla
  CURSO: function (c) { return c.charAt(0) + '° ' + c.charAt(1); },   // 1A -> "1° A"
  SITUACION_NUEVA: 'Regular',   // valor de "Situación Académica" para un alumno nuevo ('' para dejarlo vacío)
  CONTACTO: 'responsable'       // columna "Contacto": 'responsable' (teléfono del adulto; si no hay, el del alumno) o 'alumno'
};

// Títulos de columna reconocidos (sin tildes ni mayúsculas) -> dato de la página.
// Si la planilla usa otro título, agregalo a la lista que corresponda.
const COLUMNAS = {
  legajo: ['legajo', 'nro legajo', 'n legajo', 'no legajo', 'numero de legajo', 'n de legajo', 'nro de legajo'],
  nombre: ['apellido y nombre', 'nombre y apellido', 'apellido nombre', 'nombre completo', 'alumno', 'estudiante'],
  dni: ['dni', 'documento', 'nro documento', 'numero de documento', 'n documento'],
  fechaNacimiento: ['fecha de nacimiento', 'fecha nacimiento', 'fecha nac', 'nacimiento'],
  genero: ['sexo', 'genero', 'sexo genero'],
  nacionalidad: ['nacionalidad', 'pais de origen'],
  domicilio: ['domicilio', 'direccion'],
  telAlumno: ['telefono', 'telefono del alumno', 'telefono alumno', 'tel alumno', 'celular', 'telefono de contacto del alumno'],
  email: ['email', 'mail', 'correo', 'correo electronico', 'email alumno', 'correo electronico del alumno'],
  respNombre: ['adulto responsable', 'responsable', 'tutor', 'nombre del responsable', 'padre madre o tutor'],
  respTel: ['telefono responsable', 'telefono del responsable', 'tel responsable', 'telefono adulto responsable', 'telefono de contacto del responsable', 'celular responsable'],
  respEmail: ['email responsable', 'correo responsable', 'mail responsable', 'email del responsable', 'correo del responsable', 'correo electronico del responsable'],
  curso: ['curso', 'division', 'anio y division', 'curso y division'],
  ciclo: ['ciclo', 'ciclo lectivo', 'anio lectivo'],
  contacto: ['contacto', 'telefono de contacto', 'datos de contacto'],
  situacion: ['situacion academica', 'situacion', 'condicion'],
  // Estas columnas se reconocen pero la página no tiene el dato: quedan vacías.
  libroFolio: ['libro y folio', 'libro folio', 'libro', 'folio'],
  materias: ['materias que adeuda', 'materias adeudadas', 'materias adeudadas previas'],
  observaciones: ['observaciones', 'observacion']
};

function norm_(s) {
  return String(s == null ? '' : s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function campoDe_(titulo) {
  const n = norm_(titulo);
  if (!n) return '';
  for (const campo in COLUMNAS) {
    if (COLUMNAS[campo].indexOf(n) >= 0) return campo;
  }
  return '';
}

function valor_(campo, s, fechaComoFecha) {
  switch (campo) {
    case '': case 'libroFolio': case 'materias': case 'observaciones': return '';
    case 'contacto': return CONFIG.CONTACTO === 'alumno' ? (s.telAlumno || s.respTel || '') : (s.respTel || s.telAlumno || '');
    case 'situacion': return CONFIG.SITUACION_NUEVA || '';
    case 'email': return s.email || s.respEmail || '';
    case 'curso': return s.curso ? CONFIG.CURSO(s.curso) : '';
    case 'genero': return CONFIG.SEXO[s.genero] || s.genero || '';
    case 'fechaNacimiento': {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.fechaNacimiento || '');
      if (!m) return '';
      return fechaComoFecha ? new Date(+m[1], +m[2] - 1, +m[3]) : m[3] + '/' + m[2] + '/' + m[1];   // dd/mm/aaaa
    }
    default: return s[campo] == null ? '' : s[campo];
  }
}

function emailDeToken_(idToken) {
  if (!idToken) return null;
  const r = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(CONFIG.FIREBASE_API_KEY),
    { method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return null;
  const u = (JSON.parse(r.getContentText()).users || [])[0];
  return u && u.email ? u.email : null;
}

function salida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return salida_({ ok: true, mensaje: 'Planilla conectada' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(e.postData.contents);
    const email = emailDeToken_(body.idToken);
    const permitido = email && CONFIG.ALLOWED_EMAILS.map(function (x) { return x.toLowerCase(); }).indexOf(email.toLowerCase()) >= 0;
    if (!permitido) return salida_({ ok: false, error: 'Usuario no autorizado' });

    lock.waitLock(20000);
    const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET_NAME);
    if (!sh) return salida_({ ok: false, error: 'No existe la pestaña "' + CONFIG.SHEET_NAME + '"' });

    const lastCol = sh.getLastColumn();
    const titulos = sh.getRange(CONFIG.HEADER_ROW, 1, 1, lastCol).getValues()[0];
    const campos = titulos.map(campoDe_);
    const iLeg = campos.indexOf('legajo');
    if (iLeg < 0) return salida_({ ok: false, error: 'La planilla no tiene una columna de legajo reconocible' });

    // ¿La columna de fecha de nacimiento de la planilla guarda fechas reales o texto (15/04/2010)?
    const iFecha = campos.indexOf('fechaNacimiento');
    let fechaComoFecha = false;
    if (iFecha >= 0 && sh.getLastRow() > CONFIG.HEADER_ROW) fechaComoFecha = sh.getRange(sh.getLastRow(), iFecha + 1).getValue() instanceof Date;

    const existentes = {};
    const lastRow = sh.getLastRow();
    if (lastRow > CONFIG.HEADER_ROW) {
      sh.getRange(CONFIG.HEADER_ROW + 1, iLeg + 1, lastRow - CONFIG.HEADER_ROW, 1).getValues()
        .forEach(function (r) { existentes[String(r[0]).trim().toLowerCase()] = true; });
    }

    const results = [];
    (body.students || []).forEach(function (s) {
      const clave = String(s.legajo == null ? '' : s.legajo).trim().toLowerCase();
      if (!clave) { results.push({ legajo: s.legajo, status: 'error' }); return; }
      if (existentes[clave]) { results.push({ legajo: s.legajo, status: 'exists' }); return; }
      const fila = campos.map(function (c) { return valor_(c, s, fechaComoFecha); });
      const r = sh.getLastRow() + 1;
      campos.forEach(function (c, i) {   // legajo, DNI, teléfonos (y la fecha si la planilla usa texto) como texto
        if (['legajo', 'dni', 'telAlumno', 'respTel', 'contacto'].indexOf(c) >= 0 || (c === 'fechaNacimiento' && !fechaComoFecha)) sh.getRange(r, i + 1).setNumberFormat('@');
      });
      sh.getRange(r, 1, 1, lastCol).setValues([fila]);
      existentes[clave] = true;
      results.push({ legajo: s.legajo, status: 'added' });
    });
    return salida_({ ok: true, results: results });
  } catch (err) {
    return salida_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
