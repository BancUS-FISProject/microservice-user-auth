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
  "email": "john.doe@example.com",
  "name": "John Doe",
  "password": "s3cretPass",
  "phoneNumber": "+34123456789"
}
```
- Respuesta `201`:
```json
{
  "id": 1,
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
    "email": "john.doe@example.com",
    "name": "John Doe",
    "password": "s3cretPass",
    "phoneNumber": "+34123456789"
  }'
```

---

### 2. GET `/v1/users/{id}` — Obtener usuario
- Parámetros: `id` (integer).
- Respuesta `200`:
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phoneNumber": "+34123456789"
}
```
- Errores: `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X GET http://localhost:3000/v1/users/1
```

---

### 3. PUT `/v1/users/{id}` — Reemplazar usuario
- Parámetros: `id` (integer).
- Cuerpo:
```json
{
  "email": "aledb@bancus.com",
  "name": "Alejandro Díaz Brenes",
  "password": "123456",
  "phoneNumber": "+34633444555"
}
```
- Respuesta `200`:
```json
{
  "id": 1,
  "email": "aledb@bancus.com",
  "name": "Alejandro Díaz Brenes",
  "phoneNumber": "+34633444555"
}
```
- Errores: `400` datos duplicados o inválidos, `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X PUT http://localhost:3000/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aledb@bancus.com",
    "name": "Alejandro Díaz Brenes",
    "password": "123456",
    "phoneNumber": "+34633444555"
  }'
```

---

### 4. PATCH `/v1/users/{id}` — Actualización parcial
- Parámetros: `id` (integer).
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
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phoneNumber": "+34666000111"
}
```
- Errores: `400` datos inválidos, `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X PATCH http://localhost:3000/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{"field": "phoneNumber", "value": "+34666000111"}'
```

---

### 5. DELETE `/v1/users/{id}` — Eliminar usuario
- Parámetros: `id` (integer).
- Respuesta `204` sin cuerpo.
- Errores: `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X DELETE http://localhost:3000/v1/users/1
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
    "id": 1,
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

### 8. GET `/v1/users/email/{email}` — Buscar por email
- Parámetros: `email` (string).
- Respuesta `200`:
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phoneNumber": "+34123456789"
}
```
- Errores: `404` no encontrado.
- Ejemplo cURL:
```bash
curl -X GET http://localhost:3000/v1/users/email/john.doe@example.com
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
