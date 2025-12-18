# Microservicio de Usuarios y Autenticación

## Información General

**Base URL:** `http://localhost:3000/v1`  
**Documentación Swagger:** `http://localhost:3000/api`  
**Versión API:** v1  
**Protocolo:** HTTP/HTTPS  
**Persistencia:** MongoDB  
**Imagen Docker estable:** `rubjimjim/microservice-userauth:latest`  
**Comando:** `docker pull rubjimjim/microservice-userauth:latest`  
**Imagen por commit/PR:** `docker pull rubjimjim/microservice-userauth:<tag>` (tags en https://github.com/BancUS-FISProject/microservice-user-auth/tree/<tag>)

---

## Endpoints Disponibles

Cada endpoint incluye cuerpo esperado y ejemplos de respuesta.

### 1. POST `/v1/users` — Crear usuario
- Cuerpo:
```json
{
  "iban": "ES9820385778983000760236",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "password": "s3cretPass",
  "phoneNumber": "+34123456789"
}
```
- Respuesta `201`:
```json
{
  "iban": "ES9820385778983000760236",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phoneNumber": "+34123456789"
}
```
- Errores: `400` datos duplicados o inválidos.
- Ejemplo cURL:
```bash
curl -X POST http://localhost:3000/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "iban": "ES9820385778983000760236",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "password": "s3cretPass",
    "phoneNumber": "+34123456789"
  }'
```

---

### 2. GET `/v1/users/{identifier}` — Obtener usuario por IBAN o email
- Parámetros: `identifier` (string IBAN o email).
- Respuesta `200`:
```json
{
  "iban": "ES9820385778983000760236",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phoneNumber": "+34123456789"
}
```
- Errores: `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X GET http://localhost:3000/v1/users/ES9820385778983000760236
# o bien por email:
# curl -X GET http://localhost:3000/v1/users/john.doe@example.com
```

---

### 3. PUT `/v1/users/{iban}` — Reemplazar usuario
- Parámetros: `iban` (string).
- Cuerpo:
```json
{
  "iban": "ES9820385778983000760236",
  "email": "aledb@bancus.com",
  "name": "Alejandro Díaz Brenes",
  "password": "123456",
  "phoneNumber": "+34633444555"
}
```
- Respuesta `200`:
```json
{
  "iban": "ES9820385778983000760236",
  "email": "aledb@bancus.com",
  "name": "Alejandro Díaz Brenes",
  "phoneNumber": "+34633444555"
}
```
- Errores: `400` datos duplicados o inválidos, `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X PUT http://localhost:3000/v1/users/ES9820385778983000760236 \
  -H "Content-Type: application/json" \
  -d '{
    "iban": "ES9820385778983000760236",
    "email": "aledb@bancus.com",
    "name": "Alejandro Díaz Brenes",
    "password": "123456",
    "phoneNumber": "+34633444555"
  }'
```

---

### 4. PATCH `/v1/users/{iban}` — Actualización parcial
- Parámetros: `iban` (string).
- Cuerpo (elige un campo: `name`, `passwordHash`, `phoneNumber`, `email`):
```json
{
  "field": "phoneNumber",
  "value": "+34666000111"
}
```
- Respuesta `200`:
```json
{
  "iban": "ES9820385778983000760236",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phoneNumber": "+34666000111"
}
```
- Errores: `400` datos inválidos, `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X PATCH http://localhost:3000/v1/users/ES9820385778983000760236 \
  -H "Content-Type: application/json" \
  -d '{"field": "phoneNumber", "value": "+34666000111"}'
```

---

### 5. DELETE `/v1/users/{iban}` — Eliminar usuario
- Parámetros: `iban` (string).
- Respuesta `204` sin cuerpo.
- Errores: `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X DELETE http://localhost:3000/v1/users/ES9820385778983000760236
```

---

### 6. DELETE `/v1/users` — Vaciar colección
- Respuesta `204` sin cuerpo.
- Ejemplo cURL:
```bash
curl -X DELETE http://localhost:3000/v1/users
```

---

### 7. GET `/v1/users` — Listar usuarios
- Respuesta `200` (array):
```json
[
  {
    "iban": "ES9820385778983000760236",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phoneNumber": "+34123456789"
  }
]
```
- Ejemplo cURL:
```bash
curl -X GET http://localhost:3000/v1/users
```

---

### 8. GET `/v1/users/{identifier}` — Buscar por email o IBAN (mismo endpoint)
- Parámetros: `identifier` (string IBAN o email).
- Respuesta `200`:
```json
{
  "iban": "ES9820385778983000760236",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phoneNumber": "+34123456789"
}
```
- Errores: `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X GET http://localhost:3000/v1/users/john.doe@example.com
# o por IBAN:
# curl -X GET http://localhost:3000/v1/users/ES9820385778983000760236
```

---

### 9. POST `/v1/auth/login` — Obtener token JWT
- Cuerpo:
```json
{
  "email": "john.doe@example.com",
  "password": "s3cretPass"
}
```
- Respuesta `200`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```
- El payload firmado incluye `email`, `sub` (id interno) y el plan del usuario (`basic`, `premium`, `business`).
- Errores: `401` credenciales inválidas.
- Ejemplo cURL:
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "s3cretPass"}'
```

---

## Códigos de Respuesta HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado |
| `204` | No Content | Eliminación sin cuerpo de respuesta |
| `400` | Bad Request | Datos inválidos o duplicados |
| `401` | Unauthorized | Credenciales incorrectas |
| `404` | Not Found | Recurso inexistente |

---

## Configuración de Desarrollo

### Variables de entorno
Replica `.env.example` a `.env` y ajusta según necesidad:
- `PORT`: puerto expuesto de la API (default `3000`).
- `MONGO_EXPOSED_PORT`: puerto para MongoDB en el host (default `27018`).
- `MONGO_HOST`: host interno de MongoDB (default `mongo`).
- `MONGO_PORT`: puerto interno de MongoDB (default `27017`).
- `MONGO_DB`: nombre de la base de datos (default `userauth_db`).
- `MONGO_URI`: URI completa; si existe tiene prioridad sobre el resto.
- `JWT_SECRET`: secreto para firmar tokens.
- `LOG_LEVEL`: nivel de log (`error`, `warn`, `log`, `debug`, `verbose`); default `log`.
- `LOG_FILE`: nombre base del archivo de logs rotados; default `microservice-user-auth.log`.
- `LOG_DIR`: directorio donde se guardan los logs; default `logs`. Se encuentran en `/usr/src/app/logs` dentro del contenedor.
- `LOG_BACKUP_COUNT`: número de archivos diarios a conservar; default `7`.

### Endpoints de salud
GET `/v1/health` devuelve:
- `200` `{ "status": "UP", "service": "user-auth" }` cuando el servicio está listo.
- `503` `{ "status": "STARTING", "detail": "Connecting to resources..." }` mientras inicializa.

### Docker Compose
```bash
# Iniciar servicios
docker compose up --build

# Ver logs del servicio API
docker compose logs -f api

# Reiniciar servicio API
docker compose restart api
```

### Comandos útiles dentro del contenedor
```bash
docker compose exec api npm run lint
docker compose exec api npm test
docker compose exec api npm run build
```

## Logging
- El servicio usa un logger propio que escribe a consola y a archivos diarios en `LOG_DIR/LOG_FILE-YYYY-MM-DD.log`, conservando `LOG_BACKUP_COUNT` ficheros.
- Cada petición HTTP queda registrada (método, URL, estado, tiempo). Los errores incluyen stack. Ajusta `LOG_LEVEL` y rutas mediante las variables de entorno listadas arriba.
