# Étape 1 : Utiliser une image de base avec Java et Node.js
FROM openjdk:17-slim

# Étape 2 : Installer Node.js
RUN apt update && apt install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Étape 3 : Créer un répertoire de travail dans le conteneur
WORKDIR /app

# Étape 4 : Copier tous les fichiers du projet dans le conteneur
COPY . .

# Étape 5 : Installer les dépendances Node.js
RUN npm install

# Étape 6 : Compiler tous les fichiers Java du répertoire public
RUN javac -cp . public/*.java

# Étape 7 : Exposer le port pour Express.js
EXPOSE 3000

# Étape 8 : Lancer le serveur Node.js
CMD ["node", "serveur.js"]

