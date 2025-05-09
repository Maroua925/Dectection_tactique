const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const port = 4899;
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.static("downloads"));

if (!fs.existsSync('downloads')) {
  fs.mkdirSync('downloads');
}

app.post("/upload", upload.single("textfile"), (req, res) => {
  const filePath = req.file.path;
  const tactic = req.body.tactic;
  const tacticName = req.body.tacticName || tactic.replace(/TacticGrammaire$/, '');

  if (!tactic) {
    return res.status(400).send("Aucune tactique sélectionnée");
  }

  exec(`java --enable-preview -Xss256m ${tactic} "${filePath}"`, {
    maxBuffer: 5 * 1024 * 1024
  }, (error, stdout, stderr) => {
    if (error) console.error("Erreur d'exécution :", error.message);
    if (stderr) console.error("Erreur stderr :", stderr);
    
    // Nettoyage du nom de tactique
    const cleanTacticName = tactic.replace(/TacticGrammaire$/, '');

    let javaOutputRaw = stdout || stderr;

    javaOutputRaw = javaOutputRaw
      .split('\n')
      .filter(line => !line.toLowerCase().includes("the caller of the tactic is"))
      .join('\n');

    let checkCount = 0;
    const match = javaOutputRaw.match(/Number of checks:\s*(\d+)/);
    if (match) {
      checkCount = parseInt(match[1]);
    }

    const cleanedOutput = javaOutputRaw
      .split('\n')
      .filter(line => 
        !line.trim().startsWith("Number of checks:") &&
        !line.includes("Recursive call detected in E() at line")
      )
      .join('\n');

    const lines = javaOutputRaw.split(/\r?\n/);
    const lineInfos = [];
    let tempCaller = "";
    let tempCallee = "";

    lines.forEach((line) => {
      if (line.includes("Recursive call detected") && line.includes("line")) {
        const match = line.match(/line (\d+)/);
        if (match) {
          const lineNumber = parseInt(match[1]);
          lineInfos.push({
            line: lineNumber,
            caller: tempCaller,
            callee: tempCallee,
            message: `${tempCaller}  ${tempCallee} ${line}`
          });
        }
        tempCaller = "";
        tempCallee = "";
      }
    });

    const fileContent = fs.readFileSync(filePath, "utf-8").split("\n");

    let textContent = `Résultats d'analyse - ${new Date().toLocaleString()}\n\n`;
textContent += `Tactique analysée: ${tacticName}\n`;
textContent += `Résultat: ${checkCount > 0 ? 'La tactique EXISTE dans la trace' : 'La tactique N\'EXISTE PAS dans la trace'}\n`;
textContent += `Nombre de vérifications: ${checkCount}\n\n`;
textContent += "=== Fichier analysé ===\n";

// Modification ici - Affichage simple des lignes avec numérotation
fileContent.forEach((line, index) => {
  const lineNumber = index + 1;
  textContent += `${lineNumber}: ${line}\n`;
});

textContent += "\n=== Résultats de l'analyse ===\n";
textContent += cleanedOutput;

    fs.unlinkSync(filePath);

    const filename = `resultat-${Date.now()}.txt`;
    const fullPath = `downloads/${filename}`;
    fs.writeFileSync(fullPath, textContent);

    // Création du contenu HTML pour l'affichage des traces
    const traceLines = fileContent.map((line, index) => {
      const lineNumber = index + 1;
      const match = lineInfos.find(info => info.line === lineNumber);
      const isPartOfTactic = match !== undefined;
      
      return `
        <div class="trace-line ${isPartOfTactic ? 'tactic-line' : ''}">
          <div class="line-number">${lineNumber}</div>
          <div class="line-content">
            <code>${line}</code>
            ${isPartOfTactic ? `<div class="tactic-indicator">${match.caller} → ${match.callee}</div>` : ''}
          </div>
        </div>
      `;
    }).join("");

    // Préparation du contenu pour les résultats d'analyse
    const analysisLines = cleanedOutput.split('\n').map(line => {
      // Ajout de classes de style basées sur le contenu
      let lineClass = '';
      if (line.includes('Objet') && !line.includes('ule')) {
        lineClass = 'object-line';
      } else if (line.includes('CALLER:') || line.includes('CALLEE:')) {
        lineClass = 'call-line';
      } else if (line.includes('METHOD:')) {
        lineClass = 'method-line';
      }
      
      return `<div class="analysis-line ${lineClass}"><code>${line}</code></div>`;
    }).join("");

    let resultHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Résultats d'Analyse - TraceTech</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4a6cf7;
      --primary-light: #e0e7ff;
      --primary-dark: #3b50ff;
      --success: #10b981;
      --error: #ef4444;
      --dark: #1e293b;
      --light: #f8fafc;
      --gray: #64748b;
      --border: #e2e8f0;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f9fafb;
      color: var(--dark);
      line-height: 1.5;
    }
    
    header {
      background: linear-gradient(135deg, #3b50ff 0%, #4a6cf7 100%);
      padding: 1.5rem 2.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .logo {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Forte', 'Playfair Display', cursive;
    }
    
    .logo::before {
      content: "🔍";
      font-size: 1.8rem;
    }
    
    nav {
      display: flex;
      gap: 2rem;
    }
    
    nav a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0;
      position: relative;
      transition: all 0.3s;
      font-size: 1rem;
    }
    
    nav a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: white;
      transition: width 0.3s ease;
    }
    
    nav a:hover {
      color: rgba(255, 255, 255, 0.9);
    }
    
    nav a:hover::after {
      width: 100%;
    }
    
    main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .result-header {
      margin-bottom: 2rem;
      text-align: center;
      animation: fadeIn 0.8s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 1rem;
    }
    
    .status-indicator {
      padding: 1.2rem 2.5rem;
      border-radius: 12px;
      font-size: 1.25rem;
      font-weight: 600;
      display: inline-block;
      margin: 1.2rem 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      animation: fadeIn 1s ease 0.5s both;
      transition: all 0.3s ease;
    }
    
    .status-indicator.success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .status-indicator.error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%);
      color: var(--error);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    .result-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    @media (max-width: 992px) {
      .result-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .result-panel {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
      animation: slideIn 0.8s ease;
      height: 600px;
      border: 1px solid var(--border);
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .result-panel:nth-child(2) {
      animation-delay: 0.2s;
      animation-name: slideInRight;
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .result-panel:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
    }
    
    .panel-header {
      padding: 1.5rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .panel-title {
      font-weight: 600;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .panel-title::before {
      content: attr(data-icon);
      font-size: 1.4rem;
    }
    
    .panel-content {
      height: calc(100% - 61px);
      overflow-y: auto;
      position: relative;
      scrollbar-width: thin;
      scrollbar-color: var(--primary) var(--light);
    }
    
    .panel-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .panel-content::-webkit-scrollbar-track {
      background: var(--light);
    }
    
    .panel-content::-webkit-scrollbar-thumb {
      background-color: var(--primary);
      border-radius: 20px;
    }
    
    .trace-container, .analysis-container {
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    
    .trace-line, .analysis-line {
      display: flex;
      padding: 0.25rem 0;
      transition: background-color 0.2s;
    }
    
    .trace-line:hover {
      background-color: rgba(74, 108, 247, 0.05);
    }
    
    .line-number {
      color: var(--gray);
      text-align: right;
      padding-right: 1rem;
      min-width: 3rem;
      user-select: none;
    }
    
    .line-content {
      flex-grow: 1;
      position: relative;
    }
    
    .tactic-line .line-content code {
      color: var(--primary-dark);
      font-weight: 500;
    }
    
    .tactic-indicator {
      position: absolute;
      top: -1.5rem;
      right: 0;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      background: var(--primary-light);
      color: var(--primary-dark);
      border-radius: 4px;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
    }
    
    .tactic-line:hover .tactic-indicator {
      opacity: 1;
      transform: translateY(0);
    }
    
    .object-line {
      color: var(--success);
      font-weight: 500;
    }
    
    .call-line {
      color: var(--primary);
    }
    
    .method-line {
      color: #9333ea; /* purple */
    }
    
    .stats-container {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }
    
    .stat-card {
      background: white;
      padding: 1.8rem;
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      min-width: 220px;
      animation: fadeIn 0.8s ease 0.8s both;
      border: 1px solid var(--border);
      transition: all 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(74, 108, 247, 0.15);
    }
    
    .stat-value {
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.8rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .stat-label {
      color: var(--dark);
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .actions {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin: 2.5rem 0;
    }
    
    .btn {
      padding: 1rem 2rem;
      border-radius: 50px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
      font-size: 1.1rem;
      min-width: 220px;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      box-shadow: 0 6px 16px rgba(74, 108, 247, 0.25);
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(74, 108, 247, 0.35);
    }
    
    .btn-secondary {
      background: white;
      color: var(--primary);
      border: 2px solid var(--primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .btn-secondary:hover {
      background: var(--primary-light);
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(74, 108, 247, 0.15);
    }
    
    .btn::before {
      content: attr(data-icon);
      font-size: 1.3rem;
    }
    
    footer {
      background: linear-gradient(135deg, #3b50ff 0%, #4a6cf7 100%);
      color: white;
      text-align: center;
      padding: 1.8rem;
      margin-top: 3rem;
      font-weight: 500;
    }
    
    /* Animations */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    
    .status-indicator {
      animation: pulse 2s infinite;
    }
    
    .section-transition {
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--primary), transparent);
      margin: 2.5rem 0;
      width: 100%;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">TraceTech</div>
    <nav>
      <a href="home.html">Accueil</a>
      <a href="GuideArchitectural.html">Guide Architectural</a>
      <a href="index.html">TactiqueDetector</a>
    </nav>
  </header>

  <main>
    <div class="result-header">
      <h1>Résultat de détection de la tactique ${tacticName}</h1>
      <div class="status-indicator ${checkCount > 0 ? 'success' : 'error'}">
        ${checkCount > 0 ? 
          '✅ La tactique sélectionnée EXISTE dans la trace' : 
          '❌ La tactique sélectionnée N\'EXISTE PAS dans la trace'}
      </div>
    </div>

    <div class="result-grid">
      <div class="result-panel">
        <div class="panel-header">
          <div class="panel-title" data-icon="📄">Fichier analysé</div>
        </div>
        <div class="panel-content">
          <div class="trace-container">
            ${traceLines}
          </div>
        </div>
      </div>

      <div class="result-panel">
        <div class="panel-header">
          <div class="panel-title" data-icon="📊">Résultats de l'analyse</div>
        </div>
        <div class="panel-content">
          <div class="analysis-container">
            ${analysisLines}
          </div>
        </div>
      </div>
    </div>

    <div class="section-transition"></div>

    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-value">${checkCount}</div>
        <div class="stat-label">Occurrences de tactique choisie</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fileContent.length}</div>
        <div class="stat-label">Lignes de trace</div>
      </div>
    </div>

    <div class="actions">
      <a href="/downloads/${filename}" download class="btn btn-primary" data-icon="⬇️">Télécharger les résultats</a>
      <a href="index.html" class="btn btn-secondary" data-icon="↩️">Retour à l'analyseur</a>
    </div>
  </main>

  <footer>
    &copy; 2025 TraceTech. Tous droits réservés.
  </footer>

  <script>
    // Animation pour faire apparaître les panneaux lors du défilement
    document.addEventListener('DOMContentLoaded', function() {
      const panels = document.querySelectorAll('.result-panel');
      
      // Observer pour animer les éléments quand ils deviennent visibles
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      // Observer chaque panneau
      panels.forEach(panel => {
        observer.observe(panel);
      });
      
      // Surbrillance des lignes de tactique lors du survol
      const tacticLines = document.querySelectorAll('.tactic-line');
      tacticLines.forEach(line => {
        line.addEventListener('mouseenter', () => {
          tacticLines.forEach(l => l.style.backgroundColor = 'rgba(74, 108, 247, 0.1)');
        });
        
        line.addEventListener('mouseleave', () => {
          tacticLines.forEach(l => l.style.backgroundColor = '');
        });
      });
    });
  </script>
</body>
</html>`;

    res.send(resultHTML);
  });
});

app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'downloads', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error("Erreur lors du téléchargement:", err);
        res.status(500).send("Erreur lors du téléchargement");
      }
    });
  } else {
    res.status(404).send('Fichier non trouvé');
  }
});

// Amélioration de la page d'accueil
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.listen(port, () => {
  console.log(`✅ Serveur démarré : http://localhost:${port}`);
});