User/Auth Microservice
======================

API de usuarios y autenticación con NestJS + MongoDB. Se ejecuta vía Docker Compose (API + Mongo).

Requisitos
----------
- Docker y Docker Compose

Configuración (.env)
--------------------
Crea un `.env` (puedes copiar `.env.example`). Variables disponibles:
- `PORT`: puerto de la API dentro del contenedor (y mapeo al host). Por defecto `3000`.
- `MONGO_EXPOSED_PORT`: puerto en el host para exponer MongoDB. Por defecto `27018`.
- `MONGO_HOST`: host interno al que conectará la API. Por defecto `mongo` (nombre del servicio).
- `MONGO_PORT`: puerto interno de MongoDB dentro de la red de Docker. Por defecto `27017`.
- `MONGO_DB`: nombre de la base de datos. Por defecto `userauth_db`.
- `MONGO_URI`: URI completa; si se define tiene prioridad sobre las variables anteriores.
- `JWT_SECRET`: secreto para firmar tokens.

Arranque con Docker Compose
---------------------------
1) Configura el `.env`.  
2) Levanta los servicios:
   ```
   docker compose up --build
   ```
3) Endpoints:
   - API: http://localhost:3000 (o el puerto que hayas puesto en `PORT`)
   - Swagger UI: http://localhost:3000/api
   - MongoDB expuesto en el host en `localhost:27018` (o el valor de `MONGO_EXPOSED_PORT`)

Comandos útiles (dentro del contenedor)
---------------------------------------
Si necesitas ejecutar scripts de npm:
```
docker compose exec api npm run lint
docker compose exec api npm test
docker compose exec api npm run build
```

Notas
-----
- Si defines `MONGO_URI`, la app la usará directamente; en caso contrario, construye la URI con `MONGO_HOST` + `MONGO_PORT` + `MONGO_DB`.
- El servicio `api` espera que `mongo` esté disponible en la red interna de Docker (resolviendo por nombre de servicio).
- Swagger está montado en `/api` y requiere `Bearer` cuando se active el flujo JWT.
