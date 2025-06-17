# Usa la imagen oficial de Node 22
FROM node:22.15

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del proyecto
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copia el resto del código fuente
COPY . .

# Expone el puerto que usa Vite por defecto
EXPOSE 5173

# Comando por defecto: iniciar el dev server
CMD ["npm", "run", "dev"]
