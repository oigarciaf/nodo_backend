#src/Dockerfile
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json primero para aprovechar la caché de capas de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production

# Copia el resto del código de la aplicación
COPY . .

# Elimina el archivo .env si existe
RUN rm -f .env

# Establece la variable de entorno para el puerto
ENV PORT=8000

# Expone el puerto que utilizará la aplicación
EXPOSE 8000


# Comando para ejecutar la aplicación asegurando que escuche en todas las interfaces
CMD ["node", "src/app.js"]
