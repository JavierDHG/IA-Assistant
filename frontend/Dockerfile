# Usar una versión de Node LTS (Long-Term Support) como la 18 o 20 es más estable
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Eliminamos los flags problemáticos. 'npm install' es suficiente.
# Ahora respetará las versiones de package.json e instalará React 18.
RUN npm install

COPY . .

EXPOSE ####

CMD ["npm", "run", "dev", "--", "--host"]
