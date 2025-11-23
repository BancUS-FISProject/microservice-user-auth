microservice-userAuth
=====================

Microservicio de autenticación/gestión de usuarios construido con NestJS y MongoDB (Mongoose). Expone operaciones CRUD básicas, documentación Swagger y hashing de contraseñas con bcrypt.

Requisitos
----------
- Node.js 18+ y npm
- MongoDB accesible (local o remoto)

Dependencias principales
------------------------
- NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/jwt`)
  ```bash
  npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/jwt
  ```
- Mongoose (`mongoose`, `@nestjs/mongoose`)
  ```bash
  npm install mongoose @nestjs/mongoose
  ```
- Swagger (`@nestjs/swagger`, `swagger-ui-express`)
  ```bash
  npm install @nestjs/swagger swagger-ui-express
  ```
- Validación (`class-validator`, `class-transformer`)
  ```bash
  npm install class-validator class-transformer
  ```
- Hashing (`bcrypt`)
  ```bash
  npm install bcrypt
  ```

Instalación
-----------
```bash
npm install
```

Ejecución
---------
```bash
# desarrollo con recarga
npm run start:dev

# producción (requiere build previo)
npm run build
npm run start:prod
```

Configuración
-------------
- Configura la cadena de conexión a MongoDB en en tu archivo de variables de entorno .env (define y da valor a MONGO_URI y PORT).
- Swagger: disponible en `/api` tras arrancar la app.

Endpoints
---------
- `POST /users` — crear usuario (hash de contraseña, ids autoincrementales).
- `GET /users` — listar todos los usuarios.
- `GET /users/:id` — obtener usuario por id.
- `PUT /users/:id` — reemplazar datos del usuario.
- `PATCH /users/:id` — actualizar un campo (`name | passwordHash | phoneNumber | email`).
- `DELETE /users/:id` — eliminar un usuario (204).
- `DELETE /users` — eliminar todos los usuarios (204).
