# Étape 1 : Image de base avec Java (Debian-based)
FROM openjdk:17-slim

# Étape 2 : Installer Node.js
RUN apt update && apt install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Créer un répertoire de travail
WORKDIR /app

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Installer les dépendances Node.js
RUN npm install

# Compiler ton analyseur Java (modifie le chemin si nécessaire)
RUN javac -cp . src/analyseur/*.java

# Exposer le port utilisé
EXPOSE 3000

# Démarrer le serveur Node
CMD ["node", "serveur.js"]
