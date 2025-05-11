# Dectection_tactique - TracTech🔍

## 📘 Manuel d’Utilisation

### Détection des Tactiques Architecturales dans les Logiciels  
**Mai 2025**  
Développé par l’équipe **TracTech🔍**  
École Nationale Supérieure d’Informatique (ESI), Alger, Algérie  
🔗 [Dépôt GitHub](https://github.com/Maroua925/Dectection_tactique.git)

---

## 🔍 Introduction

**TracTech🔍** est une plateforme web conçue pour analyser des **traces d’exécution** de logiciels et détecter les **tactiques architecturales**.  
Elle s’appuie sur **JavaCC** et des grammaires **XPG** pour identifier des structures logicielles complexes.

Ce manuel fournit toutes les instructions nécessaires pour :
- Utiliser le site web TracTech🔍 en ligne (jusqu’au 9 juin 2025).
- Analyser un fichier de trace.
- Comprendre les tactiques disponibles.
- Configurer et utiliser le projet localement après cette date.

---

## 🌐 Accéder au Site TracTech🔍

### ✅ Avant le 9 Juin 2025  
Le site est disponible en ligne à l'adresse suivante :  
🔗 [https://dectection-tactique.onrender.com/home.html](https://dectection-tactique.onrender.com/home.html)

### Comment utiliser :
1. Cliquez sur le lien ci-dessus.
2. Accédez à la section **Trace Analyzer** via le menu (`index.html`).
3. Suivez les étapes décrites dans la section **Analyser une Trace**.

> **Remarque :** Vous aurez besoin d’un fichier `.txt` au format correct.

### ❌ Après le 9 Juin 2025  
Le site ne sera plus hébergé. Utilisez la **configuration locale** décrite ci-dessous.

---

## 🧪 Analyser une Trace d’Exécution

1. **Accéder à Trace Analyzer** : menu `TactiqueDetector` → `index.html`
2. **Téléverser un fichier** `.txt`
3. **Validation automatique** du format :  
   Le format requis est :  CALLER:NomCaller,METHOD:NomMethode,CALLEE:NomCallee;
En cas d’erreur, un message détaillé s’affiche.
4. **Choisir une tactique** (ex : Authentication ID/Password, Authorizeuser)
5. **Lancer l’analyse**
6. **Visualiser les résultats** : lignes impliquées, objets détectés, sortie complète du parseur.

> 📌 **Note :** En cas d’erreur de format, corrigez selon les instructions affichées.

---

## 🛠️ Configuration Locale (Après le 9 Juin 2025)

### 🔧 Prérequis

- **JDK 23** : [Télécharger ici](https://www.oracle.com/java/technologies/downloads/)
- **Visual Studio Code** : [Télécharger ici](https://code.visualstudio.com/)
- **Extension JavaCC pour VS Code**
- **Node.js** (incluant `npm`) : [Télécharger ici](https://nodejs.org/)
- **Git** : [Télécharger ici](https://git-scm.com/)

### ⚙️ Étapes de Configuration

```bash
# 1. Cloner le dépôt
git clone https://github.com/Maroua925/Dectection_tactique.git

# 2. Accéder au répertoire
cd Dectection_tactique

# 3. Installer les dépendances Node.js
npm install

# 4. Lancer le serveur
node server.js
### 🌐 Accéder au Site en Local

Une fois le serveur démarré, ouvrez votre navigateur et accédez à :  
👉 [http://localhost:4899/home.html](http://localhost:4899/home.html) pour utiliser le site localement.

---

### 🛠️ Dépannage

- Si le serveur ne démarre pas, vérifiez que **Node.js** est correctement installé en exécutant :
  ```bash
  node -v
  npm -v
  Assurez-vous que JDK 23 est configuré dans votre variable d’environnement JAVA_HOME.
 Si JavaCC ne fonctionne pas dans VS Code, vérifiez que l’extension est bien installée et que le chemin vers JavaCC est correctement configuré.
------
## Mises à Jour Futures
Consultez régulièrement le dépôt GitHub pour les mises à jour du projet. De nouvelles fonctionnalités ou correctifs peuvent être ajoutés après la rédaction de ce manuel.


