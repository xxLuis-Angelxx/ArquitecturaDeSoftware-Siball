# Siball: migración de base de datos y autenticación del backend

## 1. Aplicar la migración SQL

La base de datos y las seis tablas operativas (`habitaciones`, `clientes`, `reservas`, `estancias`, `pagos`, `comprobantes`) deben existir previamente.

En MariaDB/MySQL, ejecutar:

```sql
USE siball;
SOURCE ruta/a/sql/001_usuarios.sql;
```

La migración agrega `usuarios`, con correo único, hash de contraseña, rol (`USER` o `ADMIN`), estado activo y vínculo opcional a `clientes`. No modifica ni borra las reservas existentes. Se debe ejecutar antes de iniciar el backend.

## 2. Configuración y arranque

Mantener las variables de conexión de `src/main/resources/application.properties` actualizadas para el entorno.

Variables opcionales:

- `SIBALL_JWT_SECRET`: secreto aleatorio largo, de al menos 32 bytes.
- `SIBALL_TOKEN_TTL_SECONDS`: duración del token; por defecto 14400 segundos (4 horas).
- `SIBALL_ADMIN_EMAIL`: por defecto `admin@epiis.com`.
- `SIBALL_ADMIN_PASSWORD`: por defecto `Admin12345`.

En el primer arranque tras aplicar la migración, el backend crea al administrador con BCrypt. Si esa cuenta ya existe con rol `ADMIN`, no sobrescribe su contraseña. Si el correo existe con otro rol, el arranque falla expresamente y no eleva sus privilegios automáticamente.

**Importante:** las credenciales predeterminadas son solo para desarrollo local. Antes de desplegar, definir `SIBALL_ADMIN_PASSWORD` y `SIBALL_JWT_SECRET` en el entorno y cambiar la contraseña inicial.

## 3. Endpoints de autenticación

### Registro de huésped

`POST /api/auth/registro`

```json
{
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "nombres": "Ana",
  "apellidos": "Pérez",
  "telefono": "999111222",
  "correo": "ana@example.com",
  "password": "UnaClaveSegura123"
}
```

El registro siempre crea un usuario con rol `USER`; el cliente no puede elegir el rol. La contraseña se almacena como hash BCrypt. Si el documento ya corresponde a un cliente precargado, para vincularlo la cuenta debe usar el mismo correo registrado; si no coincide, el backend rechaza el registro.

### Iniciar sesión

`POST /api/auth/login`

```json
{
  "correo": "ana@example.com",
  "password": "UnaClaveSegura123"
}
```

La respuesta contiene `token`, `tipoToken` (`Bearer`), `expiraEnSegundos` y `usuario` (`id`, `correo`, `rol`, nombres y apellidos). Enviar el token en las rutas protegidas:

```http
Authorization: Bearer <token>
```

### Cuenta actual

`GET /api/auth/me` — requiere token.

## 4. Reglas de acceso actuales

- Público: `GET /api/habitaciones`, `GET /api/habitaciones/{id}` y `GET /api/habitaciones/disponibles`.
- Huésped con sesión (`USER`): `POST /api/reservas`, `GET /api/reservas/mias` y consulta de sus reservas por código.
- Administrador (`ADMIN`): operaciones de escritura de habitaciones y endpoints de pagos, estancias, comprobantes y listado global de reservas.
- Los huéspedes no pueden consultar la reserva de otro usuario cambiando el código.
- El backend valida firma y caducidad del token y comprueba en la base de datos que la cuenta esté activa y que el rol no haya cambiado.

Para crear una reserva, el backend usa el cliente vinculado a la cuenta autenticada; no confía en los nombres, documento o correo que vengan en el cuerpo de la solicitud.

## 5. Verificación

Este entorno no tiene Maven instalado y el Maven Wrapper no pudo descargar la distribución, por lo que no se afirma que el proyecto compile o arranque. Antes de integrar con el frontend, ejecutar en un entorno con acceso a Maven y MariaDB:

```bash
./mvnw test
./mvnw spring-boot:run
```

Después probar registro, login de usuario, login de administrador, reserva sin token (debe dar 401), reserva con usuario y operación administrativa con usuario normal (debe dar 403).
