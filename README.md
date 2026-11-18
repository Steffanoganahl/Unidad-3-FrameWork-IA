# API REST - Sistema de Gestión de Tareas Bibliotecarias

Aplicación web y API REST desarrollada con Node.js, Express y Prisma ORM sobre SQLite. Incorpora autenticación mediante JSON Web Tokens (JWT), control de acceso basado en roles (RBAC), validaciones de seguridad en el servidor y una interfaz web para la gestión de tareas bibliotecarias.

---

## Integrantes

- Carmen Araya
- Sergio Chavarri
- Steffano Ganahl

**Asignatura:** Framework de Desarrollo e Inteligencia Artificial.
**Carrera:** Técnico Universitario en Programación Computacional.
**Institución:** Universidad Mayor.
**Fecha:** Noviembre de 2026

---

## 1. Stack tecnológico

- **Entorno de ejecución:** Node.js (v18 o superior).
- **Framework backend:** Express.js.
- **Mapeo objeto-relacional (ORM):** Prisma ORM.
- **Base de datos:** SQLite.
- **Seguridad y criptografía:** JSON Web Tokens (JWT), bcryptjs y Helmet.
- **Comunicación HTTP:** CORS y Express.
- **Frontend:** HTML5, CSS3 y JavaScript nativo.

---

## 2. Requisitos previos

- Node.js versión 18.0.0 o superior.
- npm.
- Git.
- Navegador web moderno.

Herramientas opcionales:

- Postman para interactuar con los endpoints de la API.
- TablePlus u otro visor de bases de datos SQLite.

---

## 3. Instalación y puesta en marcha

### Paso 1: Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

Ingresar a la carpeta del proyecto:

```bash
cd NOMBRE_DEL_REPOSITORIO
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crear el archivo `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

Configurar las siguientes variables:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_SEGURO
JWT_EXPIRES_IN=2h
```

**Importante:** cada desarrollador debe utilizar su propio secreto JWT. El archivo `.env` contiene información privada y no debe publicarse en GitHub.

### Paso 4: Generar el cliente Prisma

```bash
npm run prisma:generate
```

### Paso 5: Ejecutar las migraciones

```bash

# Aplicar las migraciones existentes
npx prisma migrate deploy

# Generar el cliente Prisma
npm run prisma:generate

```

Este comando crea o actualiza la estructura de la base de datos local utilizando las migraciones del proyecto.

---

## 4. Comandos de ejecución

**Modo desarrollo:**

```bash
npm run dev
```

**Modo normal:**

```bash
npm start
```

El servidor quedará disponible en:

```text
http://localhost:3000
```

La interfaz web se encuentra disponible en la ruta raíz:

```text
http://localhost:3000/
```

La API REST utiliza el prefijo:

```text
http://localhost:3000/api/v1
```

---

## 5. Roles y permisos

El sistema implementa dos roles de acceso:

| Funcionalidad | USER | ADMIN |
|---|:---:|:---:|
| Registrarse | Sí | No mediante registro público |
| Iniciar sesión | Sí | Sí |
| Consultar perfil propio | Sí | Sí |
| Consultar tareas propias | Sí | Sí |
| Consultar tareas de otros usuarios | No | Sí |
| Crear tareas | Sí | Sí |
| Modificar tareas propias | Sí | Sí |
| Modificar tareas ajenas | No | Sí |
| Eliminar tareas | No | Sí |
| Consultar usuarios registrados | No | Sí |

Los usuarios públicos reciben automáticamente el rol `USER`.

La creación de administradores se realiza mediante un script independiente, evitando que un usuario pueda asignarse privilegios administrativos desde el registro público.

### Creación de un administrador

El proyecto incorpora el script:

```text
scripts/create-admin.js
```

Para ejecutarlo, se deben configurar temporalmente las siguientes variables en `.env`:

```env
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=CAMBIAR_POR_UNA_CLAVE_SEGURA
```

Ejecutar:

```bash
node -r dotenv/config scripts/create-admin.js
```

El script crea una cuenta con rol `ADMIN`, almacena su contraseña mediante bcrypt y evita modificar el rol de una cuenta existente.

Después de crear la cuenta, se recomienda retirar las variables administrativas temporales del archivo `.env`.

---

## 6. Endpoints de la API

Todos los endpoints protegidos requieren el encabezado:

```text
Authorization: Bearer TOKEN_JWT
```

### 6.1. Módulo de autenticación (`/api/v1/auth`)

| Método | Endpoint | Autenticación | Descripción |
|:---:|---|:---:|---|
| POST | `/api/v1/auth/register` | No | Registra un nuevo usuario con rol USER. |
| POST | `/api/v1/auth/login` | No | Valida credenciales y entrega un token JWT. |
| GET | `/api/v1/auth/me` | Sí | Retorna los datos del usuario autenticado. |

### 6.2. Módulo de tareas (`/api/v1/tasks`)

| Método | Endpoint | Rol permitido | Descripción |
|:---:|---|---|---|
| GET | `/api/v1/tasks` | USER / ADMIN | Lista las tareas según los permisos del usuario. |
| GET | `/api/v1/tasks/:id` | USER / ADMIN | Consulta una tarea por su UUID. |
| POST | `/api/v1/tasks` | USER / ADMIN | Crea una tarea asociada al usuario autenticado. |
| PUT | `/api/v1/tasks/:id` | USER / ADMIN | Modifica una tarea respetando las reglas de propiedad. |
| DELETE | `/api/v1/tasks/:id` | ADMIN | Elimina una tarea. |

### 6.3. Módulo administrativo (`/api/v1/admin`)

| Método | Endpoint | Rol permitido | Descripción |
|:---:|---|---|---|
| GET | `/api/v1/admin/users` | ADMIN | Consulta los usuarios registrados y sus datos públicos. |

Las respuestas de este endpoint no exponen las contraseñas almacenadas.

### 6.4. Estado del servidor

| Método | Endpoint | Autenticación | Descripción |
|:---:|---|:---:|---|
| GET | `/api/v1/health` | No | Comprueba la disponibilidad del servidor. |

---

## 7. Validaciones y seguridad

La aplicación incorpora diferentes medidas de protección:

- Contraseñas almacenadas mediante bcryptjs con 10 rondas de salt.
- Autenticación mediante JWT y validación de tokens.
- Restricción de algoritmos de firma JWT a HS256.
- Autorización basada en roles USER y ADMIN.
- Validación de identificadores UUID.
- Validación de tipos de datos y cuerpos de solicitudes.
- Lista permitida de estados de tareas: `PENDING`, `IN_PROGRESS` y `COMPLETED`.
- Verificación de propiedad de las tareas.
- Protección de encabezados HTTP mediante Helmet.
- Límite de tamaño de 10 KB para solicitudes JSON.
- Middleware centralizado de manejo de errores.
- Exclusión de información sensible de las respuestas de usuarios.

### Códigos HTTP principales

| Código | Significado |
|:---:|---|
| 200 | Solicitud procesada correctamente. |
| 201 | Recurso creado correctamente. |
| 400 | Solicitud inválida o datos incorrectos. |
| 401 | Autenticación requerida o inválida. |
| 403 | Operación no autorizada. |
| 404 | Recurso no encontrado. |
| 500 | Error interno del servidor. |

---

## 8. Interfaz web (frontend)

El proyecto incluye una interfaz web desarrollada con HTML, CSS y JavaScript nativo, servida directamente por Express desde la carpeta `public/`.

No requiere frameworks frontend ni dependencias adicionales.

La interfaz permite:

- Registrar usuarios e iniciar sesión.
- Cerrar sesión.
- Consultar y administrar tareas.
- Visualizar estadísticas generales de tareas.
- Consultar estados y responsables.
- Editar tareas según los permisos correspondientes.
- Eliminar tareas desde una cuenta ADMIN.
- Consultar usuarios registrados desde el panel administrativo.

La aplicación utiliza `sessionStorage` para mantener el token JWT y los datos básicos de la sesión del navegador.

### Estructura frontend

```text
public/
├── index.html
├── css/
│   └── styles.css
└── js/
    └── app.js
```

---

## 9. Estructura del proyecto

```text
gestion-tareas-api/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── scripts/
│   └── create-admin.js
├── src/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   └── task.controller.js
│   ├── lib/
│   │   └── prisma.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── role.middleware.js
│   ├── repositories/
│   │   ├── task.repository.js
│   │   └── user.repository.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   └── task.routes.js
│   ├── services/
│   │   ├── admin.service.js
│   │   ├── auth.service.js
│   │   └── task.service.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 10. Pruebas realizadas

Se ejecutaron pruebas de integración para verificar el funcionamiento del servidor, la autenticación, las validaciones y los permisos.

| N.º | Prueba | Resultado |
|:---:|---|:---:|
| 1 | Inicio del servidor | Aprobada |
| 2 | Endpoint de salud | Aprobada |
| 3 | Acceso a tareas sin token | Aprobada |
| 4 | Registro de usuario | Aprobada |
| 5 | Creación con estado inválido | Aprobada |
| 6 | Consulta de tarea ajena por USER | Aprobada |
| 7 | Modificación de tarea ajena por USER | Aprobada |
| 8 | Eliminación de tarea por USER | Aprobada |
| 9 | Consulta administrativa de usuarios | Aprobada |
| 10 | Acceso de USER al endpoint administrativo | Aprobada |

Las pruebas confirmaron el comportamiento esperado de los códigos HTTP 200, 201, 400, 401 y 403, según cada escenario.

---

## 11. Consideraciones para colaboración

Para ejecutar el proyecto localmente, cada integrante debe instalar las dependencias, configurar su propio archivo `.env` y ejecutar las migraciones de Prisma.

No se deben compartir archivos `.env`, tokens JWT, contraseñas ni bases de datos locales que contengan información personal o credenciales.

---

**Proyecto académico:** Framework de Desarrollo e Inteligencia Artificial — Unidad 3.
**Universidad Mayor.**