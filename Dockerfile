# Étape 1 : Image de base avec Java
FROM openjdk:17

# Étape 2 : Installer Node.js
RUN apt update && apt install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Créer un répertoire de travail
WORKDIR /app

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Installer les dépendances Node.js
RUN npm install

# Compiler ton analyseur Java (si nécessaire)
# ⚠️ Modifie ce chemin selon ton projet
RUN javac -cp . src/analyseur/*.java

# Exposer le port utilisé par ton app Node.js
EXPOSE 3000

# Démarrer le serveur Node
CMD ["node", "serveur.js"]
