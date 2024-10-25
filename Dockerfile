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
ENV NODE_ENV=production
ENV PORT=8080

# Expone el puerto que utilizará la aplicación
EXPOSE 8080


# Comando para ejecutar la aplicación asegurando que escuche en todas las interfaces
CMD ["node", "src/app.js"]
