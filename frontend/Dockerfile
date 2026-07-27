# Stage 1: Build de l'application React avec Node.js
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration du package manager d'abord pour optimiser le cache Docker
COPY frontend/package*.json ./

# Installation des dépendances avec npm ci (reproductible et rapide)
RUN npm ci

# Copie du code source frontend
COPY frontend/ .

# Variable d'environnement pour que React appelle Nginx en relatif (/api) lors du build Docker
ENV REACT_APP_API_URL=/api

# Construction de l'application React pour la production
RUN npm run build

# Stage 2: Serveur web Nginx ultra-léger (Alpine) pour servir les fichiers statiques et faire reverse-proxy
FROM nginx:alpine

# Suppression de la configuration par défaut d'Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copie de notre configuration Nginx personnalisée avec Reverse Proxy API
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques générés au Stage 1 vers le répertoire d'Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Exposition du port 80 d'Nginx (qui sera mappé sur 3000 dans docker-compose)
EXPOSE 80

# Démarrage d'Nginx au premier plan
CMD ["nginx", "-g", "daemon off;"]
