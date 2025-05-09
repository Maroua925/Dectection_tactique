# Étape 1 : Image de base avec Java et support APT (Debian)
FROM openjdk:17-slim

# Étape 2 : Installer Node.js 18
RUN apt update && apt install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Étape 3 : Créer un répertoire de travail dans le conteneur
WORKDIR /app

# Étape 4 : Copier tous les fichiers du projet dans le conteneur
COPY . .

# Étape 5 : Installer les dépendances Node.js
RUN npm install

# Étape 6 : Compiler les fichiers Java du parseur
RUN javac -cp . authenticateonetimePasswordTacticGrammaire/*.java

# Étape 7 : Exposer le port utilisé par Express.js
EXPOSE 3000

# Étape 8 : Lancer le serveur Node.js
CMD ["node", "serveur.js"]

