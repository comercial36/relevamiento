# Relevamiento Anual CABA – Sistema conectado

Páginas web (HTML) para cargar alumnos por preceptor y generar los cuadros del
relevamiento. **Todas las PC y vistas se actualizan solas**: lo que carga Secretaría o
un preceptor aparece en las demás PC a los pocos segundos, sin subir archivos.

- **GitHub Pages** aloja la página (gratis).
- **Firebase** (Google, plan gratuito) guarda los datos y sincroniza las PC.
- No depende de Claude.

## Cómo se entra

| Quién | Cómo entra | Qué ve |
|---|---|---|
| **Secretaría** (una sola cuenta) | Abre la página e ingresa con correo y contraseña | Todo: cuadros, preceptores y cursos, ciclos, y el botón **Link para preceptores** |
| **Preceptores** (sin cuentas) | Abren el **link** que les manda Secretaría | Carga de alumnos, listados de cursos y pase al ciclo siguiente |

Los preceptores no crean usuarios ni contraseñas: igual que un link de "vista de alumno", Secretaría les pasa el link y entran directo.

## Puesta en marcha (una sola vez, ~20 minutos)

### 1. Crear el proyecto en Firebase
1. Entrá a <https://console.firebase.google.com> con una cuenta de Google de la escuela → **Agregar proyecto** (podés desactivar Google Analytics).
2. **Compilación → Firestore Database → Crear base de datos** → modo *producción* → ubicación `southamerica-east1` (São Paulo).
3. **Compilación → Authentication → Comenzar → Método de acceso** y habilitá **dos** métodos:
   - **Correo electrónico/contraseña** (para Secretaría).
   - **Anónimo** (permite que los preceptores entren con el link, sin cuenta).
4. En **Authentication → Usuarios → Agregar usuario**, creá **una sola cuenta**: la de Secretaría (correo + contraseña).
5. En **Authentication → Configuración → Acciones del usuario**, destildá **Habilitar la creación (registro) de usuarios**.

### 2. Conectar la página
1. En **Configuración del proyecto (⚙) → General → Tus apps → Web `</>`**, registrá una app y copiá los datos de `firebaseConfig`.
2. Pegalos en **`firebase-config.js`** y escribí el correo de Secretaría en `secretaria`.
3. En **Firestore → Reglas**, pegá el contenido de **`firestore.rules`**, cambiá el correo de Secretaría y tocá **Publicar**.

### 3. Publicar en GitHub
1. Creá un repositorio en GitHub y subí: `index.html`, `firebase-config.js`, `firestore.rules` y este `README.md` (el archivo `planilla-apps-script.gs` no hace falta subirlo: se pega en Google).
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.**
3. Esperá 1–2 minutos. La dirección será `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.
4. En Firebase: **Authentication → Configuración → Dominios autorizados → Agregar dominio** → `TU-USUARIO.github.io`.

### 4. Usar
1. Secretaría abre la dirección e ingresa con su correo y contraseña.
2. Toca **Link para preceptores** → **Copiar link** y se lo manda a los preceptores (WhatsApp o mail).
3. Cada preceptor abre ese link. Queda recordado en esa PC: la próxima vez puede abrir la dirección normal.
4. **Salir** (arriba) borra los datos guardados en esa PC. Conviene usarlo en computadoras compartidas; el preceptor tendrá que volver a abrir el link.

## Cuidado con el link

Cualquier persona que tenga el link puede **ver y modificar** los alumnos, igual que cualquier preceptor. Compartilo solo con ellos. Los cursos y nombres de preceptores solo los puede cambiar Secretaría.

Si el link se filtra, o un preceptor deja la escuela y no debe seguir viendo los datos: Secretaría toca **Link para preceptores → Generar link nuevo**. El link anterior deja de funcionar al instante y se pasa el nuevo a quienes corresponda.

## Conectar con la planilla de Google de la escuela (opcional)
Cuando **Secretaría** carga un alumno nuevo en la página (a mano o con la carga masiva), el alumno se agrega también como **una fila nueva** en la planilla. Es un paso aparte y se hace una sola vez:

1. Abrí la planilla de la escuela → **Extensiones → Apps Script**. Borrá lo que haya y pegá todo el contenido de **`planilla-apps-script.gs`**.
2. Al comienzo del script, en `CONFIG`, completá:
   - `SHEET_NAME`: el nombre exacto de la pestaña donde está la base (por defecto `Alumnos`).
   - `FIREBASE_API_KEY`: la misma `apiKey` de `firebase-config.js`.
   - `ALLOWED_EMAILS`: los correos de Secretaría (los mismos de `firebase-config.js`).
   - `SEXO` y `CURSO`: cómo escribe la planilla el sexo y el curso (por defecto `Varón`/`Mujer`/`X` y `1° A`).
3. Revisá que los **títulos de las columnas** de tu planilla estén en la lista `COLUMNAS` (por ejemplo "Apellido y Nombre", "DNI", "Fecha de Nacimiento", "Teléfono", "Adulto Responsable", "Curso"). Si algún título es distinto, agregalo a la lista del dato que corresponde. Las columnas que no reconoce quedan vacías en la fila nueva. El script ya viene preparado para los títulos de la aplicación "Control de Libros Matrices": en la fila nueva, **Situación Académica** se completa con `Regular`, **Contacto** con el teléfono del adulto responsable (si no hay, el del alumno), y **Libro y Folio**, **Materias que Adeuda** y **Observaciones** quedan vacías para completarlas después. La fecha de nacimiento se escribe con el mismo formato que ya tenga la columna (texto `15/04/2010` o fecha real).
4. **Implementar → Nueva implementación → Tipo: Aplicación web** → *Ejecutar como*: **Yo** → *Quién tiene acceso*: **Cualquier persona** → Implementar. Aceptá los permisos y copiá la **URL de la aplicación web**.
5. Pegá esa URL en `firebase-config.js`, en `sheet.url`, y subí el cambio a GitHub.
6. Probá cargando un alumno de prueba (después borrá esa fila de la planilla).

**Cómo se comporta**
- Solo envía los alumnos **nuevos cargados por Secretaría**. Los que cargan los preceptores y los que ya existen no se envían, y las **ediciones posteriores no se reflejan** en la planilla.
- Si el legajo **ya está en la planilla**, no se duplica ni se modifica nada.
- La planilla necesita una columna de **legajo**.
- Si falla internet o la planilla, el alumno queda guardado en el sistema y aparece el botón verde **"Enviar a la planilla (N pendientes)"**; también se reintenta solo al ingresar.
- Aunque la dirección de la aplicación web sea accesible para cualquier persona, **solo funciona con el ingreso de Secretaría**: el script verifica el usuario con Google antes de escribir.
- Si más adelante cambiás el código del script, hay que hacer una **Nueva implementación** para que el cambio tome efecto.

## Cuando cambia un preceptor (renuncia, licencia, reemplazo)

Los alumnos están asociados al **curso**, no a la persona. No hay que crear ni borrar cuentas.

1. Secretaría entra a **Preceptores y cursos**, cambia el nombre (por ejemplo "Alejandro" por "Marta") y guarda. Todos ven el cambio solos.
2. Si la persona anterior **no debe seguir viendo los datos**: **Link para preceptores → Generar link nuevo** y pasar el nuevo link a los preceptores actuales y a la persona que ingresa.
3. Si un preceptor pasa a otros cursos, se le reasignan en **Preceptores y cursos** (por ejemplo `1A, 1B` a `2A, 2B`). Un curso con alumnos no se puede quitar hasta que esos alumnos se pasen o se reasignen.

Si alguien usó su propia computadora y nunca tocó **Salir**, el navegador puede conservar una copia de lo último que vio.

## Pasar los datos que ya tenés

1. En la versión anterior (la de Claude): **Descargar mi archivo (respaldo)**.
2. En esta versión, ingresá como Secretaría → **Unir archivo recibido** → elegí ese archivo. Los alumnos, ciclos y cursos se suben solos y los preceptores los ven.

## Cuidados

- **Respaldo:** de vez en cuando, **Descargar mi archivo (respaldo)** y guardalo.
- **Datos personales de menores:** quedan en servidores de Google. Conviene confirmar con la dirección de la escuela o el Ministerio que este uso está permitido.
- **Costos:** el plan gratuito de Firebase alcanza de sobra para una escuela (50.000 lecturas y 20.000 escrituras por día).
- **Sin internet:** si se corta la conexión, dejá la página abierta: los cambios se envían solos cuando vuelve. Si la cerrás antes, se envían la próxima vez que ingreses desde esa PC (siempre que no hayas tocado **Salir**).
- Si falta configurar Firebase, la página funciona en **modo local** (datos solo en esa PC).
