// Chargement automatique de la base de données depuis le serveur réseau

let flightDatabase = [];
let dbMetadata = {};

// Au chargement de la page, essayer de charger la base de données
document.addEventListener('DOMContentLoaded', initializeDatabaseLoader);

async function initializeDatabaseLoader() {
  showLoadingBanner(true);
  
  // Essayer de charger depuis différentes sources
  const sources = [
    '/data/T4_2026.js',  // Fichier local dans le dossier
  ];

  let loaded = false;

  for (const source of sources) {
    try {
      await loadDatabaseFromSource(source);
      loaded = true;
      break;
    } catch (error) {
      console.log(`Source ${source} non disponible:`, error.message);
    }
  }

  if (!loaded) {
    // Fallback: permettre à l'utilisateur de charger manuellement
    showLoadingBanner(false);
    showMessage('⚠️ Base de données non trouvée. Chargez le fichier manuellement.', 'warning');
    setupManualDatabaseUpload();
  }
}

async function loadDatabaseFromSource(source) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          parseDatabaseContent(xhr.responseText, source);
          resolve();
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`Status ${xhr.status}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Erreur réseau'));
    };

    xhr.onprogress = function(event) {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        document.getElementById('loadingText').textContent = `Chargement... ${Math.round(percentComplete)}%`;
      }
    };

    xhr.open('GET', source, true);
    xhr.send();
  });
}

function parseDatabaseContent(content, source) {
  let data = null;

  // Cas 1: JSON pur
  try {
    data = JSON.parse(content);
  } catch {
    // Cas 2: JavaScript avec variable (ex: "const T4_2026 = {...}")
    try {
      const match = content.match(/const\s+\w+\s*=\s*(\{[\s\S]*\});?$/m) || 
                    content.match(/var\s+\w+\s*=\s*(\{[\s\S]*\});?$/m);
      if (match) {
        data = JSON.parse(match[1]);
      }
    } catch {}
  }

  if (!data) {
    throw new Error('Format de fichier non reconnu');
  }

  // Vérifier la structure attendue
  if (!data.metadata || !data.months) {
    throw new Error('Structure de fichier invalide');
  }

  flightDatabase = [];
  dbMetadata = data.metadata;

  // Aplatir les données (convertir months en liste plate)
  Object.keys(data.months).forEach(monthKey => {
    const monthFlights = data.months[monthKey];
    if (Array.isArray(monthFlights)) {
      flightDatabase.push(...monthFlights);
    }
  });

  updateDatabaseUI(source);
  populateFlightSelector();
  showLoadingBanner(false);
}

function updateDatabaseUI(source) {
  document.getElementById('dbSection').style.display = 'block';
  document.getElementById('dbFilename').textContent = source.split('/').pop() || source;
  document.getElementById('dbLastUpdate').textContent = dbMetadata.lastUpdate || 'Inconnue';
  document.getElementById('dbTotalRecords').textContent = flightDatabase.length;
  
  if (flightDatabase.length > 0) {
    const dates = flightDatabase.map(f => f.date).sort();
    document.getElementById('dbPeriod').textContent = `${dates[0]} au ${dates[dates.length - 1]}`;
  }

  showMessage(`✅ Base de données chargée: ${flightDatabase.length} vols`, 'success');
}

function populateFlightSelector() {
  const select = document.getElementById('selectFlight');
  
  // Trier les vols par date et compagnie
  const sortedFlights = [...flightDatabase].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.cie.localeCompare(b.cie);
  });

  sortedFlights.forEach((flight, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${flight.date} - ${flight.cie} ${flight.vol}`;
    select.appendChild(option);
  });
}

function handleFlightSelection() {
  const select = document.getElementById('selectFlight');
  const index = select.value;

  if (index === '') {
    document.getElementById('flightDetails').style.display = 'none';
    clearAuditForm();
    return;
  }

  const flight = flightDatabase[index];
  
  // Afficher les détails
  document.getElementById('flightDetailsDate').textContent = flight.date;
  document.getElementById('flightDetailsCie').textContent = flight.cie;
  document.getElementById('flightDetailsVol').textContent = flight.vol;
  document.getElementById('flightDetails').style.display = 'block';

  // Pré-remplir le formulaire
  document.getElementById('auditDate').value = flight.date;
  document.getElementById('auditCie').value = flight.cie;
  document.getElementById('auditVol').value = flight.vol;
  document.getElementById('auditAgent').value = flight.agent || '';
  document.getElementById('auditTso').value = flight.tso || '';
  document.getElementById('auditCheckTerrain').checked = flight.check_terrain || false;
  document.getElementById('auditCheck').checked = flight.check || false;
  document.getElementById('auditDebrief').checked = flight.debrief || false;
  document.getElementById('auditCommentaire').value = flight.commentaire || '';

  // Mettre à jour l'affichage en haut
  document.getElementById('flightDisplay').textContent = `${flight.cie} / ${flight.vol}`;
  document.getElementById('dateDisplay').textContent = flight.date;
}

function clearAuditForm() {
  document.getElementById('auditDate').value = '';
  document.getElementById('auditCie').value = '';
  document.getElementById('auditVol').value = '';
  document.getElementById('auditAgent').value = '';
  document.getElementById('auditTso').value = '';
  document.getElementById('auditCheckTerrain').checked = false;
  document.getElementById('auditCheck').checked = false;
  document.getElementById('auditDebrief').checked = false;
  document.getElementById('auditCommentaire').value = '';
  
  document.getElementById('flightDisplay').textContent = '--/-- / ----';
  document.getElementById('dateDisplay').textContent = '--/--/----';
}

function setupManualDatabaseUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.js,.json';
  input.addEventListener('change', handleManualDatabaseUpload);

  const section = document.createElement('section');
  section.innerHTML = '<h2>📂 Charger la base de données</h2><p>La base de données n\'a pas pu être chargée automatiquement.</p>';
  
  const button = document.createElement('button');
  button.textContent = '📁 Charger le fichier';
  button.type = 'button';
  button.onclick = () => input.click();
  
  section.appendChild(button);
  document.querySelector('.container').insertBefore(section, document.querySelector('section'));
}

async function handleManualDatabaseUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  showLoadingBanner(true);
  
  try {
    const content = await file.text();
    parseDatabaseContent(content, file.name);
  } catch (error) {
    showMessage(`❌ Erreur: ${error.message}`, 'error');
    showLoadingBanner(false);
  }
}

function reloadDatabase() {
  showLoadingBanner(true);
  initializeDatabaseLoader();
}

function showLoadingBanner(show) {
  const banner = document.getElementById('loadingBanner');
  if (show) {
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('validationMessages');
  messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
  document.getElementById('messageSection').style.display = 'block';
}